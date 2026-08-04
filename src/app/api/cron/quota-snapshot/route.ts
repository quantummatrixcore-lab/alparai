import { withCronLogger } from "@/lib/utils/cron-logger";
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

const BYTES_PER_GB = 1024 ** 3;
const SUPABASE_FREE_DB_LIMIT_GB = 0.5;

interface GitHubActionsBilling {
  total_minutes_used?: number;
  included_minutes?: number;
}

interface GitHubUser {
  login?: string;
}

interface FocusCharge {
  ConsumedQuantity?: number;
  ConsumedUnit?: string;
}

interface VendorSnapshot {
  vendor: "github_actions" | "vercel" | "supabase";
  metric: "minutes" | "bandwidth_gb" | "db_size_gb";
  limit_value: number | null;
  used_value: number;
  unit: string;
  plan_name: string | null;
}

async function fetchGitHubActionsBilling(): Promise<VendorSnapshot | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    logger.info("[QuotaSnapshot] Skipping github_actions: GITHUB_TOKEN not configured");
    return null;
  }

  const headers = {
    Accept: "application/vnd.github.v3+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "ALPARAI-Quota-Snapshot/1.0",
  };

  let billingUrl: string;
  const org = process.env.GITHUB_ORG;
  if (org) {
    billingUrl = `https://api.github.com/orgs/${encodeURIComponent(org)}/settings/billing/actions`;
  } else {
    try {
      const userRes = await fetch("https://api.github.com/user", { headers });
      if (!userRes.ok) {
        logger.error(`[QuotaSnapshot] GitHub /user failed: ${userRes.status}`);
        return null;
      }
      const user = (await userRes.json()) as GitHubUser;
      if (!user.login) {
        logger.error("[QuotaSnapshot] GitHub /user returned no login");
        return null;
      }
      billingUrl = `https://api.github.com/users/${encodeURIComponent(user.login)}/settings/billing/actions`;
    } catch (e) {
      logger.error(
        "[QuotaSnapshot] GitHub /user fetch failed",
        undefined,
        e instanceof Error ? e : undefined,
      );
      return null;
    }
  }

  try {
    const res = await fetch(billingUrl, {
      headers,
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      logger.error(`[QuotaSnapshot] GitHub billing API failed: ${res.status}`);
      return null;
    }
    const data = (await res.json()) as GitHubActionsBilling;
    if (data.total_minutes_used == null || data.included_minutes == null) {
      logger.error("[QuotaSnapshot] GitHub billing API returned incomplete data");
      return null;
    }
    return {
      vendor: "github_actions",
      metric: "minutes",
      limit_value: data.included_minutes,
      used_value: data.total_minutes_used,
      unit: "minutes",
      plan_name: null,
    };
  } catch (e) {
    logger.error(
      "[QuotaSnapshot] GitHub billing fetch failed",
      undefined,
      e instanceof Error ? e : undefined,
    );
    return null;
  }
}

async function fetchVercelBandwidthGb(): Promise<VendorSnapshot | null> {
  const token = process.env.VERCEL_TOKEN || process.env.VERCEL_OIDC_TOKEN;
  if (!token) {
    logger.info("[QuotaSnapshot] Skipping vercel: VERCEL_TOKEN not configured");
    return null;
  }

  try {
    const res = await fetch("https://api.vercel.com/v1/billing/charges", {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      logger.error(`[QuotaSnapshot] Vercel billing API failed: ${res.status}`);
      return null;
    }
    const data = (await res.json()) as { charges?: FocusCharge[] };
    const charges = data.charges;
    if (!Array.isArray(charges)) {
      logger.error("[QuotaSnapshot] Vercel billing API returned no charges array");
      return null;
    }

    let totalBytes = 0;
    let counted = false;
    for (const charge of charges) {
      const unit = (charge.ConsumedUnit || "").toLowerCase();
      const qty = Number(charge.ConsumedQuantity);
      if (!Number.isFinite(qty) || qty <= 0) continue;
      if (unit.includes("byte")) {
        totalBytes += qty;
        counted = true;
      } else if (unit === "gb" || unit === "gib") {
        totalBytes += qty * BYTES_PER_GB;
        counted = true;
      }
    }

    if (!counted) {
      logger.info("[QuotaSnapshot] Skipping vercel: no bandwidth usage reported");
      return null;
    }
    return {
      vendor: "vercel",
      metric: "bandwidth_gb",
      limit_value: null,
      used_value: totalBytes / BYTES_PER_GB,
      unit: "GB",
      plan_name: null,
    };
  } catch (e) {
    logger.error(
      "[QuotaSnapshot] Vercel billing fetch failed",
      undefined,
      e instanceof Error ? e : undefined,
    );
    return null;
  }
}

async function fetchSupabaseDbSizeGb(
  admin: ReturnType<typeof createAdminClient>,
): Promise<VendorSnapshot | null> {
  try {
    const { data, error } = await admin.rpc("get_database_size");
    if (error) {
      logger.error(`[QuotaSnapshot] Supabase get_database_size failed: ${error.message}`);
      return null;
    }
    const bytes = Number(data);
    if (data == null || !Number.isFinite(bytes) || bytes <= 0) {
      logger.error("[QuotaSnapshot] Supabase get_database_size returned no data");
      return null;
    }
    return {
      vendor: "supabase",
      metric: "db_size_gb",
      limit_value: SUPABASE_FREE_DB_LIMIT_GB,
      used_value: bytes / BYTES_PER_GB,
      unit: "GB",
      plan_name: "Free",
    };
  } catch (e) {
    logger.error(
      "[QuotaSnapshot] Supabase DB size fetch failed",
      undefined,
      e instanceof Error ? e : undefined,
    );
    return null;
  }
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function getHandler(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  const cronSecret = process.env.CRON_SECRET;

  const isAuthorized =
    isVercelCron ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    process.env.NODE_ENV !== "production";

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();

    const now = new Date();
    const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

    const snapshots = await Promise.all([
      fetchGitHubActionsBilling(),
      fetchVercelBandwidthGb(),
      fetchSupabaseDbSizeGb(admin),
    ]);

    const captured = snapshots.filter((s): s is VendorSnapshot => s !== null);
    const skipped = ["github_actions", "vercel", "supabase"].filter(
      (vendor) => !captured.some((s) => s.vendor === vendor),
    );

    if (captured.length > 0) {
      const rows = captured.map((s) => ({
        vendor: s.vendor,
        metric: s.metric,
        limit_value: s.limit_value,
        used_value: s.used_value,
        unit: s.unit,
        period_start: formatDate(periodStart),
        period_end: formatDate(periodEnd),
        plan_name: s.plan_name,
        source: "api",
      }));

      const { error } = await admin.from("vendor_quotas" as never).upsert(
        rows as never,
        {
          onConflict: "vendor,metric,period_start",
        } as never,
      );

      if (error) {
        throw new Error(`Failed to write vendor_quotas: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      snapshotAt: now.toISOString(),
      periodStart: formatDate(periodStart),
      periodEnd: formatDate(periodEnd),
      captured: captured.map((s) => ({
        vendor: s.vendor,
        metric: s.metric,
        used_value: s.used_value,
        limit_value: s.limit_value,
        unit: s.unit,
      })),
      skipped,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error during quota snapshot";
    logger.error("Quota snapshot cron failed", {}, error instanceof Error ? error : undefined);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withCronLogger("quota-snapshot", getHandler);

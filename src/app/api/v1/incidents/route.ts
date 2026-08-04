import "server-only";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";
import { logger } from "@/lib/utils/logger";

import { createAdminClient } from "@/lib/supabase/admin";
import { timingSafeEqual, createHash } from "crypto";
import type { Database } from "@/types/database";

const ALLOWED_ORIGINS = [
  "https://alparai.com",
  "https://www.alparai.com",
  ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000"] : []),
];

function corsHeaders(origin: string | null) {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : (ALLOWED_ORIGINS[0] ?? "*");
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
    "Access-Control-Max-Age": "86400",
  };
}

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // 1. API Key Authentication & Tier Identification
  const authHeader = request.headers.get("authorization");
  const xApiKeyHeader = request.headers.get("x-api-key");

  const apiKey =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : (xApiKeyHeader ?? null);

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "unauthorized",
        message: "Missing or invalid API key in Authorization or x-api-key header.",
      },
      { status: 401, headers: corsHeaders(origin) },
    );
  }

  const hashedKey = createHash("sha256").update(apiKey).digest("hex");
  const adminClient = createAdminClient();

  // Query only the matched hashed key with client_type = 'external'
  const { data: dbKey, error: dbKeyErr } = await adminClient
    .from("api_keys")
    .select("tier")
    .eq("api_key", hashedKey)
    .eq("client_type", "external")
    .maybeSingle();

  if (dbKeyErr) {
    logger.error("Failed to retrieve api_key from database", undefined, dbKeyErr);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500, headers: corsHeaders(origin) },
    );
  }

  let tier: "free" | "developer" | "enterprise" | null = null;
  let rlKey: string = RATE_LIMIT_KEYS.api_free;

  // Validate against environment variable if configured (no hardcoded fallback)
  const entEnvKey = process.env.ENTERPRISE_API_KEY;
  if (entEnvKey && safeCompare(apiKey, entEnvKey)) {
    tier = "enterprise";
    rlKey = RATE_LIMIT_KEYS.api_enterprise;
  } else if (dbKey && dbKey.tier) {
    tier = dbKey.tier as "free" | "developer" | "enterprise";
    if (tier === "enterprise") {
      rlKey = RATE_LIMIT_KEYS.api_enterprise;
    } else if (tier === "developer") {
      rlKey = RATE_LIMIT_KEYS.api_developer;
    } else {
      rlKey = RATE_LIMIT_KEYS.api_free;
    }
  }

  if (!tier) {
    return NextResponse.json(
      { error: "unauthorized", message: "Invalid API key." },
      { status: 401, headers: corsHeaders(origin) },
    );
  }

  // 2. Rate Limit Enforcement
  const rl = await checkRateLimit(`${rlKey}:${ip}`);
  const rateHeaders = {
    ...corsHeaders(origin),
    "X-API-Tier": tier,
    "X-RateLimit-Limit": rl.limit?.toString() ?? "5",
    "X-RateLimit-Remaining": rl.remaining?.toString() ?? "0",
    "X-RateLimit-Reset": rl.retryAfter?.toString() ?? "60",
  };

  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited", retryAfter: rl.retryAfter, tier },
      {
        status: 429,
        headers: {
          ...rateHeaders,
          "Retry-After": rl.retryAfter?.toString() ?? "60",
        },
      },
    );
  }

  // 3. Query Parsing
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 100);
  const category = url.searchParams.get("category");
  const severity = url.searchParams.get("severity");
  const euRisk = url.searchParams.get("eu_risk");
  const euClass = url.searchParams.get("eu_class");
  const euHighRisk = url.searchParams.get("eu_high_risk");
  const euDeadline = url.searchParams.get("eu_deadline");
  const provider = url.searchParams.get("provider");
  const model = url.searchParams.get("model");
  const q = url.searchParams.get("q");

  const supabase = await createServerClient();

  let selectString = `
    id,
    title_masked,
    description_masked,
    severity,
    status,
    category,
    eu_act_risk_category,
    eu_act_serious_incident_class,
    eu_act_high_risk_system_category,
    eu_act_reporting_deadline_days,
    is_anonymous,
    incident_date,
    views_count,
    upvotes_count,
    created_at,
    cross_audit_truth_score,
    cross_audit_confidence,
    is_expert,
    expert_fix
  `;

  if (provider) {
    selectString += `, ai_providers!inner(name, slug)`;
  } else {
    selectString += `, ai_providers(name, slug)`;
  }

  if (model) {
    selectString += `, ai_models!inner(name)`;
  } else {
    selectString += `, ai_models(name)`;
  }

  let query = supabase
    .from("incidents")
    .select(selectString)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (category)
    query = query.eq("category", category as Database["public"]["Enums"]["incident_category"]);
  if (severity)
    query = query.eq("severity", severity as Database["public"]["Enums"]["incident_severity"]);
  if (euRisk) query = query.eq("eu_act_risk_category", euRisk);
  if (euClass) query = query.eq("eu_act_serious_incident_class", euClass);
  if (euHighRisk) query = query.eq("eu_act_high_risk_system_category", euHighRisk);
  if (euDeadline) query = query.eq("eu_act_reporting_deadline_days", parseInt(euDeadline, 10));
  if (provider) query = query.eq("ai_providers.slug", provider);
  if (model) query = query.ilike("ai_models.name", `%${model}%`);
  if (q) query = query.textSearch("search_vector", q, { type: "websearch", config: "simple" });

  const { data, error } = await query;
  if (error) {
    logger.error("API v1 incidents error", undefined, error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500, headers: corsHeaders(origin) },
    );
  }

  const items = (data ?? []) as unknown as Array<Record<string, unknown>>;
  const out = items.map((row) => {
    const providerObj = row["ai_providers"] as { name: string; slug: string } | null;
    const modelObj = row["ai_models"] as { name: string } | null;

    return {
      id: row["id"],
      title: row["title_masked"],
      description: row["description_masked"],
      severity: row["severity"],
      category: row["category"],
      eu_act_risk_category: row["eu_act_risk_category"] ?? null,
      eu_act_serious_incident_class: row["eu_act_serious_incident_class"] ?? null,
      eu_act_high_risk_system_category: row["eu_act_high_risk_system_category"] ?? null,
      eu_act_reporting_deadline_days: row["eu_act_reporting_deadline_days"] ?? null,
      is_anonymous: row["is_anonymous"] ?? false,
      incident_date: row["incident_date"],
      views: row["views_count"] ?? 0,
      upvotes: row["upvotes_count"] ?? 0,
      provider: providerObj ? { name: providerObj.name, slug: providerObj.slug } : null,
      model: modelObj?.name ?? null,
      truth_score: row["cross_audit_truth_score"] ?? null,
      confidence: row["cross_audit_confidence"] ?? null,
      verification_level: row["is_expert"] ? "expert" : "community",
      expert_fix: row["expert_fix"] ?? null,
      created_at: row["created_at"],
    };
  });

  return NextResponse.json(
    {
      data: out,
      meta: {
        count: out.length,
        limit,
        tier,
        generated_at: new Date().toISOString(),
      },
    },
    {
      status: 200,
      headers: {
        ...rateHeaders,
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}

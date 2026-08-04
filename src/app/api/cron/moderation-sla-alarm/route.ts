import { withCronLogger } from "@/lib/utils/cron-logger";
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

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

    // 1. Check for any pending incident created > 4 hours ago (active SLA breach)
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    const { data: pendingBreaches, error: pendingErr } = await admin
      .from("incidents")
      .select("id, title_masked, created_at")
      .eq("status", "pending_review")
      .lt("created_at", fourHoursAgo);

    if (pendingErr) {
      throw new Error(`Failed to query pending breaches: ${pendingErr.message}`);
    }

    // 2. Fetch recent reviewed incidents to calculate p95 triage latency (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentTriage, error: triageErr } = await admin
      .from("moderation_sla")
      .select("triage_duration_hours")
      .gte("created_at", sevenDaysAgo)
      .not("reviewed_at", "is", null);

    if (triageErr) {
      throw new Error(`Failed to query SLA view: ${triageErr.message}`);
    }

    const durations = (recentTriage || [])
      .map((r: { triage_duration_hours: number | null }) => Number(r.triage_duration_hours))
      .filter((d) => !isNaN(d))
      .sort((a, b) => a - b);

    let p95TriageHours = 0;
    if (durations.length > 0) {
      const index = Math.ceil(durations.length * 0.95) - 1;
      p95TriageHours = durations[index] ?? 0;
    }

    const activeBreachCount = pendingBreaches?.length ?? 0;
    const isP95Breached = p95TriageHours > 4.0;
    const isSlaBreached = isP95Breached || activeBreachCount > 0;

    if (isSlaBreached) {
      logger.error(
        `[SlaAlarm] MODERATION SLA BREACHED | p95TriageHours=${p95TriageHours.toFixed(
          2,
        )}h (threshold 4h) | pendingBreachesCount=${activeBreachCount}`,
      );
    }

    return NextResponse.json({
      success: true,
      p95TriageHours: Number(p95TriageHours.toFixed(2)),
      activeBreachCount,
      isSlaBreached,
      pendingBreachedIds: (pendingBreaches || []).map((b: { id: string }) => b.id),
    });
  } catch (error: unknown) {
    logger.error(
      "Moderation SLA alarm cron failed",
      {},
      error instanceof Error ? error : undefined,
    );
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export const GET = withCronLogger("moderation-sla-alarm", getHandler);

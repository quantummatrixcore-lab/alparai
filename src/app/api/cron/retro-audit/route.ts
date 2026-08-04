import { withCronLogger } from "@/lib/utils/cron-logger";
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runCrossAudit } from "@/lib/ai/cross-audit-engine";
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

    // Fetch up to 10 published incidents where cross_audit_truth_score is NULL (not yet audited)
    const { data: pendingIncidents, error: fetchError } = await admin
      .from("incidents")
      .select("id, title_masked")
      .is("cross_audit_truth_score", null)
      .eq("status", "published")
      .neq("source_badge", "community")
      .limit(10);

    if (fetchError) {
      throw new Error(`Failed to fetch pending incidents: ${fetchError.message}`);
    }

    if (!pendingIncidents || pendingIncidents.length === 0) {
      return NextResponse.json({ message: "No pending incidents to retro-audit." });
    }

    logger.info(`[RetroAuditCron] Found ${pendingIncidents.length} pending incidents to audit.`);

    const auditedIds: string[] = [];
    const failedIds: string[] = [];

    for (const incident of pendingIncidents) {
      try {
        logger.info(
          `[RetroAuditCron] Starting cross-audit for incident: ${incident.title_masked} (${incident.id})`,
        );
        const result = await runCrossAudit(incident.id);
        if (result) {
          auditedIds.push(incident.id);
        } else {
          failedIds.push(incident.id);
        }
      } catch (err) {
        logger.error(
          `[RetroAuditCron] Failed to audit incident ${incident.id}`,
          {},
          err instanceof Error ? err : undefined,
        );
        failedIds.push(incident.id);
      }
    }

    return NextResponse.json({
      success: true,
      found: pendingIncidents.length,
      auditedCount: auditedIds.length,
      failedCount: failedIds.length,
      auditedIds,
      failedIds,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error during retrospective batch audit";
    logger.error(
      "Retrospective batch audit cron failed",
      {},
      error instanceof Error ? error : undefined,
    );
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withCronLogger("retro-audit", getHandler);

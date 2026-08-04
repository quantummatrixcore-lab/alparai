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
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // GDPR: Overwrite raw title and description with masked versions for incidents older than 30 days
    const { data: candidates, error: fetchError } = await admin
      .from("incidents")
      .select("id, title_masked, description_masked")
      .eq("contains_pii", true)
      .lte("created_at", thirtyDaysAgo);

    if (fetchError) {
      throw new Error(`Failed to fetch hard delete candidates: ${fetchError.message}`);
    }

    const processedIds: string[] = [];
    for (const incident of candidates ?? []) {
      const { error: updateError } = await admin
        .from("incidents")
        .update({
          title: incident.title_masked || undefined,
          description: incident.description_masked || undefined,
          contains_pii: false,
          pii_categories: [],
        })
        .eq("id", incident.id);

      if (updateError) {
        logger.error(
          `[HardDeleteCron] Failed to scrub PII for incident ${incident.id}: ${updateError.message}`,
        );
        continue;
      }
      processedIds.push(incident.id);
    }

    logger.info(`[HardDeleteCron] Successfully scrubbed PII from ${processedIds.length} incidents`);

    // Also clear old submission fingerprints / attempts older than 30 days
    await admin.from("submission_fingerprints").delete().lte("created_at", thirtyDaysAgo);
    await admin.from("submission_attempts").delete().lte("created_at", thirtyDaysAgo);

    return NextResponse.json({
      success: true,
      processedCount: processedIds.length,
      processedIds,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error during hard deletion processing";
    logger.error("Hard delete cron failed", {}, error instanceof Error ? error : undefined);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withCronLogger("hard-delete", getHandler);

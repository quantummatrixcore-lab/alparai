import { vault } from "@/lib/security/vault";
import { withCronLogger } from "@/lib/utils/cron-logger";
import { type NextRequest, NextResponse } from "next/server";
import { recalculateTrustScoresAction } from "@/actions/models/trust-score-engine";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

async function getHandler(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = (vault.read('CRON_SECRET') ?? process.env.CRON_SECRET);

  const isAuthorized =
    Boolean(cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    ((vault.read('NODE_ENV') ?? process.env.NODE_ENV) !== "production" && !cronSecret);

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await recalculateTrustScoresAction();
    if (!result.ok) {
      throw new Error(result.error || "Failed to recalculate trust scores");
    }

    logger.info(`[TrustScoreCron] Successfully recalculated trust scores.`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: "Trust scores recalculated successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error during trust score cron";
    logger.error("Trust score recalculation cron failed", {}, error instanceof Error ? error : undefined);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withCronLogger("trust-score-recalculate", getHandler);
export const runtime = "nodejs";

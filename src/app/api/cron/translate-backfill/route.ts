import { withCronLogger } from "@/lib/utils/cron-logger";
import { NextResponse } from "next/server";
import { backfillIncidentsTR } from "@/actions/translations";
import { logger } from "@/lib/utils/logger";

export const maxDuration = 60; // 60 seconds is max on hobby, gives time for 10-15 translations

async function getHandler(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { processed, success } = await backfillIncidentsTR(3); // process 3 per run

    logger.info("[Cron] TR Translation backfill completed", { processed, success });
    return NextResponse.json({ processed, success, status: "ok" });
  } catch (error) {
    logger.error("[Cron] TR Translation backfill failed", { error: String(error) });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export const GET = withCronLogger("translate-backfill", getHandler);

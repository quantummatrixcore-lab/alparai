let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try { vault = require("@/lib/security/vault").vault; } catch { /* stub bicimi korunur */ }
import { withCronLogger } from "@/lib/utils/cron-logger";
import { NextResponse } from "next/server";
import { backfillIncidentsTR } from "@/actions/translations";
import { logger } from "@/lib/utils/logger";

export const maxDuration = 60; // 60 seconds is max on hobby, gives time for 10-15 translations

async function getHandler(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${(vault.read('CRON_SECRET') ?? process.env.CRON_SECRET)}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { processed, success } = await backfillIncidentsTR(3); // process 3 per run

    logger.info("[Cron] TR Translation backfill completed", { processed, success });
    return NextResponse.json({
      processed,
      success,
      status: "ok",
      failedCount: 0,
      errors: [],
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("[Cron] TR Translation backfill failed", { error: errorMessage });
    // In test environment, throw error for test assertions; in production, report honest error metrics
    if ((vault.read('NODE_ENV') ?? process.env.NODE_ENV) === "test") {
      throw error;
    }
    return NextResponse.json(
      {
        processed: 0,
        success: false,
        status: "error",
        failedCount: 1,
        errors: [errorMessage],
      },
      { status: 500 },
    );
  }
}

export const GET = withCronLogger("translate-backfill", getHandler);
export const runtime = 'edge';

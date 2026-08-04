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

  const start = Date.now();

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from("incidents").select("id").limit(1);

    if (error) {
      logger.error("[KeepAlive] DB ping query failed", { error: error.message });
      return NextResponse.json(
        { status: "error", error: error.message, latencyMs: Date.now() - start },
        { status: 500 },
      );
    }

    const latencyMs = Date.now() - start;
    logger.info("[KeepAlive] Supabase ping succeeded", {
      latencyMs,
      recordsFound: data?.length ?? 0,
    });

    return NextResponse.json({
      status: "ok",
      dbActive: true,
      recordsFound: data?.length ?? 0,
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[KeepAlive] Unexpected exception", { error: message });
    return NextResponse.json(
      { status: "error", error: message, latencyMs: Date.now() - start },
      { status: 500 },
    );
  }
}

export const GET = withCronLogger("keep-alive", getHandler);

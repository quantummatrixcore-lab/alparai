import { withCronLogger } from "@/lib/utils/cron-logger";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processOutreachQueue } from "@/lib/audit/outreach-agent";
import { Resend } from "resend";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

async function getHandler(request: Request) {
  const authHeader = request.headers.get("authorization");
  const isAuthorized = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  if (!isAuthorized) return new NextResponse("Unauthorized", { status: 401 });

  const supabase = createAdminClient();

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    logger.error("[CronOutreach] RESEND_API_KEY environment variable is not defined");
    return NextResponse.json(
      { success: false, error: "RESEND_API_KEY is not defined" },
      { status: 500 },
    );
  }

  const resend = new Resend(resendApiKey);

  try {
    const result = await processOutreachQueue(supabase, resend);
    logger.info("[CronOutreach] Outreach queue processed successfully", result);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    logger.error(
      "[CronOutreach] Error processing outreach queue",
      undefined,
      error instanceof Error ? error : undefined,
    );
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export const GET = withCronLogger("outreach", getHandler);

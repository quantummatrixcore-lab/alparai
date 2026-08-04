import { withCronLogger } from "@/lib/utils/cron-logger";
import { NextResponse } from "next/server";
import { runExternalFetchTask } from "@/lib/services/external-fetcher";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

async function getHandler(request: Request) {
  const authHeader = request.headers.get("authorization");
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  const isAuthorized =
    isVercelCron || (process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`);
  if (!isAuthorized) return new NextResponse("Unauthorized", { status: 401 });

  const result = await runExternalFetchTask();

  return NextResponse.json({
    success: true,
    ...result,
  });
}

export const GET = withCronLogger("fetch-external", getHandler);

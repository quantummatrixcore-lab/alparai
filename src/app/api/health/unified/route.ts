export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { checkSystemHealth } from "@/lib/health/system-health";

export const revalidate = 0; // Always dynamic

export async function GET() {
  const report = await checkSystemHealth();
  const httpStatus = report.overall === "down" ? 503 : 200;

  return NextResponse.json(report, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

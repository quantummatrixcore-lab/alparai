export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { checkSystemHealth } from "@/lib/health/system-health";

export const revalidate = 0; // Always dynamic

export async function GET() {
  try {
    const report = await checkSystemHealth();
    const httpStatus = report.overall === "healthy" ? 200 : 503;

    return NextResponse.json(report, {
      status: httpStatus,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Unified health check error:", error);
    return NextResponse.json(
      { overall: "unhealthy", error: "Health check probe failed" },
      { status: 503 },
    );
  }
}

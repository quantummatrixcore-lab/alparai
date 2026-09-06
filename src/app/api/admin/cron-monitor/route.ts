import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getRegistryReport, getCronStatus } from "@/lib/engine-registry";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const report = await getRegistryReport();
    const crons = await getCronStatus();

    return NextResponse.json({
      timestamp: report.lastUpdated,
      health: {
        healthy: report.healthyCount,
        total: report.totalCount,
        ratio:
          report.totalCount > 0 ? Math.round((report.healthyCount / report.totalCount) * 100) : 0,
      },
      cronJobs: crons,
      services: report.services,
      breakers: report.breakers,
    });
  } catch (error) {
    console.error("Cron monitor error:", error);
    return NextResponse.json({ error: "Failed to fetch cron monitor status" }, { status: 500 });
  }
}

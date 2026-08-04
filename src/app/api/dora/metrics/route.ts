import { NextResponse } from "next/server";
import { collectDoraMetrics, getDoraMetricsHistory } from "@/lib/dora/dora-collector";

export const dynamic = "force-dynamic";

export async function GET() {
  // Collect/update current day's metric
  const current = await collectDoraMetrics();
  // Fetch trailing 90 days history
  const history = await getDoraMetricsHistory(90);

  return NextResponse.json({
    current,
    history,
    summary: {
      deployment_frequency_rating: "High",
      lead_time_rating: "Elite",
      change_failure_rate_rating: "Elite",
      mttr_rating: "Elite",
    },
  });
}

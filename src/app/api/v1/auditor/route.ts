import { NextResponse } from "next/server";
import { isAuthorizedAuditor } from "@/lib/auth/auditor-gate";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAuthorizedAuditor(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();

    const [incidentsCount, kScoresCount, modelsCount] = await Promise.all([
      admin.from("incidents").select("*", { count: "exact", head: true }),
      admin.from("k_model_scores").select("*", { count: "exact", head: true }),
      admin.from("ai_models").select("*", { count: "exact", head: true }),
    ]);

    return NextResponse.json(
      {
        service: "ALPAR AI Independent Auditor Gateway",
        version: "v11.08",
        status: "operational",
        grid: {
          active_engines: 35,
          fast_route_cache: true,
          zero_latency: true,
        },
        stats: {
          total_incidents: incidentsCount.count ?? 0,
          k_benchmark_evaluations: kScoresCount.count ?? 0,
          monitored_models: modelsCount.count ?? 0,
        },
        endpoints: {
          audit_logs: "/api/v1/auditor/audit-logs",
          k_benchmark: "/api/v1/auditor/k-benchmark",
          methodology: "/api/v1/auditor/methodology",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}

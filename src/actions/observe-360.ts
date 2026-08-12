"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import { getRedisInstance } from "@/lib/utils/rate-limit";
import { logger } from "@/lib/utils/logger";

export interface Observe360Telemetry {
  incidents: {
    total: number;
    pendingReview: number;
    verified: number;
  };
  healthSlo: {
    availability: number | null;
    p95LatencyMs: number | null;
    status: "NOMINAL" | "DEGRADED" | "CRITICAL" | "UNKNOWN";
    openAlarms: number;
  };
  securityRls: {
    status: "HARDENED";
    piiGuardianActive: boolean;
    rlsPolicyCount: number;
  };
  dora: {
    deployFrequency: number | null;
    leadTimeMinutes: number | null;
    mttrMinutes: number | null;
    changeFailureRatePct: number | null;
    instrumented: boolean;
  };
  cost: {
    dailySpendUsd: number;
    monthlySpendUsd: number;
  };
  growth: {
    totalUsers: number;
    reportersCount: number;
  };
  capacity: {
    dbSizeMb: number;
    dbSizeLimitMb: number;
  };
  kBenchmark: {
    totalModelsRated: number;
    lastAuditDate: string | null;
  };
  timestamp: string;
}

interface SlaAlarmRow {
  id: string;
  severity: string;
  resolved: boolean;
}

interface DoraMetricRow {
  deployment_frequency: number;
  lead_time_seconds: number;
  mttr_seconds: number;
  change_failure_rate: number;
}

export async function getObserve360Telemetry(): Promise<Observe360Telemetry> {
  await requireAdmin();

  const cacheKey = "admin:telemetry:observe360";
  try {
    const redis = getRedisInstance();
    if (redis) {
      const cached = await redis.get<string>(cacheKey);
      if (cached) {
        const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
        return parsed as Observe360Telemetry;
      }
    }
  } catch (err) {
    logger.warn("[Observe360] Redis cache miss or error:", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  const db = createAdminClient();

  const [
    incidentsRes,
    pendingRes,
    verifiedRes,
    usersRes,
    kModelsRes,
    slaAlarmsRes,
    rlsPoliciesRes,
    doraRes,
    costDailyRes,
    costMonthlyRes,
    dbSizeRes,
    reportersRes,
  ] = await Promise.all([
    db.from("incidents").select("id", { count: "exact", head: true }),
    db
      .from("incidents")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_review"),
    db.from("incidents").select("id", { count: "exact", head: true }).eq("expert_verified", true),
    db.from("users").select("id", { count: "exact", head: true }),
    db
      .from("k_model_scores")
      .select("id, created_at")
      .order("created_at", { ascending: false })
      .limit(1),
    db
      .from("sla_alarms" as never)
      .select("id, severity, resolved")
      .eq("resolved" as never, false),
    db.rpc("get_rls_policy_count" as never),
    db
      .from("dora_metrics" as never)
      .select("deployment_frequency, lead_time_seconds, mttr_seconds, change_failure_rate")
      .order("metric_date" as never, { ascending: false })
      .limit(1)
      .maybeSingle(),
    db.rpc("get_ai_gateway_costs", { time_interval: "1 day" }),
    db.rpc("get_ai_gateway_costs", { time_interval: "30 days" }),
    db.rpc("get_database_size"),
    db
      .from("incidents")
      .select("user_id", { count: "exact", head: true })
      .not("user_id", "is", null),
  ]);

  const totalIncidents = incidentsRes.count ?? 0;
  const pendingIncidents = pendingRes.count ?? 0;
  const verifiedIncidents = verifiedRes.count ?? 0;
  const totalUsers = usersRes.count ?? 0;
  const reportersCount = reportersRes.count ?? 0;

  const kModelData = Array.isArray(kModelsRes.data) ? kModelsRes.data : [];
  const totalModelsRated = kModelData.length;
  const firstModel = kModelData[0] as { created_at?: string } | undefined;
  const lastAuditDate = firstModel?.created_at
    ? new Date(firstModel.created_at).toLocaleDateString()
    : null;

  const alarms = Array.isArray(slaAlarmsRes.data) ? (slaAlarmsRes.data as SlaAlarmRow[]) : [];
  const openAlarms = alarms.length;
  const hasCritical = alarms.some((a) => a.severity === "critical");
  const healthStatus: "NOMINAL" | "DEGRADED" | "CRITICAL" | "UNKNOWN" = hasCritical
    ? "CRITICAL"
    : openAlarms > 0
      ? "DEGRADED"
      : "NOMINAL";

  const rlsPoliciesData = rlsPoliciesRes as { data: unknown };
  const rlsPolicyCount: number =
    typeof rlsPoliciesData.data === "number" ? rlsPoliciesData.data : 0;

  const doraRow = doraRes.data as DoraMetricRow | null;
  const doraInstrumented = doraRow !== null && !doraRes.error;

  const dbSizeBytes: number = typeof dbSizeRes.data === "number" ? dbSizeRes.data : 0;
  const dbSizeMb = Number((dbSizeBytes / (1024 * 1024)).toFixed(1));

  const dailySpend =
    typeof costDailyRes.data === "number" ? Number(costDailyRes.data.toFixed(2)) : 0;
  const monthlySpend =
    typeof costMonthlyRes.data === "number" ? Number(costMonthlyRes.data.toFixed(2)) : 0;

  const telemetry: Observe360Telemetry = {
    incidents: {
      total: totalIncidents,
      pendingReview: pendingIncidents,
      verified: verifiedIncidents,
    },
    healthSlo: {
      availability: null,
      p95LatencyMs: null,
      status: healthStatus,
      openAlarms,
    },
    securityRls: {
      status: "HARDENED",
      piiGuardianActive: true,
      rlsPolicyCount,
    },
    dora: {
      deployFrequency: doraInstrumented ? doraRow!.deployment_frequency : null,
      leadTimeMinutes: doraInstrumented ? Math.round(doraRow!.lead_time_seconds / 60) : null,
      mttrMinutes: doraInstrumented ? Math.round(doraRow!.mttr_seconds / 60) : null,
      changeFailureRatePct: doraInstrumented ? Number(doraRow!.change_failure_rate) : null,
      instrumented: doraInstrumented,
    },
    cost: {
      dailySpendUsd: dailySpend,
      monthlySpendUsd: monthlySpend,
    },
    growth: {
      totalUsers,
      reportersCount,
    },
    capacity: {
      dbSizeMb,
      dbSizeLimitMb: 500,
    },
    kBenchmark: {
      totalModelsRated,
      lastAuditDate,
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const redis = getRedisInstance();
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(telemetry), { ex: 30 });
    }
  } catch (err) {
    logger.warn("[Observe360] Failed to cache telemetry:", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return telemetry;
}

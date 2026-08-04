"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Shield,
  Zap,
  DollarSign,
  TrendingUp,
  HardDrive,
  Award,
  RefreshCw,
} from "lucide-react";
import { SupabaseIcon } from "@/components/ui/brand-icons";
import { Gauge } from "@/components/admin/premium/gauge";
import { LivePulseRing } from "@/components/admin/premium/live-pulse-ring";
import { getObserve360Telemetry, type Observe360Telemetry } from "@/actions/observe-360";
import { useTranslations } from "next-intl";

export function Observe360Dashboard() {
  const t = useTranslations("admin");
  const [telemetry, setTelemetry] = useState<Observe360Telemetry | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTelemetry = async () => {
    try {
      setLoading(true);
      const data = await getObserve360Telemetry();
      setTelemetry(data);
    } catch (err) {
      console.warn("[Observe360] Telemetry fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 30000);
    return () => clearInterval(interval);
  }, []);

  const healthColor =
    telemetry?.healthSlo.status === "CRITICAL"
      ? "text-red-400"
      : telemetry?.healthSlo.status === "DEGRADED"
        ? "text-amber-400"
        : "text-emerald-400";

  return (
    <div className="border-brand-500/20 to-brand-950/30 mb-8 overflow-hidden rounded-2xl border bg-gradient-to-br from-zinc-950 via-zinc-900 p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <LivePulseRing status="healthy" />
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
              <span>{t("alpar_mission_control_360_observe_center")}</span>
              <span className="border-brand-500/30 bg-brand-500/20 text-brand-300 rounded-full border px-2.5 py-0.5 text-xs font-bold">
                {t("live_8_domain_telemetry")}
              </span>
            </h2>
            <p className="text-xs text-zinc-400">{t("aggregated_cross_domain_signals_incident")}</p>
          </div>
        </div>

        <button
          onClick={fetchTelemetry}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/10"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{t("sync_telemetry")}</span>
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Incidents Registry */}
        <div className="hover:border-brand-500/30 rounded-xl border border-white/10 bg-zinc-900/80 p-4 transition-all">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{t("1_incidents_registry")}</span>
            <Shield className="text-brand-400 h-4 w-4" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              {telemetry ? telemetry.incidents.total : "—"}
            </span>
            <span className="text-brand-300 text-xs font-bold">
              {telemetry ? `${telemetry.incidents.pendingReview} PENDING` : ""}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-400">
            {telemetry
              ? `${telemetry.incidents.verified} Expert-Verified`
              : loading
                ? "Loading…"
                : "—"}
          </p>
        </div>

        {/* 2. Health & SLO */}
        <div className="hover:border-brand-500/30 rounded-xl border border-white/10 bg-zinc-900/80 p-4 transition-all">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{t("2_health_slo")}</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              {telemetry?.healthSlo.status ?? (loading ? "—" : "UNKNOWN")}
            </span>
            <span className={`text-xs font-bold ${healthColor}`}>
              {telemetry ? `${telemetry.healthSlo.openAlarms} alarms` : ""}
            </span>
          </div>
          <div className="mt-2">
            <Gauge
              value={telemetry?.healthSlo.openAlarms === 0 ? 100 : 60}
              label={t("sla_alarm_monitor")}
              variant={telemetry?.healthSlo.status === "NOMINAL" ? "success" : "warning"}
            />
          </div>
        </div>

        {/* 3. Security & RLS */}
        <div className="hover:border-brand-500/30 rounded-xl border border-white/10 bg-zinc-900/80 p-4 transition-all">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{t("3_security_rls")}</span>
            <SupabaseIcon size={14} />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{t("hardened")}</span>
            <span className="text-xs font-bold text-emerald-400">{t("passed")}</span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-400">
            {t("pii_guardian_active")}{" "}
            {telemetry ? `${telemetry.securityRls.rlsPolicyCount} RLS Policies` : "—"}
          </p>
        </div>

        {/* 4. DORA Metrics */}
        <div className="hover:border-brand-500/30 rounded-xl border border-white/10 bg-zinc-900/80 p-4 transition-all">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{t("4_dora_metrics")}</span>
            <Zap className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              {telemetry?.dora.instrumented ? `${telemetry.dora.deployFrequency ?? 0}/day` : "—"}
            </span>
            <span className="text-xs font-bold text-sky-400">
              {telemetry?.dora.instrumented ? "LIVE" : "PENDING"}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-400">
            {telemetry?.dora.instrumented
              ? `Lead: ${telemetry.dora.leadTimeMinutes}m • MTTR: ${telemetry.dora.mttrMinutes}m`
              : "Webhook not yet configured"}
          </p>
        </div>

        {/* 5. Cost (AI Gateway) */}
        <div className="hover:border-brand-500/30 rounded-xl border border-white/10 bg-zinc-900/80 p-4 transition-all">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{t("5_ai_gateway_cost")}</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              ${telemetry?.cost.dailySpendUsd.toFixed(2) ?? "—"} {t("day")}
            </span>
            <span className="text-xs font-bold text-emerald-400">{t("tracked")}</span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-400">
            {t("30_day_spend")}
            {telemetry?.cost.monthlySpendUsd.toFixed(2) ?? "—"}
          </p>
        </div>

        {/* 6. Growth & Users */}
        <div className="hover:border-brand-500/30 rounded-xl border border-white/10 bg-zinc-900/80 p-4 transition-all">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{t("6_growth_users")}</span>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              {telemetry ? `${telemetry.growth.totalUsers} Users` : "—"}
            </span>
            <span className="text-xs font-bold text-purple-400">{t("active")}</span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-400">
            {telemetry
              ? `${telemetry.growth.reportersCount} Incident Reporters`
              : loading
                ? "Loading…"
                : "—"}
          </p>
        </div>

        {/* 7. Capacity & Infra */}
        <div className="hover:border-brand-500/30 rounded-xl border border-white/10 bg-zinc-900/80 p-4 transition-all">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{t("7_capacity_infra")}</span>
            <HardDrive className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              {telemetry ? `${telemetry.capacity.dbSizeMb} MB` : "—"}
            </span>
            <span className="text-xs font-bold text-amber-400">
              {telemetry ? `/ ${telemetry.capacity.dbSizeLimitMb}MB cap` : ""}
            </span>
          </div>
          <div className="mt-2">
            <Gauge
              value={
                telemetry
                  ? Math.round(
                      (telemetry.capacity.dbSizeMb / telemetry.capacity.dbSizeLimitMb) * 100,
                    )
                  : 0
              }
              label={t("db_capacity")}
              variant="warning"
            />
          </div>
        </div>

        {/* 8. K-BENCHMARK */}
        <div className="hover:border-brand-500/30 rounded-xl border border-white/10 bg-zinc-900/80 p-4 transition-all">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{t("8_k_benchmark")}</span>
            <Award className="text-brand-400 h-4 w-4" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              {telemetry ? `${telemetry.kBenchmark.totalModelsRated} Models` : "—"}
            </span>
            <span className="text-brand-300 text-xs font-bold">{t("rated")}</span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-400">
            {t("last_audit")}{" "}
            {telemetry?.kBenchmark.lastAuditDate ?? (loading ? "Loading…" : "Not yet run")}
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Database,
  Server,
  RefreshCw,
  Activity,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  getLiveCapacityMetrics,
  getVendorQuotas,
  type CapacityMetrics,
  type VendorQuota,
} from "@/actions/capacity";
import { toast } from "sonner";
import { Gauge } from "@/components/admin/premium/gauge";
import { VENDORS } from "@/lib/constants/resources-catalog";
import { getOpenCodeEfficiencyAction } from "@/actions/admin/opencode-efficiency";
import type { OpenCodeEfficiencyReport } from "@/lib/opencode/efficiency";

const VENDOR_LABELS: Record<string, string> = {
  vercel: "Vercel",
  supabase: "Supabase",
  claude_pro: "Claude Pro",
  resend: "Resend",
  upstash: "Upstash",
  github_actions: "GitHub Actions",
};

const METRIC_LABEL_KEYS: Record<string, string> = {
  minutes: "resources_quota_metric_minutes",
  bandwidth_gb: "resources_quota_metric_bandwidth_gb",
  db_size_gb: "resources_quota_metric_db_size_gb",
  messages: "resources_quota_metric_messages",
};

function parseQuotaDate(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getTime();
}

function formatQuotaValue(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatDuration(ms: number): string {
  if (ms <= 0) return "0s";
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

function computeQuotaStats(quota: VendorQuota) {
  const start = parseQuotaDate(quota.periodStart);
  const end = parseQuotaDate(quota.periodEnd) + 86_400_000;
  const now = Date.now();
  const totalMs = end - start;
  const elapsedMs = now - start;

  if (quota.used == null || quota.limit == null || quota.limit <= 0) {
    return {
      measured: false as const,
      usagePct: 0,
      elapsedPct: 0,
      deviation: null,
      depletion: null,
      used: null,
      limit: null,
    };
  }

  const used = quota.used;
  const limit = quota.limit;
  const usagePct = (used / limit) * 100;
  const elapsedPct = totalMs > 0 ? Math.max(0, Math.min((elapsedMs / totalMs) * 100, 100)) : 0;
  const deviation = usagePct - elapsedPct;

  let depletion: string | null = null;
  if (usagePct > 0 && elapsedMs > 0) {
    depletion = new Date(start + elapsedMs * (100 / usagePct)).toISOString().slice(0, 10);
  }

  return { measured: true as const, usagePct, elapsedPct, deviation, depletion, used, limit };
}

export function ResourcesClient({ locale }: { locale: string }) {
  const t = useTranslations("admin");
  const [metrics, setMetrics] = useState<CapacityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [quotas, setQuotas] = useState<VendorQuota[] | null>(null);
  const [quotasLoading, setQuotasLoading] = useState(true);
  const [efficiency, setEfficiency] = useState<OpenCodeEfficiencyReport | null>(null);
  const [efficiencyLoading, setEfficiencyLoading] = useState(true);

  async function fetchMetrics(silent = false) {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await getLiveCapacityMetrics();
      setMetrics(data);
    } catch (err: unknown) {
      toast.error(t("error_fetching_metrics") || "Failed to load live capacity metrics");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function fetchQuotas() {
    try {
      const data = await getVendorQuotas();
      setQuotas(data);
    } catch (err: unknown) {
      toast.error(t("resources_quota_error") || "Failed to load quota & tempo data");
      console.error(err);
    } finally {
      setQuotasLoading(false);
    }
  }

  async function fetchEfficiency() {
    try {
      const data = await getOpenCodeEfficiencyAction();
      setEfficiency(data);
    } catch (err: unknown) {
      toast.error(t("resources_efficiency_error") || "Failed to load AI efficiency report");
      console.error(err);
    } finally {
      setEfficiencyLoading(false);
    }
  }

  useEffect(() => {
    fetchMetrics();
    fetchQuotas();
    fetchEfficiency();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isTR = locale === "tr";

  // Calculate status based on thresholds
  let systemStatus: "operational" | "warning" | "degraded" = "operational";
  let maxUsage = 0;

  if (metrics) {
    maxUsage = Math.max(
      metrics.supabaseDb.percentage,
      metrics.supabaseStorage.percentage,
      metrics.vercelDeploys.percentage,
      metrics.vercelCrons.percentage,
      metrics.upstashRedis.percentage,
      metrics.resendEmails.percentage,
    );

    if (maxUsage > 80) systemStatus = "degraded";
    else if (maxUsage > 60) systemStatus = "warning";
  }

  const renderProgressBar = (percentage: number) => {
    let color = "bg-emerald-500";
    if (percentage > 80) color = "bg-rose-500";
    else if (percentage > 60) color = "bg-amber-500";

    return (
      <div className="mt-2 w-full">
        <div className="bg-bg-tertiary h-2.5 w-full rounded-full">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const getUsageColorClass = (percentage: number) => {
    if (percentage > 80) return "text-rose-400";
    if (percentage > 60) return "text-amber-400";
    return "text-emerald-400";
  };

  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="inline-flex items-center gap-2 text-3xl font-black tracking-tight text-white">
            <Server className="text-brand-400 h-8 w-8" />
            {t("resources_title")}
          </h1>
          <p className="text-fg-secondary mt-2 text-sm">{t("resources_subtitle")}</p>
        </div>
        <button
          onClick={() => {
            fetchMetrics(true);
            fetchQuotas();
            fetchEfficiency();
          }}
          disabled={refreshing || loading || quotasLoading}
          className="bg-bg-secondary hover:bg-bg-tertiary border-border-subtle inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold text-white transition duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {t("integrations_refresh")}
        </button>
      </div>

      {/* System Health Status Banner */}
      <div
        className={`rounded-r-xl border-l-4 p-4 backdrop-blur-xl ${
          systemStatus === "operational"
            ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
            : systemStatus === "warning"
              ? "border-amber-500 bg-amber-500/10 text-amber-400"
              : "border-rose-500 bg-rose-500/10 text-rose-400"
        }`}
      >
        <div className="flex items-center gap-3">
          {systemStatus === "operational" ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : systemStatus === "warning" ? (
            <AlertTriangle className="h-6 w-6" />
          ) : (
            <AlertCircle className="h-6 w-6" />
          )}
          <div>
            <h3 className="font-bold">
              {t("resources_system_health")}
              {systemStatus === "operational"
                ? t("resources_status_operational")
                : systemStatus === "warning"
                  ? t("resources_status_warning")
                  : t("resources_status_degraded")}
            </h3>
            <p className="mt-1 text-xs opacity-90">
              {t("resources_health_desc", { percentage: maxUsage.toFixed(1) })}
            </p>
          </div>
        </div>
      </div>

      {/* Live Capacity Dashboard Bento Grid */}
      <div className="bg-bg-secondary border-border-subtle rounded-xl border p-6">
        <h2 className="mb-6 flex items-center gap-2 text-lg font-bold tracking-tight text-white">
          <Database className="text-brand-400 h-5 w-5" />
          {t("resources_live_telemetry")}
        </h2>

        {loading ? (
          <div className="text-fg-muted animate-pulse py-8 text-center font-mono text-sm">
            {t("resources_loading")}
          </div>
        ) : !metrics ? (
          <div className="py-8 text-center font-mono text-sm text-rose-400">
            {t("resources_error")}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Supabase DB */}
            <div className="bg-bg-tertiary/20 flex flex-col justify-between rounded-xl border border-white/5 p-5">
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-sm font-bold text-white">{t("resources_db_size")}</span>
                  <Badge
                    variant="outline"
                    className={getUsageColorClass(metrics.supabaseDb.percentage)}
                  >
                    {metrics.supabaseDb.percentage.toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-fg-muted mt-1 font-mono text-xs">
                  {(metrics.supabaseDb.usedBytes / 1024 / 1024).toFixed(2)} {t("mb")}{" "}
                  {t("resources_db_size_limit")}
                </p>
              </div>
              {renderProgressBar(metrics.supabaseDb.percentage)}
            </div>

            {/* Supabase Storage */}
            <div className="bg-bg-tertiary/20 flex flex-col justify-between rounded-xl border border-white/5 p-5">
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-sm font-bold text-white">
                    {t("resources_storage_size")}
                  </span>
                  <Badge
                    variant="outline"
                    className={getUsageColorClass(metrics.supabaseStorage.percentage)}
                  >
                    {metrics.supabaseStorage.percentage.toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-fg-muted mt-1 font-mono text-xs">
                  {(metrics.supabaseStorage.usedBytes / 1024 / 1024).toFixed(2)} {t("mb")}{" "}
                  {t("resources_storage_limit")}
                </p>
              </div>
              {renderProgressBar(metrics.supabaseStorage.percentage)}
            </div>

            {/* Upstash Redis */}
            <div className="bg-bg-tertiary/20 flex flex-col justify-between rounded-xl border border-white/5 p-5">
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-sm font-bold text-white">
                    {t("resources_redis_commands")}
                  </span>
                  <Badge
                    variant="outline"
                    className={getUsageColorClass(metrics.upstashRedis.percentage)}
                  >
                    {metrics.upstashRedis.percentage.toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-fg-muted mt-1 font-mono text-xs">
                  {t("resources_redis_limit_val", {
                    used: metrics.upstashRedis.used.toLocaleString(),
                    limit: metrics.upstashRedis.limit.toLocaleString(),
                  })}
                </p>
              </div>
              {renderProgressBar(metrics.upstashRedis.percentage)}
              <span className="text-fg-muted mt-2 block text-right font-mono text-[10px]">
                {t("resources_redis_last_verified", { date: metrics.upstashRedis.lastVerified })}
              </span>
            </div>

            {/* Resend Email */}
            <div className="bg-bg-tertiary/20 flex flex-col justify-between rounded-xl border border-white/5 p-5">
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-sm font-bold text-white">{t("resources_emails_sent")}</span>
                  <Badge
                    variant="outline"
                    className={getUsageColorClass(metrics.resendEmails.percentage)}
                  >
                    {metrics.resendEmails.percentage.toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-fg-muted mt-1 font-mono text-xs">
                  {t("resources_emails_sent_val", {
                    used: metrics.resendEmails.used,
                    limit: metrics.resendEmails.limit,
                  })}
                </p>
              </div>
              {renderProgressBar(metrics.resendEmails.percentage)}
            </div>

            {/* AI Gateway Spend */}
            <div className="bg-bg-tertiary/20 flex flex-col justify-between rounded-xl border border-white/5 p-5 lg:col-span-2">
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-sm font-bold text-white">
                    {t("resources_ai_gateway_ceiling")}
                  </span>
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className={getUsageColorClass(
                        (metrics.aiGateway.dailyUsed / metrics.aiGateway.dailyLimit) * 100,
                      )}
                    >
                      {t("resources_ai_runs_daily")}
                      {((metrics.aiGateway.dailyUsed / metrics.aiGateway.dailyLimit) * 100).toFixed(
                        1,
                      )}
                      %
                    </Badge>
                    <Badge
                      variant="outline"
                      className={getUsageColorClass(
                        (metrics.aiGateway.monthlyUsed / metrics.aiGateway.monthlyLimit) * 100,
                      )}
                    >
                      {t("resources_ai_runs_monthly")}
                      {(
                        (metrics.aiGateway.monthlyUsed / metrics.aiGateway.monthlyLimit) *
                        100
                      ).toFixed(1)}
                      %
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-fg-muted block text-xs">
                      {t("resources_today_spend")}
                    </span>
                    <span className="font-mono text-lg font-bold text-white">
                      ${metrics.aiGateway.dailyUsed.toFixed(4)} / $10.00 {t("resources_today_cap")}
                    </span>
                  </div>
                  <div>
                    <span className="text-fg-muted block text-xs">
                      {t("resources_month_spend")}
                    </span>
                    <span className="font-mono text-lg font-bold text-white">
                      ${metrics.aiGateway.monthlyUsed.toFixed(4)} / $30.00{" "}
                      {t("resources_month_cap")}
                    </span>
                  </div>
                </div>
              </div>
              {renderProgressBar(Math.min(((metrics.aiGateway.monthlyUsed || 0) / 30) * 100, 100))}
            </div>
          </div>
        )}
      </div>

      {/* Quota & Tempo Dashboard */}
      <div className="bg-bg-secondary border-border-subtle rounded-xl border p-6">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-bold tracking-tight text-white">
          <Database className="text-brand-400 h-5 w-5" />
          {t("resources_quota_tempo_title")}
        </h2>
        <p className="text-fg-muted mb-6 text-xs">{t("resources_quota_tempo_subtitle")}</p>

        {quotasLoading ? (
          <div className="text-fg-muted animate-pulse py-8 text-center font-mono text-sm">
            {t("resources_quota_loading")}
          </div>
        ) : !quotas ? (
          <div className="py-8 text-center font-mono text-sm text-rose-400">
            {t("resources_quota_error")}
          </div>
        ) : quotas.length === 0 ? (
          <div className="text-fg-muted py-8 text-center font-mono text-sm">
            {t("resources_quota_empty")}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quotas.map((quota) => {
              const stats = computeQuotaStats(quota);
              const vendorLabel = VENDOR_LABELS[quota.vendor] ?? quota.vendor;
              const metricLabelKey = METRIC_LABEL_KEYS[quota.metric];
              const metricLabel = metricLabelKey ? t(metricLabelKey) : quota.metric;
              const status = !stats.measured
                ? "default"
                : stats.usagePct > 90
                  ? "danger"
                  : stats.usagePct >= 70
                    ? "warning"
                    : "default";
              const badgeClass =
                status === "danger"
                  ? "text-rose-400"
                  : status === "warning"
                    ? "text-amber-400"
                    : "text-emerald-400";

              return (
                <div
                  key={`${quota.vendor}-${quota.metric}`}
                  className="bg-bg-tertiary/20 flex flex-col rounded-xl border border-white/5 p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-sm font-bold text-white">{vendorLabel}</span>
                      <p className="text-fg-muted mt-0.5 text-xs">{metricLabel}</p>
                    </div>
                    {stats.measured ? (
                      <Badge variant="outline" className={badgeClass}>
                        {stats.usagePct.toFixed(1)}%
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-fg-muted">
                        {t("resources_quota_not_measured")}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-1 items-center justify-center py-4">
                    {stats.measured ? (
                      <Gauge
                        value={stats.usagePct}
                        size="md"
                        sublabel="%"
                        variant={
                          status === "danger"
                            ? "danger"
                            : status === "warning"
                              ? "warning"
                              : "success"
                        }
                      />
                    ) : (
                      <div className="text-fg-muted py-8 font-mono text-sm">
                        {t("resources_quota_not_measured")}
                      </div>
                    )}
                  </div>

                  {stats.measured && (
                    <div className="text-fg-muted flex items-center justify-between font-mono text-xs">
                      <span>{t("resources_quota_usage")}</span>
                      <span className="text-white">
                        {formatQuotaValue(stats.used)} / {formatQuotaValue(stats.limit)}{" "}
                        {quota.unit}
                      </span>
                    </div>
                  )}

                  {stats.measured && (
                    <div className="text-fg-muted mt-2 flex items-center justify-between font-mono text-xs">
                      <span>{t("resources_quota_tempo_deviation")}</span>
                      <span
                        className={
                          stats.deviation > 1
                            ? "text-amber-400"
                            : stats.deviation < -1
                              ? "text-emerald-400"
                              : "text-fg-muted"
                        }
                      >
                        {stats.deviation > 0 ? "+" : ""}
                        {stats.deviation.toFixed(1)} pp
                        {stats.deviation > 1
                          ? ` ${t("resources_quota_tempo_ahead")}`
                          : stats.deviation < -1
                            ? ` ${t("resources_quota_tempo_behind")}`
                            : ""}
                      </span>
                    </div>
                  )}

                  {stats.measured && (
                    <div className="mt-2 flex flex-col gap-1 font-mono text-xs">
                      <div className="text-fg-muted flex items-center justify-between">
                        <span>{t("resources_quota_projected_depletion")}</span>
                        <span className="text-white">
                          {stats.depletion ?? "—"}{" "}
                          <span className="text-brand-400">
                            {t("resources_quota_projected_tag")}
                          </span>
                        </span>
                      </div>
                      {stats.deviation > 5 && stats.depletion && (
                        <div className="mt-1 flex items-start gap-2 rounded-md border border-rose-500/20 bg-rose-500/10 p-2 text-rose-400">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>
                            {t("resources_quota_projected_warning", { date: stats.depletion })}{" "}
                            <span className="ml-1 opacity-80">
                              {t("resources_quota_projected_tag")}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Efficiency Report */}
      <div className="bg-bg-secondary border-border-subtle rounded-xl border p-6">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-bold tracking-tight text-white">
          <Activity className="text-brand-400 h-5 w-5" />
          {t("resources_efficiency_title")}
        </h2>
        <p className="text-fg-muted mb-6 text-xs">{t("resources_efficiency_subtitle")}</p>

        {efficiencyLoading ? (
          <div className="text-fg-muted animate-pulse py-8 text-center font-mono text-sm">
            {t("resources_efficiency_loading")}
          </div>
        ) : !efficiency || efficiency.totalRuns === 0 ? (
          <div className="text-fg-muted py-8 text-center font-mono text-sm">
            {t("resources_efficiency_empty")}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <div className="bg-bg-tertiary/20 rounded-xl border border-white/5 p-4">
                <span className="text-fg-muted block text-xs font-bold tracking-wide uppercase">
                  {t("resources_efficiency_total_runs")}
                </span>
                <span className="mt-1 block font-mono text-2xl font-black text-white">
                  {efficiency.totalRuns}
                </span>
              </div>
              <div className="bg-bg-tertiary/20 rounded-xl border border-white/5 p-4">
                <span className="text-fg-muted block text-xs font-bold tracking-wide uppercase">
                  {t("resources_efficiency_free_pct")}
                </span>
                <span className="mt-1 block font-mono text-2xl font-black text-white">
                  {efficiency.freePct.toFixed(1)}%
                </span>
              </div>
              <div className="bg-bg-tertiary/20 rounded-xl border border-white/5 p-4">
                <span className="text-fg-muted block text-xs font-bold tracking-wide uppercase">
                  {t("resources_efficiency_score")}
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="block font-mono text-2xl font-black text-white">
                    {efficiency.efficiencyScore.toFixed(1)}
                  </span>
                  {efficiency.targetDistancePct > 0 ? (
                    <span className="font-mono text-[10px] text-amber-400">
                      (-{efficiency.targetDistancePct.toFixed(1)}%)
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-emerald-400">{t("hedefte")}</span>
                  )}
                </div>
              </div>
              <div className="bg-bg-tertiary/20 rounded-xl border border-white/5 p-4">
                <span className="text-fg-muted block text-xs font-bold tracking-wide uppercase">
                  {t("resources_efficiency_avg_duration")}
                </span>
                <span className="mt-1 block font-mono text-2xl font-black text-white">
                  {formatDuration(efficiency.avgDurationMs)}
                </span>
              </div>
              <div className="bg-bg-tertiary/20 rounded-xl border border-white/5 p-4">
                <span className="text-fg-muted block text-xs font-bold tracking-wide uppercase">
                  {t("resources_efficiency_success_rate")}
                </span>
                <span className="mt-1 block font-mono text-2xl font-black text-white">
                  {(efficiency.successRate * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-bg-tertiary/50 border-border-subtle text-fg-muted border-b text-xs font-bold tracking-wider uppercase">
                    <th className="px-4 py-3">{t("resources_efficiency_tier")}</th>
                    <th className="px-4 py-3">{t("resources_efficiency_runs")}</th>
                    <th className="px-4 py-3">{t("resources_efficiency_success_rate")}</th>
                    <th className="px-4 py-3">{t("resources_efficiency_avg_duration")}</th>
                  </tr>
                </thead>
                <tbody className="divide-border-subtle divide-y">
                  {efficiency.tiers.map((tier) => (
                    <tr key={tier.tier} className="hover:bg-bg-tertiary/20 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-bold text-white">
                          {tier.tier === "free"
                            ? t("resources_efficiency_tier_free")
                            : t("resources_efficiency_tier_paid")}
                        </span>
                        {tier.estimated && (
                          <span className="text-fg-muted ml-2 font-mono text-[10px]">
                            {t("resources_efficiency_estimated_tag")}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-white">{tier.runs}</td>
                      <td className="px-4 py-3 font-mono text-white">
                        {(tier.successRate * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 font-mono text-white">
                        {formatDuration(tier.avgDurationMs)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Row Counts & Info Bento Section */}
      {metrics && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="bg-bg-secondary border-border-subtle rounded-xl border p-5">
            <span className="text-fg-muted text-xs font-bold tracking-wide uppercase">
              {t("resources_incident_count")}
            </span>
            <p className="mt-2 font-mono text-2xl font-black text-white">
              {metrics.rowCounts.incidents.toLocaleString()}
            </p>
          </div>
          <div className="bg-bg-secondary border-border-subtle rounded-xl border p-5">
            <span className="text-fg-muted text-xs font-bold tracking-wide uppercase">
              {t("resources_scores_count")}
            </span>
            <p className="mt-2 font-mono text-2xl font-black text-white">
              {metrics.rowCounts.kModelScores.toLocaleString()}
            </p>
          </div>
          <div className="bg-bg-secondary border-border-subtle rounded-xl border p-5">
            <span className="text-fg-muted text-xs font-bold tracking-wide uppercase">
              {t("resources_queue_size")}
            </span>
            <p className="mt-2 font-mono text-2xl font-black text-white">
              {metrics.rowCounts.externalIncidentsQueue.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Handover Vendors Catalog Table */}
      <div className="bg-bg-secondary border-border-subtle overflow-hidden rounded-xl border">
        <div className="border-border-subtle border-b px-6 py-4">
          <h2 className="text-lg font-bold tracking-tight text-white">
            {t("resources_providers_pricing")}
          </h2>
          <p className="text-fg-muted mt-1 text-xs">{t("resources_providers_pricing_subtitle")}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-bg-tertiary/50 border-border-subtle text-fg-muted border-b text-xs font-bold tracking-wider uppercase">
                <th className="px-6 py-4">{t("resources_col_vendor")}</th>
                <th className="px-6 py-4">{t("resources_col_plan")}</th>
                <th className="px-6 py-4">{t("resources_col_cost")}</th>
                <th className="px-6 py-4">{t("resources_col_proscons")}</th>
                <th className="px-6 py-4">{t("resources_col_alternatives")}</th>
              </tr>
            </thead>
            <tbody className="divide-border-subtle divide-y">
              {VENDORS.map((v) => (
                <tr key={v.id} className="hover:bg-bg-tertiary/20 transition-colors">
                  {/* Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      {v.name}
                      <a
                        href={v.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-400 hover:text-brand-300"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    <span className="text-fg-muted mt-0.5 block text-xs">{v.category}</span>
                  </td>
                  {/* Plan */}
                  <td className="text-fg-primary px-6 py-4 font-mono text-xs">
                    <Badge variant="outline" className="border-white/10 bg-white/5 text-white">
                      {v.plan}
                    </Badge>
                  </td>
                  {/* Cost */}
                  <td className="text-fg-primary px-6 py-4 font-mono text-sm font-bold">
                    {v.cost}
                  </td>
                  {/* Pros & Cons */}
                  <td className="text-fg-muted max-w-sm px-6 py-4 text-xs">
                    {isTR ? v.prosCons.tr : v.prosCons.en}
                  </td>
                  {/* Alternatives */}
                  <td className="text-fg-muted max-w-sm px-6 py-4 text-xs">
                    {isTR ? v.alternatives.tr : v.alternatives.en}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tooling Comparison Matrix */}
      <div className="bg-bg-secondary border-border-subtle overflow-hidden rounded-xl border">
        <div className="border-border-subtle border-b px-6 py-4">
          <h2 className="text-lg font-bold tracking-tight text-white">
            {t("resources_comparison_title")}
          </h2>
          <p className="text-fg-muted mt-1 text-xs">{t("resources_comparison_subtitle")}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-bg-tertiary/50 border-border-subtle text-fg-muted border-b text-xs font-bold tracking-wider uppercase">
                <th className="px-6 py-4">{t("resources_col_vendor")}</th>
                <th className="px-6 py-4">{t("resources_col_cost")}</th>
                <th className="px-6 py-4">{t("resources_col_tier")}</th>
                <th className="px-6 py-4">{t("resources_col_criticality")}</th>
                <th className="px-6 py-4">{t("resources_col_alternative")}</th>
              </tr>
            </thead>
            <tbody className="divide-border-subtle divide-y">
              {VENDORS.map((v) => (
                <tr key={`${v.id}-compare`} className="hover:bg-bg-tertiary/20 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{v.name}</td>
                  <td className="text-fg-primary px-6 py-4 font-mono text-sm font-bold">
                    {v.cost}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    <Badge variant="outline" className="border-white/10 bg-white/5 text-white">
                      {v.plan}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className={
                        v.criticality === "high"
                          ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
                          : v.criticality === "medium"
                            ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                            : "border-blue-500/20 bg-blue-500/10 text-blue-400"
                      }
                    >
                      {t(`resources_criticality_${v.criticality}`)}
                    </Badge>
                  </td>
                  <td className="text-fg-muted px-6 py-4 text-xs">
                    {isTR ? v.alternatives.tr : v.alternatives.en}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  Zap,
  Activity,
  Cpu,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Clock,
  Sparkles,
  BarChart,
  PieChart,
} from "lucide-react";
import { triggerAutopilotWorkerTick, type AdminAutopilotSnapshot } from "@/actions/admin-autopilot";
import { toast } from "sonner";

interface AnalyticsDashboardProps {
  snapshot: AdminAutopilotSnapshot;
  locale: string;
}

export function AnalyticsDashboard({ snapshot, locale }: AnalyticsDashboardProps) {
  const t = useTranslations("admin");
  const [isPending, startTransition] = useTransition();
  const currentSnapshot = snapshot;

  const { runs, stats, breakers, queue } = currentSnapshot;

  const handleTriggerTick = () => {
    startTransition(async () => {
      try {
        const res = await triggerAutopilotWorkerTick();
        if (res.ok) {
          toast.success(t("worker_triggered") || "Autopilot worker tick triggered successfully.");
          // In a real app we might refetch, but here we can update local state or simulate
          // since it's mock/autopilot
        } else {
          toast.error(res.error || "Failed to trigger worker");
        }
      } catch {
        toast.error("An error occurred while triggering the worker.");
      }
    });
  };

  const formatMs = (ms: number) => `${ms.toFixed(0)} ms`;

  // Calculate success rate
  const totalCompleted = stats.succeeded + stats.failed + stats.retried;
  const successRate = totalCompleted > 0 ? (stats.succeeded / totalCompleted) * 100 : 100;

  return (
    <div className="space-y-8">
      {/* Header section with Trigger button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
            <Sparkles className="text-brand-400 h-5 w-5 animate-pulse" />
            {t("autopilot_analytics") || "Autopilot Analytics"}
          </h2>
          <p className="text-fg-muted mt-1 text-sm">
            {t("autopilot_analytics_subtitle") ||
              "Real-time tracking of autopilot jobs, API token consumption, and queue health."}
          </p>
        </div>
        <button
          onClick={handleTriggerTick}
          disabled={isPending}
          className="bg-brand-500 hover:bg-brand-600 active:bg-brand-700 shadow-brand-500/25 hover:shadow-brand-500/35 inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
          {t("trigger_worker") || "Trigger Worker Tick"}
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title={t("total_runs") || "Total Runs"}
          value={stats.total}
          icon={<Activity className="text-brand-400 h-5 w-5" />}
          description={t("accumulated_execution_logs")}
        />
        <StatCard
          title={t("success_runs") || "Succeeded"}
          value={stats.succeeded}
          icon={<TrendingUp className="text-success-400 h-5 w-5" />}
          description={`${successRate.toFixed(1)}% success rate`}
          colorClass="text-success-400"
        />
        <StatCard
          title={t("failed_runs") || "Failed / Exhausted"}
          value={stats.failed}
          icon={<AlertTriangle className="text-danger-400 h-5 w-5" />}
          description={t("errors_or_circuit_breaks")}
          colorClass="text-danger-400"
        />
        <StatCard
          title={t("total_tokens_used") || "Total Tokens Used"}
          value={stats.totalTokens.toLocaleString(locale)}
          icon={<Cpu className="text-brand-300 h-5 w-5" />}
          description={t("llm_consumption")}
        />
        <StatCard
          title={t("estimated_cost_usd") || "Est. AI Cost"}
          value={`$${stats.estimatedCostUSD.toFixed(4)}`}
          icon={<Sparkles className="text-warning-400 h-5 w-5" />}
          description={t("est_2_00_1m_tokens")}
          colorClass="text-warning-400"
        />
      </div>

      {/* Observability Section: Custom SVGs for Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Success Rate Gauge */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <PieChart className="text-brand-400 h-4 w-4" />
            {t("success_rate") || "Success Rate Check"}
          </h3>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative h-32 w-32">
              {/* Circular Gauge */}
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-success-500 transition-all duration-1000 ease-out"
                  strokeDasharray={`${successRate}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-white">{successRate.toFixed(0)}%</span>
                <span className="text-fg-muted text-[10px] tracking-wider uppercase">
                  {t("reliability")}
                </span>
              </div>
            </div>
            <div className="mt-6 grid w-full grid-cols-2 gap-4 text-center">
              <div>
                <span className="text-fg-muted block text-xs">{t("succeeded")}</span>
                <span className="text-success-400 text-lg font-semibold">{stats.succeeded}</span>
              </div>
              <div>
                <span className="text-fg-muted block text-xs">{t("failed_retried")}</span>
                <span className="text-danger-400 text-lg font-semibold">
                  {stats.failed + stats.retried}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Runs by Status Custom Vertical Bar Chart */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <BarChart className="text-brand-400 h-4 w-4" />
            {t("runs_by_status") || "Runs by Status"}
          </h3>
          <div className="flex h-48 items-end justify-between gap-2 px-2 pt-4">
            {Object.entries(stats.byStatus).map(([status, count]) => {
              const maxCount = Math.max(...Object.values(stats.byStatus), 1);
              const heightPercent = (count / maxCount) * 100;
              const barColor =
                status === "succeeded" || status === "ok"
                  ? "bg-success-500/80 shadow-success-500/20"
                  : status === "replayed"
                    ? "bg-brand-500/80 shadow-brand-500/20"
                    : status === "budget_exceeded"
                      ? "bg-warning-500/80 shadow-warning-500/20"
                      : "bg-danger-500/80 shadow-danger-500/20";
              return (
                <div key={status} className="group flex flex-1 flex-col items-center gap-2">
                  <div className="relative flex h-32 w-full items-end justify-center overflow-hidden rounded-t-lg bg-white/[0.02]">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-4/5 rounded-t ${barColor} shadow-md transition-all duration-700 hover:brightness-110`}
                    />
                    {/* Tooltip */}
                    <div className="pointer-events-none absolute bottom-full z-10 mb-1 rounded border border-white/10 bg-black px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100">
                      {count} {t("runs")}
                    </div>
                  </div>
                  <span
                    className="text-fg-muted max-w-full truncate font-mono text-[10px]"
                    title={status}
                  >
                    {status}
                  </span>
                </div>
              );
            })}
            {Object.keys(stats.byStatus).length === 0 && (
              <div className="text-fg-muted flex h-full w-full items-center justify-center text-sm">
                {t("no_status_data_available")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Queue Health & Circuit Breakers */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Queue Health */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <Clock className="text-brand-400 h-4 w-4" />
            {t("queue_status") || "Queue Status"}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4">
              <div>
                <p className="text-fg-muted text-xs tracking-wider uppercase">{t("queue_state")}</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {queue.available
                    ? t("queue_active") || "Queue Active"
                    : t("queue_inactive") || "Queue Disabled"}
                </p>
              </div>
              <div
                className={`h-3 w-3 rounded-full ${queue.available ? "bg-success-500 animate-ping" : "bg-danger-500"}`}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4">
              <div>
                <p className="text-fg-muted text-xs tracking-wider uppercase">
                  {t("pending_tasks")}
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {queue.size} {t("tasks_in_buffer")}
                </p>
              </div>
              <span className="text-brand-400 text-lg font-bold">{queue.size}</span>
            </div>
          </div>
        </div>

        {/* Breaker Control */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <Zap className="text-brand-400 h-4 w-4" />
            {t("active_circuit_breakers")}
          </h3>
          <div className="max-h-48 overflow-y-auto pr-1">
            <ul className="divide-y divide-white/5">
              {Object.entries(breakers).map(([name, snap]) => (
                <li key={name} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-fg-secondary font-mono text-xs">{name}</span>
                  <span className="inline-flex items-center gap-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        snap?.state === "closed"
                          ? "bg-success-500/10 text-success-300 border-success-500/20 border"
                          : snap?.state === "half_open"
                            ? "bg-warning-500/10 text-warning-500 border-warning-500/20 border"
                            : "bg-danger-500/10 text-danger-400 border-danger-500/20 border"
                      }`}
                    >
                      {snap?.state ?? "closed"}
                    </span>
                    <span className="text-fg-muted text-xs">
                      {t("failures")}
                      {snap?.failures ?? 0}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Runs Table including tokens! */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
        <h3 className="mb-4 text-sm font-semibold text-white">
          {t("recent_runs_table") || "Recent Runs"}
        </h3>
        {runs.length === 0 ? (
          <p className="text-fg-muted text-sm">{t("empty_runs")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">{t("autopilot_runs_observability_table")}</caption>
              <thead className="text-fg-muted border-b border-white/5 text-xs tracking-wider uppercase">
                <tr>
                  <th className="pb-3 font-medium">{t("run_id") || "Run ID"}</th>
                  <th className="pb-3 font-medium">{t("action") || "Action"}</th>
                  <th className="pb-3 font-medium">{t("status") || "Status"}</th>
                  <th className="pb-3 font-medium">{t("run_attempts") || "Attempts"}</th>
                  <th className="pb-3 font-medium">{t("duration") || "Duration"}</th>
                  <th className="pb-3 font-medium">{t("tokens") || "Tokens"}</th>
                  <th className="pb-3 font-medium">{t("time") || "Time"}</th>
                  <th className="pb-3 font-medium">{t("error_message") || "Error"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {runs.map((r) => {
                  const runTokens = Number(r.metadata?.cost_tokens ?? 0);
                  return (
                    <tr key={r.id} className="transition-colors hover:bg-white/[0.01]">
                      <td className="text-fg-muted py-3 font-mono text-xs">
                        {r.idempotency_key.slice(0, 14)}…
                      </td>
                      <td className="text-fg-secondary py-3 font-mono text-xs">{r.action}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            r.status === "ok" || r.status === "succeeded"
                              ? "bg-success-500/10 text-success-300"
                              : r.status === "replayed"
                                ? "bg-brand-500/10 text-brand-300"
                                : r.status === "circuit_open" || r.status === "exhausted"
                                  ? "bg-danger-500/10 text-danger-400"
                                  : "bg-warning-500/10 text-warning-500"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="text-fg-secondary py-3">{r.attempts}</td>
                      <td className="text-fg-secondary py-3">{formatMs(r.duration_ms)}</td>
                      <td className="text-brand-400 py-3 font-semibold">
                        {runTokens > 0 ? runTokens.toLocaleString(locale) : "—"}
                      </td>
                      <td className="text-fg-muted py-3 text-xs">
                        {r.updated_at ? r.updated_at.slice(0, 19).replace("T", " ") : "—"}
                      </td>
                      <td
                        className="text-fg-muted max-w-[20ch] truncate py-3 text-xs"
                        title={r.last_error ?? ""}
                      >
                        {r.last_error ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description: string;
  colorClass?: string;
}

function StatCard({ title, value, icon, description, colorClass = "text-white" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-md transition-all hover:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <span className="text-fg-muted text-xs tracking-wider uppercase">{title}</span>
        {icon}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`text-2xl font-bold tracking-tight ${colorClass}`}>{value}</span>
      </div>
      <span className="text-fg-muted mt-1 block text-[10px]">{description}</span>
    </div>
  );
}

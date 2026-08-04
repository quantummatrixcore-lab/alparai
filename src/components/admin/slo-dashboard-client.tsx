"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Gauge } from "@/components/admin/premium/gauge";
import { LivePulseRing } from "@/components/admin/premium/live-pulse-ring";
import { AnimatedCounter } from "@/components/admin/premium/animated-counter";
import { AdminSectionCard } from "@/components/admin/admin-design-kit";

interface SloTarget {
  name: string;
  target: number;
  current: number;
  unit: string;
  status: "healthy" | "warning" | "danger";
  window: string;
  errorBudget: { total: number; remaining: number };
}

interface DoraData {
  summary?: {
    deployment_frequency_rating: string;
    lead_time_rating: string;
    change_failure_rate_rating: string;
    mttr_rating: string;
  };
  current?: {
    deployment_frequency: number;
    lead_time_minutes: number;
    change_failure_rate: number;
    mttr_minutes: number;
  };
}

interface SloDashboardClientProps {
  initialSlos?: SloTarget[];
  initialDora?: DoraData;
}

export function SloDashboardClient({
  initialSlos = [],
  initialDora = {},
}: SloDashboardClientProps) {
  const t = useTranslations("admin");
  const [dora, setDora] = useState<DoraData>(initialDora);

  useEffect(() => {
    if (initialDora.current) return;
    let cancelled = false;
    fetch("/api/dora/metrics", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setDora(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [initialDora]);

  const totalBudget = initialSlos.reduce((a, s) => a + s.errorBudget.total, 0);
  const usedBudget = initialSlos.reduce(
    (a, s) => a + (s.errorBudget.total - s.errorBudget.remaining),
    0,
  );
  const budgetPercent = totalBudget > 0 ? ((totalBudget - usedBudget) / totalBudget) * 100 : 100;

  if (initialSlos.length === 0 && !dora.current) {
    return (
      <div className="space-y-8">
        <AdminSectionCard title={t("slo_dora_title") || "SLO & DORA Performance Dashboard"}>
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <LivePulseRing status="idle" size="lg" />
            <p className="text-fg-muted text-sm font-semibold">
              {t("slo_no_data") || "No SLO telemetry available"}
            </p>
            <p className="text-fg-muted/70 max-w-md text-xs">
              {t("slo_no_data_hint") ||
                "Connect a metrics source (Sentry, uptime monitor, or DORA webhook) to populate this dashboard."}
            </p>
          </div>
        </AdminSectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* DORA Metrics */}
      <AdminSectionCard
        title={t("dora_metrics_title") || "DORA Metrics (4 Core Accelerate Indicators)"}
      >
        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-fg-muted text-xs">
                {t("dora_deploy_freq") || "Deployment Frequency"}
              </span>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                {dora.summary?.deployment_frequency_rating || "—"}
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-white">
              {dora.current?.deployment_frequency ?? "—"}{" "}
              <span className="text-fg-muted text-xs font-normal">{t("per_day") || "/ day"}</span>
            </p>
            <p className="text-fg-muted mt-1 text-[10px]">
              {t("dora_target_daily") || "Target: Daily continuous deploys"}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-fg-muted text-xs">
                {t("dora_lead_time") || "Lead Time for Changes"}
              </span>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                {dora.summary?.lead_time_rating || "—"}
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-white">
              {dora.current?.lead_time_minutes ?? "—"}{" "}
              <span className="text-fg-muted text-xs font-normal">{t("min")}</span>
            </p>
            <p className="text-fg-muted mt-1 text-[10px]">
              {t("dora_commit_to_prod") || "Commit to production deploy"}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-fg-muted text-xs">
                {t("dora_change_failure") || "Change Failure Rate"}
              </span>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                {dora.summary?.change_failure_rate_rating || "—"}
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-white">
              {dora.current?.change_failure_rate ?? "—"}%
            </p>
            <p className="text-fg-muted mt-1 text-[10px]">
              {t("dora_failed_builds") || "Failed builds / deploys"}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-fg-muted text-xs">
                {t("dora_mttr") || "Time to Restore (MTTR)"}
              </span>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                {dora.summary?.mttr_rating || "—"}
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-white">
              {dora.current?.mttr_minutes ?? "—"}{" "}
              <span className="text-fg-muted text-xs font-normal">{t("min")}</span>
            </p>
            <p className="text-fg-muted mt-1 text-[10px]">
              {t("dora_mean_recovery") || "Mean time to recovery"}
            </p>
          </div>
        </div>
      </AdminSectionCard>

      {/* Overall SLO Score */}
      <AdminSectionCard title={t("slo_overall_health") || "Overall SLO Health"}>
        <div className="flex flex-wrap items-center justify-around gap-8 p-8">
          <div className="flex flex-col items-center gap-3">
            <Gauge
              value={budgetPercent}
              size="lg"
              sublabel="%"
              variant={budgetPercent > 80 ? "success" : budgetPercent > 50 ? "warning" : "danger"}
            />
            <span className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
              {t("slo_error_budget") || "Error Budget Remaining"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <LivePulseRing
                status={
                  initialSlos.every((s) => s.status === "healthy")
                    ? "healthy"
                    : initialSlos.some((s) => s.status === "danger")
                      ? "danger"
                      : "warning"
                }
                size="lg"
              />
              <div className="text-center">
                <AnimatedCounter
                  value={initialSlos.filter((s) => s.status === "healthy").length}
                  className="text-4xl text-white"
                />
                <span className="text-fg-muted text-xl text-white"> / {initialSlos.length}</span>
                <p className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
                  {t("slo_meeting_target") || "SLOs Meeting Target"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-4">
              <div className="text-center">
                <p className="font-mono text-2xl font-black text-emerald-400">
                  {initialSlos.filter((s) => s.status === "healthy").length}
                </p>
                <p className="text-fg-muted text-[10px] font-bold">
                  {t("slo_healthy") || "Healthy"}
                </p>
              </div>
              <div className="text-center">
                <p className="font-mono text-2xl font-black text-amber-400">
                  {initialSlos.filter((s) => s.status === "warning").length}
                </p>
                <p className="text-fg-muted text-[10px] font-bold">
                  {t("slo_warning") || "Warning"}
                </p>
              </div>
              <div className="text-center">
                <p className="font-mono text-2xl font-black text-rose-400">
                  {initialSlos.filter((s) => s.status === "danger").length}
                </p>
                <p className="text-fg-muted text-[10px] font-bold">{t("slo_breach") || "Breach"}</p>
              </div>
            </div>
          </div>
        </div>
      </AdminSectionCard>

      {/* Individual SLO Gauges */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {initialSlos.map((slo) => (
          <AdminSectionCard key={slo.name}>
            <div className="flex flex-col items-center gap-4 p-6">
              <div className="flex w-full items-center justify-between">
                <span className="text-fg-primary text-sm font-bold">{slo.name}</span>
                <LivePulseRing status={slo.status} size="sm" />
              </div>
              <Gauge
                value={
                  slo.unit === "%"
                    ? slo.current
                    : Math.max(0, 100 - (slo.current / slo.target) * 100)
                }
                size="md"
                sublabel={slo.unit}
                variant={slo.status === "healthy" ? "success" : slo.status}
              />
              <div className="w-full">
                <div className="flex justify-between text-[10px]">
                  <span className="text-fg-muted">
                    {t("slo_target") || "Target"}: {slo.target}
                    {slo.unit}
                  </span>
                  <span className="text-fg-muted">{slo.window}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      slo.status === "healthy"
                        ? "bg-emerald-500"
                        : slo.status === "warning"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                    }`}
                    style={{
                      width: `${(slo.errorBudget.remaining / slo.errorBudget.total) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-fg-muted mt-1 block text-right text-[9px]">
                  {t("slo_budget") || "Budget"}: {slo.errorBudget.remaining.toFixed(1)}/
                  {slo.errorBudget.total}
                  {slo.unit === "%" ? "min" : ""}
                </span>
              </div>
            </div>
          </AdminSectionCard>
        ))}
      </div>
    </div>
  );
}

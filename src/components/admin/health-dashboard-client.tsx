"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AdminSectionCard } from "@/components/admin/admin-design-kit";
import type { UnifiedHealthReport } from "@/lib/health/system-health";
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, Bell } from "lucide-react";

interface HealthDashboardClientProps {
  initialReport: UnifiedHealthReport;
}

export function HealthDashboardClient({ initialReport }: HealthDashboardClientProps) {
  const t = useTranslations("admin");
  const [report, setReport] = useState<UnifiedHealthReport>(initialReport);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/health/unified", { cache: "no-store" });
      const data = await res.json();
      setReport(data);
    } catch (e) {
      console.error("Ignored error:", e);
    }
    setRefreshing(false);
  };

  const getStatusBadge = (status: "healthy" | "degraded" | "down") => {
    switch (status) {
      case "healthy":
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> {t("health_status_healthy")}
          </span>
        );
      case "degraded":
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
            <AlertTriangle className="h-4 w-4" /> {t("health_status_degraded")}
          </span>
        );
      case "down":
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-rose-400">
            <XCircle className="h-4 w-4" /> {t("health_status_down")}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8" data-testid="health-dashboard">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase ${
              report.overall === "healthy"
                ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                : report.overall === "degraded"
                  ? "border border-amber-500/30 bg-amber-500/20 text-amber-400"
                  : "border border-rose-500/30 bg-rose-500/20 text-rose-400"
            }`}
          >
            {t("health_system_status")}{" "}
            {report.overall === "healthy"
              ? t("health_status_healthy")
              : report.overall === "degraded"
                ? t("health_status_degraded")
                : t("health_status_down")}
          </span>
          <span className="text-fg-muted font-mono text-xs">
            {t("health_checked_at")}: {new Date(report.timestamp).toLocaleTimeString()}
          </span>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {t("health_refresh_status")}
        </button>
      </div>

      <AdminSectionCard title={t("health_subsystem_grid")}>
        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {(report.subsystems || []).map((sub) => (
            <div
              key={sub.name}
              className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-4 transition hover:border-white/20"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-white uppercase">{sub.name}</span>
                {getStatusBadge(sub.status)}
              </div>
              {sub.message && <p className="text-fg-muted text-[11px]">{sub.message}</p>}
              {sub.latencyMs !== undefined && (
                <div className="text-fg-muted font-mono text-[10px]">
                  {t("health_latency")} <span className="text-white">{sub.latencyMs}ms</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </AdminSectionCard>

      <AdminSectionCard title={t("health_sla_monitor")}>
        <div className="text-fg-muted space-y-3 p-6 text-xs">
          <div className="flex items-center justify-between rounded border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300">
            <span className="flex items-center gap-2 font-medium">
              <Bell className="h-4 w-4" /> {t("health_sla_active")}
            </span>
            <span className="font-mono text-[10px]">{t("health_sla_breaches")}</span>
          </div>
          <p className="text-[11px]">{t("health_sla_desc")}</p>
        </div>
      </AdminSectionCard>
    </div>
  );
}

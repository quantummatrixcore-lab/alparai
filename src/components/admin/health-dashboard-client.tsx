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
          <span className="text-success-400 flex items-center gap-1 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4" /> {t("health_status_healthy")}
          </span>
        );
      case "degraded":
        return (
          <span className="text-warning-400 flex items-center gap-1 text-xs font-semibold">
            <AlertTriangle className="h-4 w-4" /> {t("health_status_degraded")}
          </span>
        );
      case "down":
        return (
          <span className="text-danger-400 flex items-center gap-1 text-xs font-semibold">
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
                ? "border-success-500/30 bg-success-500/20 text-success-400 border"
                : report.overall === "degraded"
                  ? "border-warning-500/30 bg-warning-500/20 text-warning-400 border"
                  : "border-danger-500/30 bg-danger-500/20 text-danger-400 border"
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
          className="border-border-subtle flex items-center gap-1.5 rounded border bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-50"
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
              className="border-border-subtle hover:border-border-strong space-y-2 rounded-lg border bg-black/40 p-4 transition"
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
          <div className="border-success-500/20 bg-success-500/10 text-success-300 flex items-center justify-between rounded border p-3">
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

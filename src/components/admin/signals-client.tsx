"use client";

import { useTranslations } from "next-intl";
import { TrendUp, TrendDown, Minus } from "@phosphor-icons/react";
import { Gauge } from "@/components/admin/premium/gauge";
import { LivePulseRing } from "@/components/admin/premium/live-pulse-ring";
import { AnimatedCounter } from "@/components/admin/premium/animated-counter";
import { DataFlowDiagram } from "@/components/admin/premium/data-flow-diagram";
import { AdminSectionCard } from "@/components/admin/admin-design-kit";

type SignalCategory = "performance" | "security" | "reliability" | "ux";

interface Signal {
  name: string;
  category: SignalCategory;
  value: number;
  threshold: number;
  trend: "up" | "down" | "stable";
  status: "healthy" | "warning" | "danger";
  description: string;
}

interface SignalsClientProps {
  initialSignals?: Signal[];
}

export function SignalsClient({ initialSignals = [] }: SignalsClientProps) {
  const t = useTranslations("admin");

  const categories: { key: SignalCategory; label: string; color: string }[] = [
    { key: "performance", label: t("signal_perf") || "Performance", color: "text-cyan-400" },
    { key: "security", label: t("signal_security") || "Security", color: "text-emerald-400" },
    {
      key: "reliability",
      label: t("signal_reliability") || "Reliability",
      color: "text-purple-400",
    },
    { key: "ux", label: t("signal_ux") || "User Experience", color: "text-amber-400" },
  ];

  const healthyCount = initialSignals.filter((s) => s.status === "healthy").length;
  const warningCount = initialSignals.filter((s) => s.status === "warning").length;
  const dangerCount = initialSignals.filter((s) => s.status === "danger").length;

  const flowNodes = [
    { id: "user", label: t("node_user") || "User", x: 15, y: 50, status: "active" as const },
    { id: "cdn", label: "CDN", x: 30, y: 30, status: "active" as const },
    { id: "api", label: "API", x: 50, y: 50, status: "active" as const },
    { id: "db", label: "DB", x: 70, y: 30, status: "active" as const },
    { id: "auth", label: t("node_auth") || "Auth", x: 70, y: 70, status: "active" as const },
    { id: "ai", label: t("node_ai") || "AI Engine", x: 88, y: 50, status: "active" as const },
  ];
  const flowEdges = [
    { from: "user", to: "cdn", active: true },
    { from: "cdn", to: "api", active: true },
    { from: "api", to: "db", active: true },
    { from: "api", to: "auth", active: true },
    { from: "api", to: "ai", active: true },
  ];

  if (initialSignals.length === 0) {
    return (
      <div className="space-y-8">
        <AdminSectionCard title={t("signal_overview") || "Signal Overview"}>
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <LivePulseRing status="idle" size="lg" />
            <p className="text-fg-muted text-sm font-semibold">
              {t("signal_no_data") || "No signal telemetry available"}
            </p>
            <p className="text-fg-muted/70 max-w-md text-xs">
              {t("signal_no_data_hint") ||
                "Connect a telemetry source (analytics, error tracker, or uptime monitor) to populate live signals."}
            </p>
          </div>
        </AdminSectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overall Signal Status */}
      <AdminSectionCard title={t("signal_overview") || "Signal Overview"}>
        <div className="flex flex-wrap items-center justify-around gap-6 p-6">
          <div className="flex flex-col items-center gap-2">
            <Gauge
              value={(healthyCount / initialSignals.length) * 100}
              size="lg"
              sublabel="%"
              variant="success"
            />
            <span className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
              {t("signal_overall_health") || "Overall Health"}
            </span>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <AnimatedCounter value={healthyCount} className="text-3xl text-emerald-400" />
              <p className="text-fg-muted text-[10px] font-bold">{t("slo_healthy") || "Healthy"}</p>
            </div>
            <div className="text-center">
              <AnimatedCounter value={warningCount} className="text-3xl text-amber-400" />
              <p className="text-fg-muted text-[10px] font-bold">{t("slo_warning") || "Warning"}</p>
            </div>
            <div className="text-center">
              <AnimatedCounter value={dangerCount} className="text-3xl text-rose-400" />
              <p className="text-fg-muted text-[10px] font-bold">
                {t("signal_critical") || "Critical"}
              </p>
            </div>
          </div>
        </div>
      </AdminSectionCard>

      {/* Data Flow Diagram */}
      <DataFlowDiagram
        nodes={flowNodes}
        edges={flowEdges}
        title={t("signal_data_flow") || "System Data Flow"}
      />

      {/* Signal Categories */}
      {categories.map((cat) => {
        const catSignals = initialSignals.filter((s) => s.category === cat.key);
        if (catSignals.length === 0) return null;
        return (
          <AdminSectionCard key={cat.key} title={cat.label}>
            <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {catSignals.map((sig) => (
                <div
                  key={sig.name}
                  className="bg-bg-secondary/60 border-border-subtle hover:bg-bg-secondary/80 flex flex-col gap-3 rounded-xl border p-4 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-fg-primary text-sm font-bold">{sig.name}</span>
                    <LivePulseRing status={sig.status} size="sm" />
                  </div>
                  <div className="flex items-end gap-3">
                    <Gauge
                      value={sig.value}
                      size="sm"
                      variant={sig.status === "healthy" ? "success" : sig.status}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        {sig.trend === "up" && <TrendUp className="h-3 w-3 text-emerald-400" />}
                        {sig.trend === "down" && <TrendDown className="h-3 w-3 text-rose-400" />}
                        {sig.trend === "stable" && <Minus className="text-fg-muted h-3 w-3" />}
                        <span className="font-mono text-lg font-black text-white">{sig.value}</span>
                        <span className="text-fg-muted text-[10px]">/ {sig.threshold}</span>
                      </div>
                      <p className="text-fg-muted text-[10px]">{sig.description}</p>
                    </div>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        sig.status === "healthy"
                          ? "bg-emerald-500"
                          : sig.status === "warning"
                            ? "bg-amber-500"
                            : "bg-rose-500"
                      }`}
                      style={{ width: `${Math.min(sig.value, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </AdminSectionCard>
        );
      })}
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Cpu, ArrowRight, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AreaGradient } from "@/components/ui/chart-gradient";
import { CHART_COLORS } from "@/lib/utils/chart-colors";
import { AdminSectionCard } from "@/components/admin/admin-design-kit";
import { Gauge } from "@/components/admin/premium/gauge";
import { LivePulseRing } from "@/components/admin/premium/live-pulse-ring";
import { AnimatedCounter } from "@/components/admin/premium/animated-counter";
import { Observe360Dashboard } from "@/components/admin/observe-360-dashboard";
import Link from "next/link";

interface IncidentItem {
  id: string;
  title_masked: string | null;
  description_masked: string | null;
  severity: string;
  category: string;
  created_at: string;
  status: string;
}

interface AutopilotLogItem {
  time: string;
  type: string;
  text: string;
  status: string;
}

interface OverviewDashboardClientProps {
  queue: IncidentItem[];
  locale: string;
  initialLogs?: AutopilotLogItem[];
  initialChartData?: { day: string; count: number }[];
  systemHealth?: number;
  uptime?: number;
}

export function OverviewDashboardClient({
  queue,
  locale,
  initialLogs = [],
  initialChartData = [],
  systemHealth,
  uptime,
}: OverviewDashboardClientProps) {
  const t = useTranslations("admin");

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return "danger";
      case "medium":
        return "warning";
      default:
        return "success";
    }
  };

  return (
    <div className="space-y-8">
      <Observe360Dashboard />

      {/* System Health Gauges — only render if real data */}
      {(systemHealth !== undefined || uptime !== undefined) && (
        <div className="grid gap-6 sm:grid-cols-3">
          {systemHealth !== undefined && (
            <AdminSectionCard>
              <div className="flex flex-col items-center gap-3 p-2">
                <Gauge value={systemHealth} size="lg" sublabel="%" />
                <span className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
                  {t("system_health") || "System Health"}
                </span>
              </div>
            </AdminSectionCard>
          )}
          {uptime !== undefined && (
            <AdminSectionCard>
              <div className="flex flex-col items-center gap-3 p-2">
                <Gauge value={uptime} size="lg" sublabel="%" variant="success" />
                <span className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
                  {t("uptime_30d") || "Uptime (30d)"}
                </span>
              </div>
            </AdminSectionCard>
          )}
          <AdminSectionCard>
            <div className="flex flex-col items-center gap-3 p-2">
              <div className="flex items-center gap-3">
                <LivePulseRing status="healthy" size="lg" />
                <AnimatedCounter value={queue.length} className="text-3xl text-white" />
              </div>
              <span className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
                {t("pending_reviews") || "Pending Reviews"}
              </span>
            </div>
          </AdminSectionCard>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AdminSectionCard title={t("incident_timeline") || "Incident Triage Timeline"}>
            <div className="p-6">
              {initialChartData.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
                  <CheckCircle className="h-8 w-8 text-emerald-500/30" />
                  <p className="text-fg-muted text-sm">
                    {t("timeline_no_data") || "No incident timeline data available yet."}
                  </p>
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={initialChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <AreaGradient id="colorIncident" from={CHART_COLORS.accent.emerald} />
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={CHART_COLORS.neutrals.grid}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        stroke={CHART_COLORS.neutrals.line}
                        tick={{ fill: CHART_COLORS.neutrals.fill, fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke={CHART_COLORS.neutrals.line}
                        tick={{ fill: CHART_COLORS.neutrals.fill, fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0E1622",
                          borderColor: CHART_COLORS.neutrals.grid,
                          borderRadius: "8px",
                        }}
                        itemStyle={{ color: CHART_COLORS.accent.emerald }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke={CHART_COLORS.accent.emerald}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorIncident)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </AdminSectionCard>
        </div>

        <div className="lg:col-span-1">
          <AdminSectionCard title={t("autopilot_logs_health") || "Autopilot Logs & Health"}>
            <div className="flex h-64 flex-col justify-between p-6">
              <div className="mb-4 flex items-center justify-between rounded-lg border border-white/5 bg-neutral-950/40 p-3 shadow-inner">
                <span className="text-fg-muted flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase">
                  <Cpu className="h-3.5 w-3.5 text-purple-400" />
                  {t("shield_guard_status") || "Shield Guard Status"}
                </span>
                <LivePulseRing status="healthy" size="sm" label={t("online")} />
              </div>

              {initialLogs.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                  <Cpu className="h-6 w-6 text-purple-400/40" />
                  <p className="text-fg-muted text-xs">
                    {t("autopilot_no_logs") || "No autopilot logs available."}
                  </p>
                </div>
              ) : (
                <div className="text-fg-secondary flex-1 space-y-2.5 overflow-y-auto pr-1 font-mono text-[11px]">
                  {initialLogs.map((log, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 border-b border-white/[0.02] pb-1.5 last:border-0"
                    >
                      <span className="text-fg-muted shrink-0">{log.time}</span>
                      <span
                        className={`shrink-0 rounded px-1 text-[9px] font-semibold tracking-wider uppercase ${
                          log.status === "warning"
                            ? "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                            : "border border-purple-500/20 bg-purple-500/10 text-purple-300"
                        }`}
                      >
                        {log.type}
                      </span>
                      <span className="text-fg-secondary truncate" title={log.text}>
                        {log.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AdminSectionCard>
        </div>
      </div>

      <AdminSectionCard title={`${t("moderation_queue")} (${queue.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-border-subtle text-fg-muted border-b bg-neutral-950/20 text-xs font-semibold tracking-wider uppercase">
                <th className="p-4 pl-6">{t("col_reported_at") || "Reported At"}</th>
                <th className="p-4">{t("col_incident_title") || "Incident Title"}</th>
                <th className="p-4">{t("category") || "Category"}</th>
                <th className="p-4">{t("severity") || "Severity"}</th>
                <th className="p-4 pr-6 text-right">{t("actions") || "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {queue.map((row) => (
                <tr
                  key={row.id}
                  className="group transition-colors duration-150 hover:bg-white/[0.01]"
                >
                  <td className="text-fg-secondary p-4 pl-6 font-mono text-xs">
                    {new Date(row.created_at).toLocaleDateString(locale, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="max-w-sm truncate p-4 font-medium text-white">
                    {row.title_masked || t("masked_incident_default") || "Masked Incident Report"}
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="text-[10px]">
                      {row.category}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant={getSeverityBadgeVariant(row.severity)} dot>
                      {row.severity}
                    </Badge>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <Link href={`/${locale}/admin/moderation?id=${row.id}`}>
                      <Button size="sm" variant="outline" className="h-8 px-2.5 text-[11px]">
                        {t("triage") || "Triage"}
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {queue.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-fg-muted p-12 text-center">
                    <CheckCircle className="mx-auto mb-3 h-8 w-8 text-emerald-500/30" />
                    {t("queue_all_clear") || "All clear! No pending incidents in moderation queue."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminSectionCard>
    </div>
  );
}

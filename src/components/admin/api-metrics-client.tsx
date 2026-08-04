"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Gauge } from "@/components/admin/premium/gauge";
import { AnimatedCounter } from "@/components/admin/premium/animated-counter";
import { StatusPill } from "@/components/admin/premium/status-pill";
import { AdminSectionCard } from "@/components/admin/admin-design-kit";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface ApiMetricsProps {
  metrics?: {
    requests24h: number;
    avgLatency: number;
    errorRate: number;
    p99Latency: number;
    totalTokens: number;
  };
  trafficData?: { hour: string; requests: number; errors: number }[];
  endpoints?: {
    name: string;
    method: string;
    status: "healthy" | "warning" | "critical";
    latency: string;
    rps: string;
    uptime: number;
  }[];
}

export function ApiMetricsClient({
  metrics = { requests24h: 0, avgLatency: 0, errorRate: 0, p99Latency: 0, totalTokens: 0 },
  trafficData = [],
  endpoints = [],
}: ApiMetricsProps) {
  const t = useTranslations("admin");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-8">
      {/* Metric Gauges */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <AdminSectionCard>
          <div className="flex flex-col items-center gap-2 p-4">
            <Gauge
              value={Math.min((metrics.requests24h / 20000) * 100, 100)}
              size="md"
              sublabel="/ 20K"
            />
            <span className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
              {t("api_requests_24h") || "Requests (24h)"}
            </span>
            <AnimatedCounter value={metrics.requests24h} className="text-xl text-white" />
          </div>
        </AdminSectionCard>
        <AdminSectionCard>
          <div className="flex flex-col items-center gap-2 p-4">
            <Gauge
              value={Math.min((metrics.totalTokens / 50000) * 100, 100)}
              size="md"
              sublabel="/ 50K"
              variant="success"
            />
            <span className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
              {t("api_total_tokens") || "Total Tokens"}
            </span>
            <AnimatedCounter value={metrics.totalTokens} className="text-xl text-white" />
          </div>
        </AdminSectionCard>
        <AdminSectionCard>
          <div className="flex flex-col items-center gap-2 p-4">
            <Gauge
              value={Math.max(0, 100 - metrics.avgLatency / 5)}
              size="md"
              sublabel="ms"
              variant={metrics.avgLatency < 200 ? "success" : "warning"}
            />
            <span className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
              {t("api_avg_latency") || "Avg Latency"}
            </span>
            <AnimatedCounter
              value={metrics.avgLatency}
              suffix="ms"
              className="text-xl text-white"
            />
          </div>
        </AdminSectionCard>
        <AdminSectionCard>
          <div className="flex flex-col items-center gap-2 p-4">
            <Gauge
              value={Math.max(0, 100 - metrics.errorRate * 50)}
              size="md"
              sublabel="%"
              variant={
                metrics.errorRate < 0.5 ? "success" : metrics.errorRate < 1 ? "warning" : "danger"
              }
            />
            <span className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
              {t("api_error_rate") || "Error Rate"}
            </span>
            <AnimatedCounter
              value={metrics.errorRate}
              suffix="%"
              decimals={2}
              className="text-xl text-white"
            />
          </div>
        </AdminSectionCard>
        <AdminSectionCard>
          <div className="flex flex-col items-center gap-2 p-4">
            <Gauge
              value={Math.max(0, 100 - metrics.p99Latency / 10)}
              size="md"
              sublabel="ms"
              variant={metrics.p99Latency < 500 ? "success" : "warning"}
            />
            <span className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
              {t("api_p99_latency") || "P99 Latency"}
            </span>
            <AnimatedCounter
              value={metrics.p99Latency}
              suffix="ms"
              className="text-xl text-white"
            />
          </div>
        </AdminSectionCard>
      </div>

      {/* Traffic Chart */}
      <AdminSectionCard title={t("api_traffic_overview") || "Traffic Overview (24h)"}>
        <div className="h-64 w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="requestsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="errorsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis
                  dataKey="hour"
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  axisLine={{ stroke: "#ffffff10" }}
                  tickLine={false}
                />
                <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fafafa" }}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#requestsGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="errors"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#errorsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full w-full animate-pulse items-center justify-center rounded-xl bg-white/5 text-sm text-white/40">
              Loading Chart...
            </div>
          )}
        </div>
        <div className="mt-4 flex gap-6 text-sm">
          <span className="flex items-center gap-2 text-purple-400">
            <span className="h-3 w-3 rounded-full bg-purple-500" />
            {t("api_requests") || "Requests"}
          </span>
          <span className="flex items-center gap-2 text-red-400">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            {t("api_errors") || "Errors"}
          </span>
        </div>
      </AdminSectionCard>

      {/* Endpoint Health Table */}
      <AdminSectionCard title={t("api_endpoint_health") || "Endpoint Health"}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-fg-muted border-b border-white/5 bg-neutral-950/20 text-xs font-semibold tracking-wider uppercase">
                <th className="p-4">{t("api_endpoint") || "Endpoint"}</th>
                <th className="p-4">{t("api_method") || "Method"}</th>
                <th className="p-4">{t("api_status") || "Status"}</th>
                <th className="p-4">{t("api_latency") || "Latency"}</th>
                <th className="p-4">{t("api_rps") || "RPS"}</th>
                <th className="p-4 text-right">{t("api_uptime") || "Uptime"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {endpoints.map((ep, i) => (
                <tr key={i} className="transition-colors hover:bg-white/[0.02]">
                  <td className="p-4 font-mono text-white">{ep.name}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-medium">
                      {ep.method}
                    </span>
                  </td>
                  <td className="p-4">
                    <StatusPill
                      name={ep.name}
                      status={
                        ep.status === "healthy"
                          ? "healthy"
                          : ep.status === "warning"
                            ? "warning"
                            : "danger"
                      }
                    />
                  </td>
                  <td className="p-4 font-mono text-white">{ep.latency}</td>
                  <td className="text-fg-muted p-4 font-mono">{ep.rps}</td>
                  <td className="text-fg-muted p-4 text-right font-mono">{ep.uptime}%</td>
                </tr>
              ))}
              {endpoints.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-fg-muted p-16 text-center">
                    {t("api_no_endpoints") || "No endpoint data available"}
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

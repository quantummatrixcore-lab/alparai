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
  Legend,
} from "recharts";
import { Activity } from "lucide-react";
import type { SlaChartPoint } from "@/actions/admin/vendor-portal";

interface VendorSlaChartsProps {
  data: SlaChartPoint[];
}

export function VendorSlaCharts({ data }: VendorSlaChartsProps) {
  const t = useTranslations("vendorPortal");

  return (
    <div className="border-border-subtle bg-bg-secondary space-y-4 rounded-3xl border p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="text-brand-400 h-5 w-5" />
          <h2 className="text-fg-primary text-lg font-bold">{t("sla_trends_title")}</h2>
        </div>
        <span className="text-fg-muted font-mono text-xs">{t("sla_telemetry_subtitle")}</span>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAnthropic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorGoogle" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOpenai" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" style={{ fontSize: 12 }} />
            <YAxis
              domain={[99.5, 100]}
              stroke="rgba(255,255,255,0.4)"
              style={{ fontSize: 11 }}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                borderColor: "rgba(255,255,255,0.1)",
                borderRadius: "12px",
                color: "#ffffff",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: "10px" }} />
            <Area
              type="monotone"
              dataKey="anthropic"
              name="Anthropic"
              stroke="#a855f7"
              fillOpacity={1}
              fill="url(#colorAnthropic)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="google"
              name="Google"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorGoogle)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="openai"
              name="OpenAI"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorOpenai)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

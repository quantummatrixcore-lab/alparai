"use client";

import { useTranslations } from "next-intl";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

interface CostTrendProps {
  data: Record<string, unknown>[];
}

export function CostTrendChart({ data }: CostTrendProps) {
  const t = useTranslations("finance");

  return (
    <div className="rounded-xl border border-white/5 bg-neutral-950/40 p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h4 className="text-fg-primary text-sm font-bold tracking-wide">{t("costTrendTitle")}</h4>
          <p className="text-fg-muted mt-1 text-xs">{t("costTrendSubtitle")}</p>
        </div>
      </div>

      <div className="mt-8 h-80 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00FF88" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00FF88" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-white/5" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#6B7280" />
            <YAxis
              tickLine={false}
              axisLine={false}
              stroke="#6B7280"
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0E1622",
                borderColor: "rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#F3F4F6",
              }}
              itemStyle={{ fontSize: "12px", color: "#F3F4F6" }}
              labelStyle={{ color: "#9CA3AF", fontSize: "12px", marginBottom: "4px" }}
              formatter={(value) => [`$${Number(value).toFixed(2)}`]}
            />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ fontSize: "12px", color: "#9CA3AF" }}
            />
            <Area
              type="monotone"
              name={t("totalCost")}
              dataKey="Toplam"
              stroke="#00FF88"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTotal)"
            />
            <Area
              type="monotone"
              name="Vercel"
              dataKey="vercel"
              stroke="#6B7280"
              strokeWidth={1.5}
              fillOpacity={0}
            />
            <Area
              type="monotone"
              name="Gemini"
              dataKey="gemini"
              stroke="#00D2FF"
              strokeWidth={1.5}
              fillOpacity={0}
            />
            <Area
              type="monotone"
              name="Anthropic"
              dataKey="anthropic"
              stroke="#F59E0B"
              strokeWidth={1.5}
              fillOpacity={0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

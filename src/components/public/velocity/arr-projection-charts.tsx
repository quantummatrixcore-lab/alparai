"use client";

import { useMemo, useState } from "react";
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
import { type ARRScenarioResult } from "@/lib/analytics/velocity-calculator";

interface ARRProjectionChartsProps {
  scenarioResult: ARRScenarioResult;
}

export function ARRProjectionCharts({ scenarioResult }: ARRProjectionChartsProps) {
  const t = useTranslations("velocity");
  const [activeTab, setActiveTab] = useState<"all" | "A" | "B" | "C">("all");

  const chartData = useMemo(() => {
    const months = [
      t("m_jan"),
      t("m_feb"),
      t("m_mar"),
      t("m_apr"),
      t("m_may"),
      t("m_jun"),
      t("m_jul"),
      t("m_aug"),
      t("m_sep"),
      t("m_oct"),
      t("m_nov"),
      t("m_dec"),
    ];

    const baseARR = scenarioResult.baseARR;
    const vFactor = scenarioResult.calculatedVelocityFactor;

    return months.map((month, idx) => {
      // Scenario A: Linear (V=1.0)
      const arrA = Math.round(baseARR * (1 + 0.04 * idx));
      // Scenario B: Exponential (V=1.8)
      const arrB = Math.round(baseARR * Math.pow(1 + 0.08 * idx, 1.15) * (vFactor / 1.0));
      // Scenario C: AGI Surge (V=3.5)
      const arrC = Math.round(baseARR * Math.pow(1 + 0.16 * idx, 1.35) * (vFactor / 1.0));

      return {
        month,
        linear: arrA,
        exponential: arrB,
        agi: arrC,
      };
    });
  }, [scenarioResult, t]);

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
    return `$${val}`;
  };

  return (
    <div className="border-border-subtle bg-bg-secondary rounded-2xl border p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h3 className="text-fg-primary text-lg font-bold tracking-tight">{t("chart_title")}</h3>
          <p className="text-fg-muted mt-1 text-xs">{t("chart_subtitle")}</p>
        </div>

        {/* Tab Filters */}
        <div className="border-border-subtle bg-bg-secondary flex items-center gap-1.5 rounded-xl border p-1">
          {(["all", "A", "B", "C"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === tab
                  ? "border-accent-500/30 bg-accent-500/20 text-accent-400 border shadow-md"
                  : "text-fg-muted hover:text-fg-primary"
              }`}
            >
              {tab === "all" ? t("tab_all") : `${t("tab_scenario")} ${tab}`}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 h-80 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradLinear" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradExpo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradAGI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(255, 255, 255, 0.05)"
            />
            <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="#6B7280" />
            <YAxis
              tickLine={false}
              axisLine={false}
              stroke="#6B7280"
              tickFormatter={(v) => formatCurrency(Number(v))}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0B0F17",
                borderColor: "rgba(255, 255, 255, 0.15)",
                borderRadius: "12px",
                color: "#F3F4F6",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
              }}
              formatter={(value, name) => [
                formatCurrency(Number(value)),
                name === "linear"
                  ? t("scenario_a_name")
                  : name === "exponential"
                    ? t("scenario_b_name")
                    : t("scenario_c_name"),
              ]}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: "20px" }}
              formatter={(val) =>
                val === "linear"
                  ? t("scenario_a_short")
                  : val === "exponential"
                    ? t("scenario_b_short")
                    : t("scenario_c_short")
              }
            />
            {(activeTab === "all" || activeTab === "A") && (
              <Area
                type="monotone"
                dataKey="linear"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradLinear)"
              />
            )}
            {(activeTab === "all" || activeTab === "B") && (
              <Area
                type="monotone"
                dataKey="exponential"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#gradExpo)"
              />
            )}
            {(activeTab === "all" || activeTab === "C") && (
              <Area
                type="monotone"
                dataKey="agi"
                stroke="#A855F7"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#gradAGI)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

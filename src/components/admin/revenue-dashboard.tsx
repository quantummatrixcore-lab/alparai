"use client";

import { useTranslations } from "next-intl";
import { CurrencyDollar, TrendUp, Users } from "@phosphor-icons/react/dist/ssr";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueMetric {
  month: string;
  mrr_usd: number;
  arr_usd: number;
  active_subs: number;
}

export function RevenueDashboard({ data }: { data: RevenueMetric[] }) {
  const t = useTranslations("admin");

  const latest = data[data.length - 1];
  const previous = data[data.length - 2];

  const currentMrr = latest ? Number(latest.mrr_usd) : 0;
  const currentArr = latest ? Number(latest.arr_usd) : 0;
  const currentSubs = latest ? Number(latest.active_subs) : 0;

  const previousMrr = previous ? Number(previous.mrr_usd) : 0;
  const mrrChangePercent =
    previousMrr > 0 ? Math.round(((currentMrr - previousMrr) / previousMrr) * 100) : 0;

  const chartData = data.map((d) => {
    const date = new Date(d.month);
    const name = date.toLocaleString("en-US", { month: "short" });
    return {
      name,
      mrr: Number(d.mrr_usd),
    };
  });

  return (
    <div className="border-t-brand-500/30 mb-8 rounded-lg border border-white/10 bg-neutral-900/60 p-6 shadow-md backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between border-b border-white/5 pb-3">
        <h2 className="text-md inline-flex items-center gap-2 font-semibold text-white">
          <CurrencyDollar weight="duotone" className="h-5 w-5 text-emerald-400" />
          {t("finance")} {t("mrr_arr")}
        </h2>
        <span className="text-brand-400 bg-brand-500/10 rounded-full px-2 py-1 text-xs font-medium">
          {t("live_stripe_sync")}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-lg border border-white/5 bg-neutral-800/40 p-4">
            <p className="mb-1 text-sm font-medium text-neutral-400">
              {t("monthly_recurring_revenue")}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">${currentMrr.toLocaleString()}</span>
              {mrrChangePercent !== 0 && (
                <span
                  className={`flex items-center text-xs ${mrrChangePercent > 0 ? "text-emerald-400" : "text-rose-400"}`}
                >
                  <TrendUp
                    weight="bold"
                    className={`mr-1 ${mrrChangePercent < 0 ? "rotate-180" : ""}`}
                  />
                  {mrrChangePercent > 0 ? `+${mrrChangePercent}%` : `${mrrChangePercent}%`}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-white/5 bg-neutral-800/40 p-4">
            <p className="mb-1 text-sm font-medium text-neutral-400">{t("annual_run_rate_arr")}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">${currentArr.toLocaleString()}</span>
              {mrrChangePercent !== 0 && (
                <span
                  className={`flex items-center text-xs ${mrrChangePercent > 0 ? "text-emerald-400" : "text-rose-400"}`}
                >
                  <TrendUp
                    weight="bold"
                    className={`mr-1 ${mrrChangePercent < 0 ? "rotate-180" : ""}`}
                  />
                  {mrrChangePercent > 0 ? `+${mrrChangePercent}%` : `${mrrChangePercent}%`}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-white/5 bg-neutral-800/40 p-4">
            <p className="mb-1 text-sm font-medium text-neutral-400">
              {t("active_pro_enterprise_subs")}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{currentSubs.toLocaleString()}</span>
              <span className="ml-1 text-xs text-neutral-500">
                <Users weight="duotone" className="inline" />
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/5 bg-neutral-800/20 p-4 lg:col-span-3">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#ffffff40"
                  tick={{ fill: "#ffffff60", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#ffffff40"
                  tick={{ fill: "#ffffff60", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171717",
                    borderColor: "#ffffff20",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#10b981" }}
                  formatter={(value: unknown) => [`$${Number(value || 0).toLocaleString()}`, "MRR"]}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMrr)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

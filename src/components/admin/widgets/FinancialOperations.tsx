"use client";

import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Wallet,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface MetricCardProps {
  title: string;
  value: string;
  subValue: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  accentColor: "cyan" | "purple" | "emerald" | "amber";
}

const COLOR_MAP = {
  cyan: "text-[#00f0ff] border-[#00f0ff]/30 bg-[#00f0ff]/10 shadow-[0_0_15px_rgba(0,240,255,0.15)]",
  purple:
    "text-[#dcb8ff] border-[#8a2be2]/40 bg-[#8a2be2]/15 shadow-[0_0_15px_rgba(138,43,226,0.15)]",
  emerald:
    "text-[#10b981] border-[#10b981]/30 bg-[#10b981]/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
  amber:
    "text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
} as const;

const MetricItem = React.memo(function MetricItem({
  title,
  value,
  subValue,
  change,
  isPositive,
  icon,
  accentColor,
}: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#27272a] bg-[#121216]/80 p-4 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          {title}
        </span>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg border ${COLOR_MAP[accentColor]}`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div>
          <div className="font-mono text-2xl font-bold tracking-tight text-white">{value}</div>
          <div className="mt-0.5 text-xs text-slate-400">{subValue}</div>
        </div>
        <div
          className={`flex items-center gap-0.5 rounded-md px-2 py-0.5 font-mono text-xs font-bold ${
            isPositive
              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border border-rose-500/20 bg-rose-500/10 text-rose-400"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {change}
        </div>
      </div>
    </div>
  );
});

const MODEL_TOKEN_COSTS = [
  { name: "Gemini 3.1 Pro (Atatürk 2M)", cost: "$142.50", usage: "38%", color: "#00f0ff" },
  { name: "OpenCode Free Swarm (Nemotron/HY3)", cost: "$0.00", usage: "45%", color: "#10b981" },
  { name: "Claude Sonnet/Opus (Architect Gate)", cost: "$68.20", usage: "12%", color: "#a855f7" },
  { name: "Cloudflare Workers & Vercel Edge", cost: "$19.40", usage: "5%", color: "#f59e0b" },
];

const SUBSCRIPTION_TIERS = [
  { tier: "Enterprise Vanguard", count: 28, mrr: "$19,600", growth: "+14%" },
  { tier: "Pro Autonomous", count: 142, mrr: "$14,058", growth: "+22%" },
  { tier: "Developer Node", count: 620, mrr: "$11,780", growth: "+8%" },
];

export const FinancialOperations = React.memo(function FinancialOperations() {
  const t = useTranslations("admin.financial_operations");
  const [selectedPeriod, setSelectedPeriod] = useState<"24h" | "7d" | "30d" | "QTD">("30d");
  const [isRebalancing, setIsRebalancing] = useState(false);
  const rebalanceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (rebalanceTimerRef.current) {
        clearTimeout(rebalanceTimerRef.current);
      }
    };
  }, []);

  const handleRebalance = React.useCallback(() => {
    setIsRebalancing(true);
    if (rebalanceTimerRef.current) clearTimeout(rebalanceTimerRef.current);
    rebalanceTimerRef.current = setTimeout(() => {
      setIsRebalancing(false);
    }, 1200);
  }, []);

  return (
    <section className="relative w-full min-w-0 overflow-hidden rounded-2xl border border-[#27272a] bg-[#0d0d12]/90 p-3.5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#00f0ff]/30 sm:p-5 md:p-6">
      {/* Background Neon Gradients */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#00f0ff]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-[#8a2be2]/10 blur-3xl" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col gap-3 border-b border-[#27272a] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#00f0ff]/40 bg-[#00f0ff]/10 text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-sans text-base font-bold tracking-tight text-white sm:text-lg">
                {t("title")}
              </h3>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400 sm:text-[11px]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                {t("positive_runway")}
              </span>
            </div>
            <p className="truncate text-[11px] text-slate-400 sm:text-xs">{t("subtitle")}</p>
          </div>
        </div>

        {/* Controls & Period Selector */}
        <div className="no-scrollbar flex shrink-0 items-center gap-2 overflow-x-auto">
          <div className="flex shrink-0 rounded-lg border border-[#27272a] bg-[#18181b]/80 p-1">
            {(["24h", "7d", "30d", "QTD"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  selectedPeriod === period
                    ? "border border-[#00f0ff]/40 bg-[#00f0ff]/20 text-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.3)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <button
            onClick={handleRebalance}
            disabled={isRebalancing}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#8a2be2]/40 bg-[#8a2be2]/15 px-3 py-1.5 text-xs font-bold text-[#dcb8ff] transition-all hover:border-[#8a2be2]/60 hover:bg-[#8a2be2]/25 hover:shadow-[0_0_12px_rgba(138,43,226,0.3)] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRebalancing ? "animate-spin" : ""}`} />
            <span>{isRebalancing ? t("rebalancing") : t("rebalance_budget")}</span>
          </button>
        </div>
      </div>

      {/* Top Financial KPI Metrics */}
      <div className="relative z-10 mt-4 grid grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricItem
          title={t("metrics.net_mrr_title")}
          value="$45,438"
          subValue={t("metrics.net_mrr_target")}
          change="+18.4%"
          isPositive={true}
          icon={<DollarSign className="h-4 w-4" />}
          accentColor="emerald"
        />
        <MetricItem
          title={t("metrics.ai_compute_title")}
          value="$230.10"
          subValue={t("metrics.ai_compute_sub")}
          change="-32.1%"
          isPositive={true}
          icon={<Zap className="h-4 w-4" />}
          accentColor="cyan"
        />
        <MetricItem
          title={t("metrics.runway_title")}
          value={t("metrics.runway_value")}
          subValue={t("metrics.runway_sub")}
          change={t("metrics.runway_change")}
          isPositive={true}
          icon={<ShieldCheck className="h-4 w-4" />}
          accentColor="purple"
        />
        <MetricItem
          title={t("metrics.gross_margin_title")}
          value="94.8%"
          subValue={t("metrics.gross_margin_sub")}
          change="+2.3%"
          isPositive={true}
          icon={<TrendingUp className="h-4 w-4" />}
          accentColor="amber"
        />
      </div>

      {/* Breakdown Grid: AI Compute Spend & Tiers */}
      <div className="relative z-10 mt-4 grid grid-cols-1 gap-3 sm:mt-5 sm:gap-4 lg:grid-cols-12">
        {/* AI Compute Cost Optimization (7 cols on lg) */}
        <div className="min-w-0 rounded-xl border border-[#27272a] bg-[#121216]/60 p-3.5 backdrop-blur-md sm:p-4 lg:col-span-7">
          <div className="flex min-w-0 items-center justify-between border-b border-[#27272a] pb-3">
            <div className="flex min-w-0 items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-[#00f0ff]" />
              <h4 className="truncate text-xs font-bold text-white sm:text-sm">
                {t("token_cost.title")}
              </h4>
            </div>
            <span className="shrink-0 font-mono text-xs font-semibold text-emerald-400">
              {t("token_cost.savings")}
            </span>
          </div>

          <div className="mt-3.5 space-y-2.5 sm:space-y-3">
            {MODEL_TOKEN_COSTS.map((model) => (
              <div key={model.name} className="min-w-0 space-y-1">
                <div className="flex min-w-0 items-center justify-between text-xs">
                  <div className="flex min-w-0 items-center gap-2 pr-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: model.color, boxShadow: `0 0 6px ${model.color}` }}
                    />
                    <span className="truncate font-medium text-slate-200">{model.name}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 font-mono sm:gap-3">
                    <span className="text-[11px] text-slate-400">
                      {model.usage} {t("token_cost.load_label")}
                    </span>
                    <span className="text-xs font-bold text-white">{model.cost}</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1e1e24]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: model.usage,
                      backgroundColor: model.color,
                      boxShadow: `0 0 8px ${model.color}80`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3.5 flex min-w-0 flex-col items-start justify-between gap-2 rounded-lg border border-[#27272a] bg-[#18181b]/50 p-2.5 text-xs text-slate-300 sm:flex-row sm:items-center">
            <span className="flex items-center gap-1.5 truncate">
              <Sliders className="h-3.5 w-3.5 shrink-0 text-[#00f0ff]" />
              {t("token_cost.smart_routing")}
            </span>
            <span className="shrink-0 font-mono text-[11px] font-bold text-[#00f0ff]">
              {t("token_cost.spending_limit")}
            </span>
          </div>
        </div>

        {/* Subscription Revenue Tiers (5 cols on lg) */}
        <div className="min-w-0 rounded-xl border border-[#27272a] bg-[#121216]/60 p-3.5 backdrop-blur-md sm:p-4 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
            <div className="flex min-w-0 items-center gap-2">
              <CreditCard className="h-4 w-4 shrink-0 text-[#dcb8ff]" />
              <h4 className="truncate text-xs font-bold text-white sm:text-sm">
                {t("subscription_tiers.title")}
              </h4>
            </div>
            <PieChart className="h-4 w-4 shrink-0 text-slate-400" />
          </div>

          <div className="mt-3.5 space-y-2.5">
            {SUBSCRIPTION_TIERS.map((sub) => (
              <div
                key={sub.tier}
                className="flex min-w-0 items-center justify-between rounded-lg border border-[#27272a] bg-[#18181b]/40 p-2.5 transition-colors hover:border-white/20"
              >
                <div className="min-w-0 pr-2">
                  <div className="truncate text-xs font-bold text-slate-200">{sub.tier}</div>
                  <div className="truncate font-mono text-[10px] text-slate-400 sm:text-[11px]">
                    {sub.count} {t("subscription_tiers.active_customers")}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-mono text-xs font-bold text-white">{sub.mrr}</div>
                  <div className="font-mono text-[10px] font-bold text-emerald-400">
                    {sub.growth}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3.5 text-center">
            <span className="font-mono text-[10px] text-slate-400 sm:text-[11px]">
              {t("subscription_tiers.stripe_sync")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
});

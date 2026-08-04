"use client";

import { useTranslations } from "next-intl";
import { Globe, AlertTriangle, Sparkles, Clock, TrendingUp } from "lucide-react";

interface EcosystemStats {
  total: number;
  incidents: number;
  positive: number;
  queue: number;
  sourceCount?: number;
}

export function StatsCards({ stats }: { stats: EcosystemStats }) {
  const t = useTranslations("admin");
  const cards = [
    {
      label: t("stat_total_articles") || "Total Telemetry Articles",
      value: stats.total,
      subtext:
        t("stat_active_sources", { count: stats.sourceCount || 4 }) ||
        `${stats.sourceCount || 4} active global sources`,
      icon: Globe,
      color: "text-brand-300",
      bgGlow: "from-brand-500/10 via-transparent to-transparent",
      borderColor: "border-brand-500/30",
    },
    {
      label: t("stat_ingested_incidents") || "Ingested Incidents",
      value: stats.incidents,
      subtext: t("stat_violation_subtext") || "Tracked AI safety violations",
      icon: AlertTriangle,
      color: "text-rose-400",
      bgGlow: "from-rose-500/10 via-transparent to-transparent",
      borderColor: "border-rose-500/20 hover:border-rose-500/40",
    },
    {
      label: t("stat_positive_developments") || "Positive Developments",
      value: stats.positive,
      subtext: t("stat_governance_subtext") || "Governance & alignment wins",
      icon: Sparkles,
      color: "text-emerald-400",
      bgGlow: "from-emerald-500/10 via-transparent to-transparent",
      borderColor: "border-emerald-500/20 hover:border-emerald-500/40",
    },
    {
      label: t("stat_review_queue") || "Review Queue",
      value: stats.queue,
      subtext: t("stat_pending_subtext") || "Pending moderator review",
      icon: Clock,
      color: "text-amber-400",
      bgGlow: "from-amber-500/10 via-transparent to-transparent",
      borderColor: "border-amber-500/20 hover:border-amber-500/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${c.bgGlow} bg-zinc-950/80 p-5 shadow-xl backdrop-blur-xl transition-all duration-300 ${c.borderColor} hover:shadow-brand-500/5 hover:shadow-2xl`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                {c.label}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-transform group-hover:scale-110">
                <Icon className={`h-4 w-4 ${c.color}`} />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <span className={`text-3xl font-black tracking-tight text-white ${c.color}`}>
                {c.value.toLocaleString()}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                {t("live")}
              </span>
            </div>

            <p className="mt-2 text-xs text-zinc-500">{c.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}

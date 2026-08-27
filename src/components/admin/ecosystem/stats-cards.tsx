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
      color: "text-danger-400",
      bgGlow: "from-danger-500/10 via-transparent to-transparent",
      borderColor: "border-danger-500/20 hover:border-danger-500/40",
    },
    {
      label: t("stat_positive_developments") || "Positive Developments",
      value: stats.positive,
      subtext: t("stat_governance_subtext") || "Governance & alignment wins",
      icon: Sparkles,
      color: "text-success-400",
      bgGlow: "from-success-500/10 via-transparent to-transparent",
      borderColor: "border-success-500/20 hover:border-success-500/40",
    },
    {
      label: t("stat_review_queue") || "Review Queue",
      value: stats.queue,
      subtext: t("stat_pending_subtext") || "Pending moderator review",
      icon: Clock,
      color: "text-warning-400",
      bgGlow: "from-warning-500/10 via-transparent to-transparent",
      borderColor: "border-warning-500/20 hover:border-warning-500/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${c.bgGlow} bg-bg-tertiary/80 p-5 shadow-xl backdrop-blur-xl transition-all duration-300 ${c.borderColor} hover:shadow-brand-500/5 hover:shadow-2xl`}
          >
            <div className="flex items-center justify-between">
              <span className="text-fg-muted text-xs font-semibold tracking-wider uppercase">
                {c.label}
              </span>
              <div className="border-border-subtle flex h-8 w-8 items-center justify-center rounded-lg border bg-white/5 transition-transform group-hover:scale-110">
                <Icon className={`h-4 w-4 ${c.color}`} />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <span className={`text-3xl font-black tracking-tight text-white ${c.color}`}>
                {c.value.toLocaleString()}
              </span>
              <span className="text-fg-muted flex items-center gap-1 text-[11px] font-medium">
                <TrendingUp className="text-success-400 h-3 w-3" />
                {t("live")}
              </span>
            </div>

            <p className="text-fg-disabled mt-2 text-xs">{c.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}

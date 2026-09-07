"use client";

import { Link } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, TrendingDown, TrendingUp, Minus, ShieldCheck } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { LeaderboardEntry } from "@/types";
import { motion, type Variants } from "framer-motion";

import { ProviderLogo } from "@/components/leaderboard/provider-logo";

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function LeaderboardPreview({ entries }: { entries: LeaderboardEntry[] }) {
  const t = useTranslations("leaderboard");
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-fg-primary inline-flex items-center gap-2 text-xl font-semibold">
          <Trophy className="text-warning-500 h-5 w-5" />
          {t("title")}
        </h2>
        <Link href="/leaderboard" className="text-brand-400 text-sm hover:underline">
          {t("subtitle")}
        </Link>
      </div>
      <Card
        variant="glass"
        className="hover:shadow-brand-500/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      >
        <CardContent className="p-0">
          <motion.ol
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="divide-border-subtle divide-y"
          >
            {entries.slice(0, 10).map((e, i) => {
              const trend = e.trend > 0 ? "up" : e.trend < 0 ? "down" : "flat";
              return (
                <motion.li
                  variants={itemVariants}
                  key={e.provider_id}
                  whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                  className="flex items-center gap-3 p-3 transition-all duration-300 first:rounded-t-xl last:rounded-b-xl"
                >
                  <span
                    className={cn(
                      "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      i === 0
                        ? "bg-warning-500/15 text-warning-500"
                        : i === 1
                          ? "bg-fg-muted/15 text-fg-muted"
                          : i === 2
                            ? "bg-warning-700/15 text-warning-700"
                            : "bg-bg-tertiary text-fg-muted",
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className="border-border-subtle bg-bg-primary relative h-8 w-8 shrink-0 overflow-hidden rounded-lg border shadow-sm">
                    <ProviderLogo name={e.provider_name} slug={e.provider_slug} size="sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/press-kit/${e.provider_slug}`}
                        className="text-fg-primary hover:text-brand-400 block truncate text-sm font-semibold transition-colors"
                      >
                        {e.provider_name}
                      </Link>
                      {e.is_verified_respondent && (
                        <span title={t("verified_respondent")}>
                          <ShieldCheck className="text-success-400 h-3.5 w-3.5 shrink-0" />
                        </span>
                      )}
                    </div>
                    <p className="text-fg-muted flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
                      <span>
                        {formatNumber(e.incident_count)} {t("incidents").toLowerCase()}
                      </span>
                      <span className="text-fg-secondary">•</span>
                      <span
                        className={cn(
                          "inline-flex items-center text-[10px] font-bold tracking-wide",
                          e.response_rate == null
                            ? "text-fg-muted"
                            : e.response_rate > 0
                              ? e.response_rate >= 70
                                ? "text-success-400"
                                : "text-warning-400"
                              : "text-amber-400",
                        )}
                        title={e.response_rate === 0 ? t("silence_penalty_tooltip") : undefined}
                      >
                        {e.response_rate != null
                          ? e.response_rate > 0
                            ? `${e.response_rate}% ${t("responseRate")}`
                            : `${t("pending_rebuttal")}`
                          : `N/A ${t("responseRate")}`}
                      </span>
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex rounded border px-2 py-0.5 text-xs font-bold font-mono",
                      (e.trust_score ?? 70) >= 90
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : (e.trust_score ?? 70) >= 70
                          ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                          : (e.trust_score ?? 70) >= 50
                            ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                            : "border-red-500/20 bg-red-500/10 text-red-400",
                    )}
                    title={t("trustScore")}
                  >
                    {e.trust_score ?? 70}/100
                  </span>
                </motion.li>
              );
            })}
          </motion.ol>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Link } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, TrendingDown, TrendingUp, Minus, ShieldCheck } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { LeaderboardEntry } from "@/types";
import { motion, type Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
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
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/press-kit/${e.provider_slug}`}
                        className="text-fg-primary hover:text-brand-400 block truncate text-sm font-semibold"
                      >
                        {e.provider_name}
                      </Link>
                      {e.is_verified_respondent && (
                        <span title={t("verified_respondent")}>
                          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        </span>
                      )}
                    </div>
                    <p className="text-fg-muted flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
                      <span>
                        {formatNumber(e.incident_count)} {t("incidents").toLowerCase()}
                      </span>
                      <span className="text-slate-700">•</span>
                      <span
                        className={cn(
                          "inline-flex items-center text-[10px] font-bold tracking-wide",
                          e.response_rate !== undefined && e.response_rate >= 70
                            ? "text-success-400"
                            : e.response_rate !== undefined && e.response_rate >= 30
                              ? "text-warning-400"
                              : "text-danger-400",
                        )}
                      >
                        {e.response_rate !== undefined
                          ? `${e.response_rate}% ${t("responseRate")}`
                          : `N/A ${t("responseRate")}`}
                      </span>
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-medium",
                      trend === "up" && "text-danger-400",
                      trend === "down" && "text-success-500",
                      trend === "flat" && "text-fg-muted",
                    )}
                  >
                    {trend === "up" && <TrendingUp className="h-3 w-3" />}
                    {trend === "down" && <TrendingDown className="h-3 w-3" />}
                    {trend === "flat" && <Minus className="h-3 w-3" />}
                    {Math.abs(e.trend)}
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

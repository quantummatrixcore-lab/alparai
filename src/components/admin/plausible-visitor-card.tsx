"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Users, Eye, AlertTriangle } from "lucide-react";
import { getPlausibleMetrics } from "@/actions/admin/analytics";

export function PlausibleVisitorCard() {
  const t = useTranslations("admin");
  const [metrics, setMetrics] = React.useState<{
    visitors: number;
    pageviews: number;
    error: string | null;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchMetrics() {
      try {
        const data = await getPlausibleMetrics();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to fetch Plausible metrics", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-24 w-full animate-pulse flex-col justify-center rounded-2xl border border-white/10 bg-zinc-900/30 p-6 backdrop-blur-2xl sm:rounded-3xl">
        <div className="h-4 w-1/3 rounded-full bg-white/10"></div>
        <div className="mt-4 h-6 w-1/2 rounded-full bg-white/10"></div>
      </div>
    );
  }

  if (metrics?.error) {
    return (
      <div className="flex w-full items-center gap-3 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 backdrop-blur-2xl sm:rounded-3xl sm:p-6">
        <AlertTriangle className="h-6 w-6 shrink-0 text-orange-400" />
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-orange-400">{t("plausible_live_visitors")}</p>
          <p className="text-xs text-orange-300/80">{metrics.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
      <div className="group relative overflow-hidden rounded-2xl border border-blue-500/20 bg-zinc-900/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/40 hover:bg-zinc-900/60 sm:rounded-3xl">
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl transition-all duration-500 group-hover:bg-blue-500/20" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400">{t("plausible_visitors_30d")}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
              {metrics?.visitors?.toLocaleString() || "0"}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="group relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-zinc-900/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/40 hover:bg-zinc-900/60 sm:rounded-3xl">
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl transition-all duration-500 group-hover:bg-indigo-500/20" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400">{t("plausible_pageviews_30d")}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
              {metrics?.pageviews?.toLocaleString() || "0"}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
            <Eye className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

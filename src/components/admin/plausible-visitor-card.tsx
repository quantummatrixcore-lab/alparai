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
      <div className="bg-bg-elevated/30 flex h-24 w-full animate-pulse flex-col justify-center rounded-2xl border border-white/10 p-6 backdrop-blur-2xl sm:rounded-3xl">
        <div className="h-4 w-1/3 rounded-full bg-white/10"></div>
        <div className="mt-4 h-6 w-1/2 rounded-full bg-white/10"></div>
      </div>
    );
  }

  if (metrics?.error) {
    return (
      <div className="border-warning-500/20 bg-warning-500/10 flex w-full items-center gap-3 rounded-2xl border p-4 backdrop-blur-2xl sm:rounded-3xl sm:p-6">
        <AlertTriangle className="text-warning-400 h-6 w-6 shrink-0" />
        <div className="flex flex-col">
          <p className="text-warning-400 text-sm font-semibold">{t("plausible_live_visitors")}</p>
          <p className="text-warning-300/80 text-xs">{metrics.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
      <div className="group border-brand-500/20 bg-bg-elevated/40 hover:border-brand-500/40 hover:bg-bg-elevated/60 relative overflow-hidden rounded-2xl border p-6 backdrop-blur-xl transition-all duration-300 sm:rounded-3xl">
        <div className="bg-brand-500/10 group-hover:bg-brand-500/20 absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl transition-all duration-500" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-fg-muted text-sm font-medium">{t("plausible_visitors_30d")}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
              {metrics?.visitors?.toLocaleString() || "0"}
            </p>
          </div>
          <div className="bg-brand-500/10 text-brand-400 flex h-12 w-12 items-center justify-center rounded-2xl">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="group border-brand-500/20 bg-bg-elevated/40 hover:border-brand-500/40 hover:bg-bg-elevated/60 relative overflow-hidden rounded-2xl border p-6 backdrop-blur-xl transition-all duration-300 sm:rounded-3xl">
        <div className="bg-brand-500/10 group-hover:bg-brand-500/20 absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl transition-all duration-500" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-fg-muted text-sm font-medium">{t("plausible_pageviews_30d")}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
              {metrics?.pageviews?.toLocaleString() || "0"}
            </p>
          </div>
          <div className="bg-brand-500/10 text-brand-400 flex h-12 w-12 items-center justify-center rounded-2xl">
            <Eye className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

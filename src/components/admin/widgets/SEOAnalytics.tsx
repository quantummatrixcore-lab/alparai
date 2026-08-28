"use client";

import React from "react";
import { Search, TrendingUp } from "lucide-react";

export interface SEOAnalyticsProps {
  lighthouseScore?: number;
  visibilityGrowth?: string;
}

export const SEOAnalytics = React.memo(function SEOAnalytics({
  lighthouseScore = 98,
  visibilityGrowth = "+14%",
}: SEOAnalyticsProps) {
  return (
    <div className="rounded-xl border border-[#27272a] bg-[#121216]/80 p-3.5 sm:p-4 backdrop-blur-md w-full min-w-0">
      <div className="flex items-center gap-2 mb-3 sm:mb-4 border-b border-[#27272a] pb-2 min-w-0">
        <Search className="h-4 w-4 text-[#10b981] shrink-0" />
        <h3 className="text-xs sm:text-sm font-bold text-white truncate">SEO Metrikleri</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs text-slate-400">Lighthouse Skoru</p>
          <p className="font-mono text-xs sm:text-sm font-bold text-emerald-400">{lighthouseScore} / 100</p>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs text-slate-400">Arama Motoru Görünürlüğü</p>
          <p className="font-mono text-xs sm:text-sm font-bold text-[#00f0ff] flex items-center gap-1">
            <TrendingUp className="h-3 w-3 shrink-0" /> {visibilityGrowth}
          </p>
        </div>
      </div>
    </div>
  );
});

export default SEOAnalytics;

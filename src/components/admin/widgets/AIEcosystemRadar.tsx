"use client";

import React from "react";
import { Activity, Zap, Server } from "lucide-react";
import { useTranslations } from "next-intl";

export interface RadarData {
  leader: string;
  iq_score: string;
  openai_status: string;
  anthropic_status: string;
  token_trend: string;
}

const DEFAULT_RADAR_DATA: RadarData = {
  leader: "Claude 3.5 Sonnet",
  iq_score: "1287", // LMSYS ELO / IQ Benchmark
  openai_status: "Operational",
  anthropic_status: "Operational",
  token_trend: "-12%",
};

export const AIEcosystemRadar = React.memo(function AIEcosystemRadar({
  data = DEFAULT_RADAR_DATA,
}: {
  data?: RadarData;
}) {
  const t = useTranslations("admin.ai_ecosystem_radar");

  return (
    <div className="w-full min-w-0 rounded-xl border border-[#27272a] bg-[#121216]/80 p-3.5 backdrop-blur-md sm:p-4">
      <div className="mb-3 flex min-w-0 items-center gap-2 border-b border-[#27272a] pb-2 sm:mb-4">
        <Activity className="h-4 w-4 shrink-0 text-[#00f0ff]" />
        <h3 className="truncate text-xs font-bold text-white sm:text-sm">{t("title")}</h3>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="min-w-0">
          <p className="text-[11px] text-slate-400 sm:text-xs">{t("current_leader")}</p>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <p className="truncate font-mono text-xs font-bold text-[#dcb8ff] sm:text-sm">
              {data.leader}
            </p>
            <span className="shrink-0 rounded border border-[#8a2be2]/40 bg-[#8a2be2]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#dcb8ff]">
              {t("iq_score", { score: data.iq_score })}
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-slate-400 sm:text-xs">{t("token_trend")}</p>
          <p className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-400 sm:text-sm">
            <Zap className="h-3 w-3 shrink-0" /> {data.token_trend}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-slate-400 sm:text-xs">{t("openai_api")}</p>
          <p className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-400 sm:text-sm">
            <Server className="h-3 w-3 shrink-0" /> {data.openai_status}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-slate-400 sm:text-xs">{t("anthropic_api")}</p>
          <p className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-400 sm:text-sm">
            <Server className="h-3 w-3 shrink-0" /> {data.anthropic_status}
          </p>
        </div>
      </div>
    </div>
  );
});

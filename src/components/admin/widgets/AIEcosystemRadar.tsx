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
    <div className="rounded-xl border border-[#27272a] bg-[#121216]/80 p-3.5 sm:p-4 backdrop-blur-md w-full min-w-0">
      <div className="flex items-center gap-2 mb-3 sm:mb-4 border-b border-[#27272a] pb-2 min-w-0">
        <Activity className="h-4 w-4 text-[#00f0ff] shrink-0" />
        <h3 className="text-xs sm:text-sm font-bold text-white truncate">{t("title")}</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs text-slate-400">{t("current_leader")}</p>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <p className="font-mono text-xs sm:text-sm font-bold text-[#dcb8ff] truncate">{data.leader}</p>
            <span className="rounded bg-[#8a2be2]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#dcb8ff] border border-[#8a2be2]/40 shrink-0">
              {t("iq_score", { score: data.iq_score })}
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs text-slate-400">{t("token_trend")}</p>
          <p className="font-mono text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1">
            <Zap className="h-3 w-3 shrink-0" /> {data.token_trend}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs text-slate-400">{t("openai_api")}</p>
          <p className="font-mono text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1">
            <Server className="h-3 w-3 shrink-0" /> {data.openai_status}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs text-slate-400">{t("anthropic_api")}</p>
          <p className="font-mono text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1">
            <Server className="h-3 w-3 shrink-0" /> {data.anthropic_status}
          </p>
        </div>
      </div>
    </div>
  );
});

export default AIEcosystemRadar;


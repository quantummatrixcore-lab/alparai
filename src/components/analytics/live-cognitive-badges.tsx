"use client";

import React, { useState } from "react";
import { BrainCircuit, ShieldCheck, CheckCircle2, Loader2, Play } from "lucide-react";

export type EngineStatus = "IDLE" | "PROCESSING" | "COMPLETED" | "ERROR";

export interface PipelineState {
  tom: EngineStatus;
  hephaestus: EngineStatus;
  tcsfl: EngineStatus;
}

/**
 * Live Cognitive Badges (Mikro-Aşama Görselleştirme)
 * Ajanların ardışık/spekülatif çalışma akışını kullanıcıya anlık (live) yansıtan UI bileşeni.
 */
export function LiveCognitiveBadges() {
  const [pipeline, setPipeline] = useState<PipelineState>({
    tom: "IDLE",
    hephaestus: "IDLE",
    tcsfl: "IDLE",
  });

  // Demo simülasyon fonksiyonu - Gerçekte SSE / WebSocket ile beslenecek
  const simulatePipeline = () => {
    setPipeline({ tom: "PROCESSING", hephaestus: "IDLE", tcsfl: "IDLE" });

    setTimeout(() => {
      // Pipelined Token Streaming (Tom bitti, Heph başlıyor, TCSFL spekülatif izliyor)
      setPipeline({ tom: "COMPLETED", hephaestus: "PROCESSING", tcsfl: "IDLE" });

      setTimeout(() => {
        setPipeline({ tom: "COMPLETED", hephaestus: "COMPLETED", tcsfl: "PROCESSING" });

        setTimeout(() => {
          setPipeline({ tom: "COMPLETED", hephaestus: "COMPLETED", tcsfl: "COMPLETED" });
        }, 1200);
      }, 2000);
    }, 800);
  };

  const getStatusConfig = (status: EngineStatus) => {
    switch (status) {
      case "PROCESSING":
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin text-purple-400" />,
          border: "border-purple-500/50",
          bg: "bg-purple-500/10",
          text: "text-purple-300",
        };
      case "COMPLETED":
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
          border: "border-emerald-500/50",
          bg: "bg-emerald-500/10",
          text: "text-emerald-300",
        };
      case "ERROR":
        return {
          icon: <ShieldCheck className="h-4 w-4 text-red-400" />,
          border: "border-red-500/50",
          bg: "bg-red-500/10",
          text: "text-red-300",
        };
      default:
        return {
          icon: <BrainCircuit className="h-4 w-4 text-zinc-500" />,
          border: "border-white/5",
          bg: "bg-zinc-900/50",
          text: "text-zinc-500",
        };
    }
  };

  const tomCfg = getStatusConfig(pipeline.tom);
  const hephCfg = getStatusConfig(pipeline.hephaestus);
  const tcsflCfg = getStatusConfig(pipeline.tcsfl);

  return (
    <div className="flex flex-col items-center space-y-4 rounded-2xl border border-white/5 bg-zinc-950/60 p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center space-x-2 text-xs font-bold tracking-wider text-zinc-400 uppercase">
        <BrainCircuit className="h-4 w-4" /> Cognitive Routing Pipeline
        <button
          onClick={simulatePipeline}
          className="ml-4 inline-flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-300 hover:bg-zinc-700"
        >
          <Play className="h-3 w-3" /> Simüle Et
        </button>
      </div>

      <div className="flex w-full items-center justify-between gap-2 sm:gap-4">
        {/* TOM Badge */}
        <div
          className={`flex flex-1 flex-col items-center gap-2 rounded-xl border ${tomCfg.border} ${tomCfg.bg} p-3 transition-colors duration-500`}
        >
          {tomCfg.icon}
          <div className="text-center">
            <span
              className={`block text-[10px] font-black tracking-wider uppercase ${tomCfg.text}`}
            >
              TOM
            </span>
            <span className="text-[9px] text-zinc-500">Niyet / Triage</span>
          </div>
        </div>

        <div
          className={`h-0.5 w-4 sm:w-8 ${pipeline.hephaestus !== "IDLE" ? "bg-purple-500/50" : "bg-white/5"} transition-colors duration-500`}
        />

        {/* HEPHAESTUS Badge */}
        <div
          className={`flex flex-1 flex-col items-center gap-2 rounded-xl border ${hephCfg.border} ${hephCfg.bg} p-3 transition-colors duration-500`}
        >
          {hephCfg.icon}
          <div className="text-center">
            <span
              className={`block text-[10px] font-black tracking-wider uppercase ${hephCfg.text}`}
            >
              HEPH
            </span>
            <span className="text-[9px] text-zinc-500">Kod / İcra</span>
          </div>
        </div>

        <div
          className={`h-0.5 w-4 sm:w-8 ${pipeline.tcsfl !== "IDLE" ? "bg-purple-500/50" : "bg-white/5"} transition-colors duration-500`}
        />

        {/* TCSFL Badge */}
        <div
          className={`flex flex-1 flex-col items-center gap-2 rounded-xl border ${tcsflCfg.border} ${tcsflCfg.bg} p-3 transition-colors duration-500`}
        >
          {tcsflCfg.icon}
          <div className="text-center">
            <span
              className={`block text-[10px] font-black tracking-wider uppercase ${tcsflCfg.text}`}
            >
              TCSFL
            </span>
            <span className="text-[9px] text-zinc-500">Doğrulama / AST</span>
          </div>
        </div>
      </div>
    </div>
  );
}

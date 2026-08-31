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
          icon: <BrainCircuit className="text-fg-muted h-4 w-4" />,
          border: "border-border-subtle/50",
          bg: "bg-bg-secondary/50",
          text: "text-fg-muted",
        };
    }
  };

  const tomCfg = getStatusConfig(pipeline.tom);
  const hephCfg = getStatusConfig(pipeline.hephaestus);
  const tcsflCfg = getStatusConfig(pipeline.tcsfl);

  return (
    <div className="border-border-subtle/50 flex flex-col items-center space-y-4 rounded-2xl border bg-bg-secondary/60 p-4 shadow-xl backdrop-blur-md">
      <div className="text-fg-muted flex items-center space-x-2 text-xs font-bold tracking-wider uppercase">
        <BrainCircuit className="h-4 w-4" /> Cognitive Routing Pipeline
        <button
          onClick={simulatePipeline}
          className="bg-bg-elevated text-fg-secondary ml-4 inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] hover:bg-bg-tertiary"
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
            <span className="text-fg-muted text-[9px]">Niyet / Triage</span>
          </div>
        </div>

        <div
          className={`h-0.5 w-4 sm:w-8 ${pipeline.hephaestus !== "IDLE" ? "bg-purple-500/50" : "bg-border-subtle"} transition-colors duration-500`}
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
            <span className="text-fg-muted text-[9px]">Kod / İcra</span>
          </div>
        </div>

        <div
          className={`h-0.5 w-4 sm:w-8 ${pipeline.tcsfl !== "IDLE" ? "bg-purple-500/50" : "bg-border-subtle"} transition-colors duration-500`}
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
            <span className="text-fg-muted text-[9px]">Doğrulama / AST</span>
          </div>
        </div>
      </div>
    </div>
  );
}

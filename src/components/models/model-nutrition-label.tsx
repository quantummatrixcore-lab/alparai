"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, Cpu, CheckCircle2 } from "lucide-react";

export interface ModelNutritionProps {
  modelName: string;
  provider: string;
  trustScore: number;
  hallucinationRate: string;
  latencyMs: number;
  complianceList: string[];
}

export function ModelNutritionLabel({
  modelName,
  provider,
  trustScore,
  hallucinationRate,
  latencyMs,
  complianceList,
}: ModelNutritionProps) {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border-subtle bg-bg-secondary/80 p-5 shadow-lg backdrop-blur-md transition-all hover:border-accent-primary/40">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-fg-muted">
            AI Safety Label
          </span>
          <h3 className="text-base font-extrabold text-fg-default">{modelName}</h3>
          <p className="text-xs text-fg-muted">{provider}</p>
        </div>
        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
          <span className="text-xs font-bold">TRUST</span>
          <span className="text-lg font-black">{trustScore}</span>
        </div>
      </div>

      {/* Core Metrics Grid */}
      <div className="my-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-white/[0.03] p-2.5 border border-white/[0.05]">
          <div className="flex items-center gap-1.5 text-fg-muted mb-1">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span>Halüsinasyon</span>
          </div>
          <span className="font-mono text-sm font-bold text-fg-default">
            {hallucinationRate}
          </span>
        </div>

        <div className="rounded-lg bg-white/[0.03] p-2.5 border border-white/[0.05]">
          <div className="flex items-center gap-1.5 text-fg-muted mb-1">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>Ort. Gecikme</span>
          </div>
          <span className="font-mono text-sm font-bold text-fg-default">
            {latencyMs} ms
          </span>
        </div>
      </div>

      {/* Compliance Badges */}
      <div>
        <span className="mb-2 block text-[11px] font-semibold text-fg-muted uppercase tracking-wider">
          Mevzuat & Standartlar
        </span>
        <div className="flex flex-wrap gap-1.5">
          {complianceList.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20"
            >
              <CheckCircle2 className="h-3 w-3" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Footer stamp */}
      <div className="mt-4 flex items-center justify-between border-t border-border-subtle/50 pt-2 text-[10px] text-fg-muted">
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3 w-3 text-accent-primary" /> Verified by ALPAR AI
        </span>
        <span className="font-mono">v1.0-Oracle</span>
      </div>
    </div>
  );
}

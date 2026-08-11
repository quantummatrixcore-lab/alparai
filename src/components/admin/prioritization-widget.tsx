"use client";

import { Activity, Rocket, Target, Shield, ArchiveX } from "lucide-react";

export function PrioritizationWidget() {
  return (
    <section className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-cyan-500/20 bg-zinc-900/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40 hover:bg-zinc-900/60 md:p-8">
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl transition-all duration-500 group-hover:bg-cyan-500/20" />

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-cyan-400">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Momentum K-Matrix</h2>
              <p className="text-xs text-zinc-400">Agent-OS Compute Allocation & Prioritization</p>
            </div>
          </div>
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
            Active
          </span>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-emerald-400">Tier 0 (70% Compute)</span>
              </div>
              <span className="text-xs font-medium text-zinc-300">Alparai, Agent-OS</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/40">
              <div className="h-full w-[70%] bg-emerald-500" />
            </div>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-400" />
                <span className="font-bold text-blue-400">Tier 1 (20% Compute)</span>
              </div>
              <span className="text-xs font-medium text-zinc-300">DecasHub</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/40">
              <div className="h-full w-[20%] bg-blue-500" />
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-400" />
                <span className="font-bold text-amber-400">Tier 2 (10% Compute)</span>
              </div>
              <span className="text-xs font-medium text-zinc-300">Ercument Erden</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/40">
              <div className="h-full w-[10%] bg-amber-500" />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-500/20 bg-zinc-500/5 p-4 opacity-70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArchiveX className="h-4 w-4 text-zinc-400" />
                <span className="font-bold text-zinc-400">Tier 3 (0% Compute)</span>
              </div>
              <span className="text-xs font-medium text-zinc-400">Tartarus Archives</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/40">
              <div className="h-full w-[0%] bg-zinc-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

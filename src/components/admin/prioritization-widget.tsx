"use client";

import { Activity, Rocket, Target, Shield, ArchiveX } from "lucide-react";

interface TierItem {
  name: string;
  share: number;
  projects: string;
  color: string;
  bgColor: string;
  borderColor: string;
  barColor: string;
  icon: typeof Rocket;
  opacity?: string;
}

const TIERS: TierItem[] = [
  {
    name: "Tier 0",
    share: 70,
    projects: "Alparai, Agent-OS",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/5",
    borderColor: "border-emerald-500/20",
    barColor: "bg-emerald-500",
    icon: Rocket,
  },
  {
    name: "Tier 1",
    share: 20,
    projects: "DecasHub",
    color: "text-blue-400",
    bgColor: "bg-blue-500/5",
    borderColor: "border-blue-500/20",
    barColor: "bg-blue-500",
    icon: Activity,
  },
  {
    name: "Tier 2",
    share: 10,
    projects: "Ercument Erden",
    color: "text-amber-400",
    bgColor: "bg-amber-500/5",
    borderColor: "border-amber-500/20",
    barColor: "bg-amber-500",
    icon: Shield,
  },
  {
    name: "Tier 3",
    share: 0,
    projects: "Tartarus Archives",
    color: "text-zinc-400",
    bgColor: "bg-zinc-500/5",
    borderColor: "border-zinc-500/20",
    barColor: "bg-zinc-500",
    icon: ArchiveX,
    opacity: "opacity-70",
  },
];

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
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className={`rounded-2xl border ${tier.borderColor} ${tier.bgColor} p-4 ${tier.opacity || ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${tier.color}`} />
                    <span className={`font-bold ${tier.color}`}>
                      {tier.name} ({tier.share}% Compute)
                    </span>
                  </div>
                  <span className="text-xs font-medium text-zinc-300">{tier.projects}</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/40">
                  <div className={`h-full ${tier.barColor}`} style={{ width: `${tier.share}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

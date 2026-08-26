import React from "react";

export interface DigitalTwinStatus {
  name: string;
  role: string;
  state: "ACTIVE" | "IDLE" | "EXECUTING" | "OPTIMIZING";
  tokenUsage: number;
  verificationBadge: string;
  focus: string;
}

export const ACTIVE_DIGITAL_TWINS: DigitalTwinStatus[] = [
  {
    name: "Mustafa Kemal Atatürk",
    role: "Supreme Commander & Meta-Orchestrator",
    state: "ACTIVE",
    tokenUsage: 1420,
    verificationBadge: "SOVEREIGN_PASSED",
    focus: "System Health & Strategic Victory",
  },
  {
    name: "Mimar Sinan",
    role: "Gaia Systems Architecture",
    state: "OPTIMIZING",
    tokenUsage: 890,
    verificationBadge: "EARTHQUAKE_PROOF",
    focus: "High-Availability Infrastructure",
  },
  {
    name: "Leonardo da Vinci",
    role: "Hephaestus UI/UX & Generative Forge",
    state: "ACTIVE",
    tokenUsage: 1120,
    verificationBadge: "AESTHETIC_GOLDEN_RATIO",
    focus: "WCAG 2.1 AA & Glassmorphism",
  },
  {
    name: "Nikola Tesla",
    role: "Omniauto Token Economy & Zero-Loss",
    state: "ACTIVE",
    tokenUsage: 450,
    verificationBadge: "ENERGY_EFFICIENCY_MAX",
    focus: "Zero Token Waste Protocol",
  },
  {
    name: "Alan Turing",
    role: "MCPHub Cryptographic Logic & Security",
    state: "EXECUTING",
    tokenUsage: 780,
    verificationBadge: "ZERO_TRUST_PROVED",
    focus: "Merkle Proof & Cryptographic Integrity",
  },
  {
    name: "Marcus Aurelius",
    role: "Omega Stoic Governance & Quality Gate",
    state: "ACTIVE",
    tokenUsage: 610,
    verificationBadge: "ETHICAL_ALIGNMENT_PASS",
    focus: "KVKK / GDPR / EU AI Act Audit",
  },
];

export function SwarmTelemetryWidget() {
  return (
    <div className="space-y-6 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 text-neutral-100 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
            <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
            ALPAR AI Digital Twin Swarm Telemetry
          </h2>
          <p className="text-sm text-neutral-400">
            Autonomous multi-agent orchestration & K-Matrix governance.
          </p>
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-emerald-400 uppercase">
          1000/1000 S-Tier Active
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ACTIVE_DIGITAL_TWINS.map((twin) => (
          <div
            key={twin.name}
            className="group rounded-xl border border-neutral-700/60 bg-neutral-800/50 p-4 transition-all duration-200 hover:border-neutral-500"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-white transition-colors group-hover:text-amber-300">
                {twin.name}
              </h3>
              <span className="rounded bg-neutral-700 px-2 py-0.5 font-mono text-[10px] text-neutral-300">
                {twin.state}
              </span>
            </div>
            <p className="mt-1 line-clamp-1 text-xs text-neutral-400">{twin.role}</p>

            <div className="mt-4 flex items-center justify-between border-t border-neutral-700/40 pt-3 text-xs">
              <span className="font-mono text-neutral-400">
                Tokens: {twin.tokenUsage.toLocaleString()}
              </span>
              <span className="rounded border border-emerald-800/40 bg-emerald-950/40 px-1.5 py-0.5 font-mono text-[10px] text-emerald-400">
                {twin.verificationBadge}
              </span>
            </div>
            <div className="mt-2 truncate text-[11px] text-neutral-300">
              <span className="text-neutral-500">Focus: </span>
              {twin.focus}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
    <div className="border-border-subtle bg-bg-secondary text-fg-primary space-y-4 sm:space-y-6 rounded-2xl border p-3.5 sm:p-6 shadow-2xl backdrop-blur-xl w-full min-w-0">
      <div className="border-border-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base sm:text-xl font-bold tracking-tight text-white truncate">
            <span className="inline-block h-2.5 w-2.5 sm:h-3 sm:w-3 animate-pulse rounded-full bg-emerald-500 shrink-0" />
            ALPAR AI Digital Twin Swarm Telemetry
          </h2>
          <p className="text-fg-muted text-[11px] sm:text-sm truncate">
            Autonomous multi-agent orchestration & K-Matrix governance.
          </p>
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold tracking-wider text-emerald-400 uppercase shrink-0 self-start sm:self-auto">
          1000/1000 S-Tier Active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {ACTIVE_DIGITAL_TWINS.map((twin) => (
          <div
            key={twin.name}
            className="group border-border-strong bg-bg-secondary rounded-xl border p-3 sm:p-4 transition-all duration-200 hover:border-neutral-500 min-w-0 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-xs sm:text-sm text-white transition-colors group-hover:text-amber-300 truncate">
                  {twin.name}
                </h3>
                <span className="text-fg-primary rounded bg-neutral-700 px-1.5 sm:px-2 py-0.5 font-mono text-[10px] shrink-0 font-bold">
                  {twin.state}
                </span>
              </div>
              <p className="text-fg-muted mt-1 line-clamp-1 text-[11px] sm:text-xs">{twin.role}</p>
            </div>

            <div>
              <div className="border-border-strong mt-3 sm:mt-4 flex items-center justify-between border-t pt-2.5 sm:pt-3 text-[11px] sm:text-xs">
                <span className="text-fg-muted font-mono truncate">
                  Tokens: {twin.tokenUsage.toLocaleString()}
                </span>
                <span className="rounded border border-emerald-800/40 bg-emerald-950/40 px-1.5 py-0.5 font-mono text-[10px] text-emerald-400 shrink-0 font-bold">
                  {twin.verificationBadge}
                </span>
              </div>
              <div className="text-fg-primary mt-1.5 sm:mt-2 truncate text-[10px] sm:text-[11px]">
                <span className="text-fg-muted">Focus: </span>
                {twin.focus}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

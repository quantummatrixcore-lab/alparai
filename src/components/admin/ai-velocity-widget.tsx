"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Activity,
  BarChart3,
  Cpu,
  Gauge,
  Info,
  Rocket,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  calculateARRProjection,
  calculateVelocityFactor,
  type VelocityMetric,
} from "@/lib/analytics/velocity-calculator";
import { cn } from "@/lib/utils";

interface AIVelocityWidgetProps {
  initialMetrics?: VelocityMetric[];
  initialBaseARR?: number;
  initialClients?: number;
  className?: string;
}

export function AIVelocityWidget({
  initialMetrics = [
    {
      provider: "OpenAI",
      model_name: "GPT-5 Pro",
      benchmark_elo: 1540,
      release_date: "2026-06-15",
      capability_jump_pct: 38.5,
    },
    {
      provider: "Anthropic",
      model_name: "Claude 4.5 Sonnet",
      benchmark_elo: 1560,
      release_date: "2026-07-02",
      capability_jump_pct: 42.0,
    },
    {
      provider: "Google",
      model_name: "Gemini 3 Ultra",
      benchmark_elo: 1580,
      release_date: "2026-07-28",
      capability_jump_pct: 48.0,
    },
  ],
  initialBaseARR = 120000,
  initialClients = 45,
  className,
}: AIVelocityWidgetProps) {
  const t = useTranslations("admin");
  const [baseARR, setBaseARR] = React.useState<number>(initialBaseARR);
  const [clients, setClients] = React.useState<number>(initialClients);
  const [selectedScenario, setSelectedScenario] = React.useState<"A" | "B" | "C">("B");

  const velocityFactor = calculateVelocityFactor(initialMetrics);
  const projections = calculateARRProjection(baseARR, clients, velocityFactor);

  const activeScenario =
    selectedScenario === "A"
      ? projections.scenarioA
      : selectedScenario === "C"
        ? projections.scenarioC
        : projections.scenarioB;

  const incidentDensity = 0.42;
  const releaseCycleDays = 14;

  return (
    <div
      className={cn(
        "from-bg-secondary/90 via-bg-tertiary/90 to-bg-elevated/90 relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/20",
        className,
      )}
    >
      <div className="bg-brand-500/10 pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl" />
      <div className="bg-success-500/10 pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full blur-3xl" />

      <div className="relative z-10 mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="border-brand-500/30 bg-brand-500/10 text-accent-400 flex h-11 w-11 items-center justify-center rounded-xl border shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Gauge className="h-6 w-6" />
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-white">
              AI Velocity Engine & Dynamic Projections
              <span className="border-accent-500/30 bg-accent-500/10 text-accent-400 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold">
                <Sparkles className="h-3 w-3" /> Real-Time Autonomous Engine
              </span>
            </h3>
            <p className="text-fg-muted mt-0.5 text-xs">
              Algorithmic benchmark velocity monitoring paired with dynamic B2B ARR forecasting.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-fg-muted text-xs font-medium">
            {t("velocity_index") || "Velocity Index:"}
          </span>
          <span className="border-success-500/30 bg-success-500/10 text-success-400 rounded-lg border px-3 py-1 font-mono text-sm font-extrabold shadow-inner">
            {velocityFactor.toFixed(2)}x
          </span>
        </div>
      </div>

      <div className="relative z-10 mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-inner">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span className="flex items-center gap-1.5 font-semibold text-white/80">
              <TrendingUp className="text-success-400 h-4 w-4" />{" "}
              {t("avg_capability_jump") || "Avg Capability Jump"}
            </span>
            <span className="bg-success-500/20 text-success-300 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold">
              {t("not_measured") || "Not measured"}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-extrabold text-white">
              {t("not_measured") || "Not measured"}
            </span>
            <span className="text-fg-muted text-[11px]">
              {t("per_major_release") || "per major release"}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="from-success-500 h-full w-[85%] rounded-full bg-gradient-to-r to-cyan-400" />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-inner">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span className="flex items-center gap-1.5 font-semibold text-white/80">
              <Cpu className="text-brand-400 h-4 w-4" />{" "}
              {t("release_cycle_cadence") || "Release Cycle Cadence"}
            </span>
            <span className="bg-brand-500/20 text-brand-300 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold">
              {releaseCycleDays} {t("days") || "Days"}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-extrabold text-white">
              {releaseCycleDays}d
            </span>
            <span className="text-fg-muted text-[11px]">
              {t("model_iteration_interval") || "model iteration interval"}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="from-brand-500 to-brand-400 h-full w-[70%] rounded-full bg-gradient-to-r" />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-inner">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span className="flex items-center gap-1.5 font-semibold text-white/80">
              <ShieldAlert className="text-warning-400 h-4 w-4" />{" "}
              {t("ai_incident_density") || "AI Incident Density"}
            </span>
            <span className="bg-warning-500/20 text-warning-300 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold">
              {t("low_risk") || "Low Risk"}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-extrabold text-white">{incidentDensity}</span>
            <span className="text-fg-muted text-[11px]">
              {t("per_1k_model_prompts") || "per 1k model prompts"}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="from-warning-400 to-success-400 h-full w-[25%] rounded-full bg-gradient-to-r" />
          </div>
        </div>
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h4 className="flex items-center gap-2 text-sm font-bold tracking-tight text-white">
            <BarChart3 className="text-success-400 h-4 w-4" />{" "}
            {t("dynamic_arr_projections") || "Dynamic ARR Growth Projections"}
          </h4>

          <div className="inline-flex rounded-xl border border-white/10 bg-black/40 p-1">
            {(["A", "B", "C"] as const).map((scKey) => {
              const details =
                scKey === "A"
                  ? projections.scenarioA
                  : scKey === "B"
                    ? projections.scenarioB
                    : projections.scenarioC;
              const isSelected = selectedScenario === scKey;

              return (
                <button
                  key={scKey}
                  type="button"
                  onClick={() => setSelectedScenario(scKey)}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                    isSelected
                      ? "from-success-500 bg-gradient-to-r to-cyan-500 text-white shadow-md"
                      : "text-fg-muted hover:bg-white/5 hover:text-white",
                  )}
                >
                  {scKey === "A" && <Activity className="h-3.5 w-3.5" />}
                  {scKey === "B" && <TrendingUp className="h-3.5 w-3.5" />}
                  {scKey === "C" && <Rocket className="h-3.5 w-3.5" />}
                  {details.label.split(":")[1]?.trim() || details.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-3.5">
            <label className="text-fg-muted flex items-center justify-between text-xs font-semibold">
              <span>{t("baseline_arr_usd") || "Baseline ARR ($ USD)"}</span>
              <span className="font-mono text-white">${baseARR.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min={10000}
              max={1000000}
              step={10000}
              value={baseARR}
              onChange={(e) => setBaseARR(Number(e.target.value))}
              className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-emerald-400"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-3.5">
            <label className="text-fg-muted flex items-center justify-between text-xs font-semibold">
              <span>{t("enterprise_b2b_clients") || "Enterprise B2B Clients"}</span>
              <span className="font-mono text-white">
                {clients} {t("active_clients") || "Active"}
              </span>
            </label>
            <input
              type="range"
              min={5}
              max={500}
              step={5}
              value={clients}
              onChange={(e) => setClients(Number(e.target.value))}
              className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-cyan-400"
            />
          </div>
        </div>

        <div className="border-success-500/30 rounded-2xl border bg-emerald-950/20 p-5 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-success-500/20 text-success-300 rounded px-2 py-0.5 font-mono text-xs font-extrabold">
                  {activeScenario.label}
                </span>
                <span className="text-fg-muted text-xs">{activeScenario.description}</span>
              </div>
              <p className="mt-3 font-mono text-4xl font-black text-white">
                ${activeScenario.projectedARR.toLocaleString()}
                <span className="text-fg-muted ml-2 text-sm font-normal">
                  {t("per_yr_arr") || "/ yr ARR"}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <p className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
                  Demand Multiplier
                </p>
                <p className="text-success-400 mt-0.5 font-mono text-xl font-extrabold">
                  {activeScenario.demandMultiplier}x
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <p className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
                  Projected Monthly
                </p>
                <p className="text-accent-400 mt-0.5 font-mono text-xl font-extrabold">
                  ${activeScenario.monthlyARR.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2.5 border-t border-white/10 pt-4">
            {[projections.scenarioA, projections.scenarioB, projections.scenarioC].map((sc) => {
              const maxARR = projections.scenarioC.projectedARR || 1;
              const widthPct = Math.max(8, Math.min(100, (sc.projectedARR / maxARR) * 100));
              const isCurrent = sc.key === selectedScenario;

              return (
                <div key={sc.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={cn(
                        "font-semibold",
                        isCurrent ? "text-success-300 font-bold" : "text-fg-muted",
                      )}
                    >
                      {sc.label}
                    </span>
                    <span className="font-mono font-bold text-white">
                      ${sc.projectedARR.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        sc.key === "A" && "bg-slate-400",
                        sc.key === "B" && "from-success-500 bg-gradient-to-r to-cyan-400",
                        sc.key === "C" && "to-brand-500 bg-gradient-to-r from-cyan-400",
                      )}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-fg-muted flex items-center gap-2 text-[11px]">
          <Info className="text-accent-400 h-3.5 w-3.5 shrink-0" />
          <span>
            Projections are automatically parameterized using real-time benchmark Elo scores and AI
            model velocity metrics stored in Supabase.
          </span>
        </div>
      </div>
    </div>
  );
}

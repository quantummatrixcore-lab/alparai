"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  calculateVelocityFactor,
  calculateARRProjection,
  type VelocityMetric,
} from "@/lib/analytics/velocity-calculator";
import { VelocityMetricsCard } from "./velocity-metrics-card";
import { ARRProjectionCharts } from "./arr-projection-charts";
import { Gauge, Sliders, Cpu, Sparkles } from "lucide-react";

const INITIAL_METRICS: VelocityMetric[] = [
  {
    provider: "Anthropic",
    model_name: "Claude 3.5 Sonnet",
    benchmark_elo: 1380,
    release_date: "2026-06",
    capability_jump_pct: 28,
  },
  {
    provider: "Google DeepMind",
    model_name: "Gemini 2.5 Pro",
    benchmark_elo: 1410,
    release_date: "2026-05",
    capability_jump_pct: 35,
  },
  {
    provider: "OpenAI",
    model_name: "GPT-4.5 Orion",
    benchmark_elo: 1395,
    release_date: "2026-04",
    capability_jump_pct: 24,
  },
  {
    provider: "Meta AI",
    model_name: "Llama 4 405B",
    benchmark_elo: 1360,
    release_date: "2026-03",
    capability_jump_pct: 19,
  },
  {
    provider: "DeepSeek",
    model_name: "DeepSeek V4",
    benchmark_elo: 1375,
    release_date: "2026-06",
    capability_jump_pct: 30,
  },
];

export function VelocityDashboard() {
  const t = useTranslations("velocity");
  const [baseARR, setBaseARR] = useState<number>(250000);
  const [clients, setClients] = useState<number>(25);

  const velocityFactor = calculateVelocityFactor(INITIAL_METRICS);
  const projectionResult = calculateARRProjection(baseARR, clients, velocityFactor);

  return (
    <div className="space-y-8">
      {/* Spatial Glassmorphism Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900/90 via-neutral-900/60 to-neutral-950/90 p-8 shadow-2xl backdrop-blur-2xl"
      >
        <div className="bg-accent-500/10 pointer-events-none absolute -top-32 -left-32 h-64 w-64 rounded-full blur-3xl" />
        <div className="bg-brand-500/10 pointer-events-none absolute -right-32 -bottom-32 h-64 w-64 rounded-full blur-3xl" />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="border-accent-500/30 bg-accent-500/10 text-accent-400 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("header_badge")}</span>
            </div>
            <h1 className="text-fg-primary text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              {t("header_title")}
            </h1>
            <p className="text-fg-muted text-sm leading-relaxed sm:text-base">
              {t("header_description")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#scenarios"
              className="border-accent-500/30 bg-accent-500/10 text-accent-300 hover:bg-accent-500/20 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all"
            >
              <Gauge className="h-4 w-4" />
              {t("cta_scenarios")}
            </a>
          </div>
        </div>
      </motion.div>

      {/* Metrics Cards */}
      <VelocityMetricsCard
        velocityFactor={velocityFactor}
        baseARR={baseARR}
        clientCount={clients}
        avgJumpPct={27.2}
        totalModelsTracked={INITIAL_METRICS.length}
      />

      {/* Interactive Controls & Scenario Modeler */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-xl lg:col-span-1"
        >
          <div className="text-fg-primary flex items-center gap-2 text-sm font-bold">
            <Sliders className="text-accent-400 h-4 w-4" />
            <span>{t("simulator_title")}</span>
          </div>
          <p className="text-fg-muted mt-1 text-xs">{t("simulator_subtitle")}</p>

          <div className="mt-6 space-y-6">
            {/* Base ARR Input */}
            <div>
              <div className="mb-2 flex justify-between text-xs font-medium">
                <span className="text-fg-muted">{t("input_base_arr")}</span>
                <span className="text-accent-400 font-bold">${baseARR.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={50000}
                max={2000000}
                step={25000}
                value={baseARR}
                onChange={(e) => setBaseARR(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-800 accent-cyan-400"
              />
              <div className="text-fg-muted mt-1 flex justify-between text-[10px]">
                <span>$50k</span>
                <span>$1M</span>
                <span>$2M</span>
              </div>
            </div>

            {/* Client Count Input */}
            <div>
              <div className="mb-2 flex justify-between text-xs font-medium">
                <span className="text-fg-muted">{t("input_clients")}</span>
                <span className="text-success-400 font-bold">
                  {clients} {t("clients_suffix")}
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={200}
                step={5}
                value={clients}
                onChange={(e) => setClients(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-800 accent-emerald-400"
              />
              <div className="text-fg-muted mt-1 flex justify-between text-[10px]">
                <span>5</span>
                <span>100</span>
                <span>200</span>
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-white/5 bg-neutral-950/40 p-4 text-xs">
              <div className="text-fg-muted flex justify-between">
                <span>{t("calc_velocity_factor")}</span>
                <span className="text-fg-primary font-mono">{velocityFactor}x</span>
              </div>
              <div className="text-fg-muted flex justify-between">
                <span>{t("calc_demand_mult")}</span>
                <span className="text-success-400 font-mono">
                  {(velocityFactor * 1.8).toFixed(2)}x
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ARR Projection Chart */}
        <div className="lg:col-span-2">
          <ARRProjectionCharts scenarioResult={projectionResult} />
        </div>
      </div>

      {/* Scenario Detail Cards */}
      <div id="scenarios" className="space-y-4">
        <h2 className="text-fg-primary text-xl font-bold tracking-tight">
          {t("scenarios_heading")}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Scenario A */}
          <div className="border-brand-500/20 rounded-2xl border bg-neutral-900/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-brand-400 text-xs font-bold tracking-wider uppercase">
                {t("scenario_a_tag")}
              </span>
              <span className="bg-brand-500/10 text-brand-400 rounded-md px-2 py-0.5 text-[11px] font-semibold">
                V = 1.0x
              </span>
            </div>
            <h3 className="text-fg-primary mt-3 text-lg font-bold">{t("scenario_a_title")}</h3>
            <p className="text-fg-muted mt-1 text-xs leading-relaxed">{t("scenario_a_desc")}</p>
            <div className="mt-6 border-t border-white/5 pt-4">
              <div className="text-fg-muted text-[11px]">{t("projected_arr")}</div>
              <div className="text-fg-primary text-2xl font-extrabold">
                ${projectionResult.scenarioA.projectedARR.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Scenario B */}
          <div className="border-success-500/30 relative overflow-hidden rounded-2xl border bg-neutral-900/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="bg-success-500/10 pointer-events-none absolute top-0 right-0 h-20 w-20 rounded-full blur-2xl" />
            <div className="flex items-center justify-between">
              <span className="text-success-400 text-xs font-bold tracking-wider uppercase">
                {t("scenario_b_tag")}
              </span>
              <span className="bg-success-500/10 text-success-400 rounded-md px-2 py-0.5 text-[11px] font-semibold">
                V = 1.8x
              </span>
            </div>
            <h3 className="text-fg-primary mt-3 text-lg font-bold">{t("scenario_b_title")}</h3>
            <p className="text-fg-muted mt-1 text-xs leading-relaxed">{t("scenario_b_desc")}</p>
            <div className="mt-6 border-t border-white/5 pt-4">
              <div className="text-fg-muted text-[11px]">{t("projected_arr")}</div>
              <div className="text-success-400 text-2xl font-extrabold">
                ${projectionResult.scenarioB.projectedARR.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Scenario C */}
          <div className="border-brand-500/30 relative overflow-hidden rounded-2xl border bg-neutral-900/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="bg-brand-500/10 pointer-events-none absolute top-0 right-0 h-20 w-20 rounded-full blur-2xl" />
            <div className="flex items-center justify-between">
              <span className="text-brand-400 text-xs font-bold tracking-wider uppercase">
                {t("scenario_c_tag")}
              </span>
              <span className="bg-brand-500/10 text-brand-400 rounded-md px-2 py-0.5 text-[11px] font-semibold">
                V = 3.5x
              </span>
            </div>
            <h3 className="text-fg-primary mt-3 text-lg font-bold">{t("scenario_c_title")}</h3>
            <p className="text-fg-muted mt-1 text-xs leading-relaxed">{t("scenario_c_desc")}</p>
            <div className="mt-6 border-t border-white/5 pt-4">
              <div className="text-fg-muted text-[11px]">{t("projected_arr")}</div>
              <div className="text-brand-400 text-2xl font-extrabold">
                ${projectionResult.scenarioC.projectedARR.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Capability Audit Table */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-xl">
        <div className="text-fg-primary mb-4 flex items-center gap-2 text-base font-bold">
          <Cpu className="text-accent-400 h-5 w-5" />
          <span>{t("table_title")}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-fg-muted border-b border-white/10 text-[10px] tracking-wider uppercase">
              <tr>
                <th className="px-4 py-3">{t("th_provider")}</th>
                <th className="px-4 py-3">{t("th_model")}</th>
                <th className="px-4 py-3">{t("th_elo")}</th>
                <th className="px-4 py-3">{t("th_release")}</th>
                <th className="px-4 py-3">{t("th_jump")}</th>
              </tr>
            </thead>
            <tbody className="text-fg-primary divide-y divide-white/5 font-medium">
              {INITIAL_METRICS.map((item, idx) => (
                <tr key={idx} className="transition-colors hover:bg-white/5">
                  <td className="text-accent-400 px-4 py-3 font-semibold">{item.provider}</td>
                  <td className="px-4 py-3">{item.model_name}</td>
                  <td className="px-4 py-3 font-mono">{item.benchmark_elo}</td>
                  <td className="text-fg-muted px-4 py-3">{item.release_date}</td>
                  <td className="px-4 py-3">
                    <span className="bg-success-500/10 text-success-400 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold">
                      +{item.capability_jump_pct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Zap, TrendingUp, Cpu, Rocket, ShieldCheck, Activity } from "lucide-react";
import { useTranslations } from "next-intl";

interface VelocityMetricsCardProps {
  velocityFactor: number;
  baseARR: number;
  clientCount: number;
  avgJumpPct?: number;
  totalModelsTracked?: number;
}

export function VelocityMetricsCard({
  velocityFactor,
  baseARR,
  clientCount,
  avgJumpPct = 27.2,
  totalModelsTracked = 5,
}: VelocityMetricsCardProps) {
  const t = useTranslations("velocity");

  const getVelocityBadge = (v: number) => {
    if (v >= 3.0)
      return {
        label: t("status_agi"),
        color: "bg-brand-500/20 text-brand-400 border-brand-500/30",
      };
    if (v >= 1.5)
      return {
        label: t("status_exponential"),
        color: "bg-success-500/20 text-success-400 border-success-500/30",
      };
    return {
      label: t("status_linear"),
      color: "bg-brand-500/20 text-brand-400 border-brand-500/30",
    };
  };

  const badge = getVelocityBadge(velocityFactor);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Primary Delta V AI Index Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-accent-500/30 hover:border-accent-500/50 bg-bg-secondary relative overflow-hidden rounded-2xl border p-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] backdrop-blur-xl transition-all duration-300 lg:col-span-2"
      >
        <div className="bg-accent-500/10 pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="border-accent-500/30 bg-accent-500/10 text-accent-400 flex h-10 w-10 items-center justify-center rounded-xl border">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-fg-primary text-sm font-semibold">{t("delta_v_index_title")}</h3>
              <p className="text-fg-muted text-xs">{t("delta_v_index_subtitle")}</p>
            </div>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md ${badge.color}`}
          >
            {badge.label}
          </span>
        </div>

        <div className="mt-6 flex items-baseline gap-3">
          <span className="to-success-400 bg-gradient-to-r from-cyan-400 via-teal-300 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
            {velocityFactor.toFixed(2)}x
          </span>
          <span className="text-success-400 flex items-center gap-1 text-xs font-medium">
            <TrendingUp className="h-3.5 w-3.5" />+{((velocityFactor - 1.0) * 100).toFixed(0)}%{" "}
            {t("vs_baseline")}
          </span>
        </div>

        <p className="text-fg-muted mt-3 text-xs leading-relaxed">{t("delta_v_description")}</p>
      </motion.div>

      {/* Avg Capability Jump Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border-border-subtle bg-bg-secondary hover:border-border-strong relative overflow-hidden rounded-2xl border p-6 shadow-xl backdrop-blur-xl transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <span className="text-fg-muted text-xs font-medium">{t("avg_jump_title")}</span>
          <Cpu className="text-brand-400 h-4 w-4" />
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-fg-primary text-3xl font-bold">+{avgJumpPct}%</span>
        </div>
        <div className="text-brand-400 mt-2 flex items-center gap-1.5 text-xs">
          <Activity className="h-3.5 w-3.5" />
          <span>
            {totalModelsTracked} {t("models_audited")}
          </span>
        </div>
      </motion.div>

      {/* Base ARR & Active Clients Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border-border-subtle bg-bg-secondary hover:border-border-strong relative overflow-hidden rounded-2xl border p-6 shadow-xl backdrop-blur-xl transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <span className="text-fg-muted text-xs font-medium">{t("base_arr_title")}</span>
          <Rocket className="text-warning-400 h-4 w-4" />
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-fg-primary text-3xl font-bold">
            ${(baseARR / 1000).toFixed(0)}k
          </span>
          <span className="text-fg-muted text-xs">ARR</span>
        </div>
        <div className="text-warning-400 mt-2 flex items-center gap-1.5 text-xs">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>
            {clientCount} {t("enterprise_clients")}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

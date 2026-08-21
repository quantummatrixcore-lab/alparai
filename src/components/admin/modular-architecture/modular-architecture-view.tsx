"use client";

import { motion, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Layers,
  Award,
  ShieldCheck,
  CheckCircle2,
  Eye,
  BarChart2,
  Activity,
  AlertTriangle,
  Globe,
  Code,
} from "lucide-react";
import type { ModularArchitectureOverview } from "@/actions/admin/modular-architecture";

const ICON_MAP: Record<string, React.ReactNode> = {
  Eye: <Eye className="text-brand-400 h-6 w-6" />,
  ShieldCheck: <ShieldCheck className="text-success-400 h-6 w-6" />,
  BarChart2: <BarChart2 className="text-accent-400 h-6 w-6" />,
  CheckCircle2: <CheckCircle2 className="text-warning-400 h-6 w-6" />,
  Activity: <Activity className="text-danger-400 h-6 w-6" />,
  AlertTriangle: <AlertTriangle className="text-warning-400 h-6 w-6" />,
  Globe: <Globe className="text-brand-400 h-6 w-6" />,
  Code: <Code className="text-accent-400 h-6 w-6" />,
};

interface ModularArchitectureViewProps {
  data: ModularArchitectureOverview;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export function ModularArchitectureView({ data }: ModularArchitectureViewProps) {
  const t = useTranslations("admin");

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="bg-bg-tertiary/40 mx-auto max-w-7xl space-y-8 rounded-[2.5rem] p-6 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl md:p-10 lg:p-12"
      >
        <motion.div variants={itemVariants}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="to-brand-500/20 ring-accent-500/30 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 ring-1">
              <Layers className="text-accent-400 h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl lg:text-5xl">
                {data.umbrellaTitle}
              </h1>
              <p className="text-fg-muted mt-2 text-sm sm:text-base lg:text-lg">{data.tagline}</p>
            </div>
          </div>
        </motion.div>

        {/* GPT 360 Benchmark Scorecard */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent md:grid-cols-3"
        >
          <div className="flex flex-col items-start justify-center border-b border-white/5 p-6 sm:p-8 md:border-r md:border-b-0">
            <div className="text-fg-muted flex items-center gap-2 text-sm font-medium">
              <Award className="text-warning-400 h-5 w-5" />
              <span>{t("gpt_360_evaluation_score")}</span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-success-400 text-6xl font-black tracking-tighter lg:text-7xl">
                {data.auditScore.overallScore}
              </span>
              <span className="text-fg-disabled text-2xl font-bold">
                / {data.auditScore.maxScore}
              </span>
            </div>
            <p className="text-fg-muted mt-3 text-xs leading-relaxed">
              {t("targeted_roadmap_optimization_to_reach_1")}
            </p>
          </div>

          <div className="border-b border-white/5 p-6 sm:p-8 md:border-r md:border-b-0">
            <h3 className="text-success-400 mb-5 flex items-center gap-2 font-mono text-xs font-semibold tracking-widest uppercase">
              <span className="bg-success-400 h-2 w-2 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              {t("top_strengths")}
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(data?.auditScore?.strengths || []).map((s) => (
                <div
                  key={s.category}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 px-3 py-2 transition-colors hover:bg-black/60"
                >
                  <span className="text-fg-secondary text-xs">{s.category}</span>
                  <span className="text-success-400 font-mono text-sm font-bold">{s.score}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h3 className="text-warning-400 mb-5 flex items-center gap-2 font-mono text-xs font-semibold tracking-widest uppercase">
              <span className="bg-warning-400 h-2 w-2 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              {t("growth_bottlenecks")}
            </h3>
            <div className="space-y-3">
              {(data?.auditScore?.growthAreas || []).map((g) => (
                <div
                  key={g.category}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 px-3 py-2 transition-colors hover:bg-black/60"
                >
                  <span className="text-fg-secondary text-xs">{g.category}</span>
                  <span className="text-warning-400 font-mono text-sm font-bold">{g.score}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 8 Modular Product Pillars */}
        <motion.div variants={itemVariants} className="pt-6">
          <h2 className="mb-6 text-xl font-bold tracking-tight text-white lg:text-2xl">
            {t("the_8_modular_product_pillars")}
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(data?.pillars || []).map((pillar) => (
              <motion.div
                key={pillar.id}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-5 shadow-lg backdrop-blur-md transition-all hover:border-white/20 hover:shadow-2xl hover:shadow-white/5"
              >
                {/* Glow effect on hover */}
                <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white/0 via-white/0 to-white/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/50 shadow-inner">
                      {ICON_MAP[pillar.iconName]}
                    </div>
                    <span className="text-fg-muted rounded-full bg-white/5 px-2.5 py-1 font-mono text-[10px] font-medium tracking-widest">
                      {t("pillar_0")}
                      {pillar.number}
                    </span>
                  </div>
                  <div>
                    <h3 className="group-hover:text-accent-100 text-base font-bold text-white transition-colors">
                      {pillar.name}
                    </h3>
                    <div className="border-accent-500/20 bg-accent-500/10 text-accent-400 mt-2 inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[10px] font-medium">
                      {pillar.tagline}
                    </div>
                    <p className="text-fg-muted group-hover:text-fg-secondary mt-3 text-xs leading-relaxed transition-colors">
                      {pillar.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4">
                  <code className="text-fg-disabled group-hover:text-fg-muted block w-full truncate rounded-lg bg-black/40 px-3 py-2 font-mono text-[10px] transition-colors">
                    {pillar.route}
                  </code>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

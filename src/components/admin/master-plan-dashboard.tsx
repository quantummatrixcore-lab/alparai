"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  Zap,
  Target,
  AlertTriangle,
  Layers,
} from "lucide-react";
import type { PlanItem } from "@/lib/utils/markdown-parser";

interface MasterPlanDashboardProps {
  items: PlanItem[];
}

export function MasterPlanDashboard({ items }: MasterPlanDashboardProps) {
  const pending = items.filter((i) => i.status === "pending").length;
  const completed = items.filter((i) => i.status === "completed").length;
  const paused = items.filter((i) => i.status === "paused").length;
  const total = items.length;

  const activeItems = total - paused;
  const activeCompletionRate = activeItems > 0 ? Math.round((completed / activeItems) * 100) : 0;

  // Calculate Priority Distribution
  const p0 = items.filter((i) => i.priority.includes("P0")).length;
  const p1 = items.filter((i) => i.priority.includes("P1")).length;

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Overall Progress Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group border-accent-500/20 bg-bg-elevated/40 hover:border-accent-500/40 hover:bg-bg-elevated/60 relative overflow-hidden rounded-2xl border p-6 backdrop-blur-xl transition-all"
      >
        <div className="bg-accent-500/10 group-hover:bg-accent-500/20 absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl transition-all" />
        <div className="mb-4 flex items-center gap-3">
          <div className="border-accent-500/30 bg-accent-500/10 text-accent-400 rounded-xl border p-2.5">
            <Target className="h-5 w-5" />
          </div>
          <h3 className="text-fg-secondary text-sm font-semibold tracking-wider uppercase">
            Master Plan Progress
          </h3>
        </div>
        <div className="mb-4 flex items-end gap-2">
          <span className="text-4xl font-black text-white">{activeCompletionRate}%</span>
          <span className="text-fg-disabled mb-1 text-sm font-medium">Active</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-black/50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${activeCompletionRate}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
          />
        </div>
      </motion.div>

      {/* Task Distribution Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="group border-success-500/20 bg-bg-elevated/40 hover:border-success-500/40 hover:bg-bg-elevated/60 relative overflow-hidden rounded-2xl border p-6 backdrop-blur-xl transition-all"
      >
        <div className="bg-success-500/10 group-hover:bg-success-500/20 absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl transition-all" />
        <div className="mb-4 flex items-center gap-3">
          <div className="border-success-500/30 bg-success-500/10 text-success-400 rounded-xl border p-2.5">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="text-fg-secondary text-sm font-semibold tracking-wider uppercase">
            Task Distribution
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="border-border-subtle/50 bg-bg-primary/20 flex flex-col items-center rounded-lg border p-2">
            <CheckCircle2 className="text-success-400 mb-1 h-4 w-4" />
            <span className="text-success-400 text-lg font-bold">{completed}</span>
            <span className="text-fg-disabled text-[10px] font-semibold uppercase">Done</span>
          </div>
          <div className="border-border-subtle/50 bg-bg-primary/20 flex flex-col items-center rounded-lg border p-2">
            <Clock className="text-warning-400 mb-1 h-4 w-4" />
            <span className="text-warning-400 text-lg font-bold">{pending}</span>
            <span className="text-fg-disabled text-[10px] font-semibold uppercase">Pend</span>
          </div>
          <div className="border-border-subtle/50 bg-bg-primary/20 flex flex-col items-center rounded-lg border p-2">
            <Circle className="text-brand-400 mb-1 h-4 w-4" />
            <span className="text-brand-400 text-lg font-bold">{paused}</span>
            <span className="text-fg-disabled text-[10px] font-semibold uppercase">Pause</span>
          </div>
        </div>
      </motion.div>

      {/* Priority Radar Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="group border-danger-500/20 bg-bg-elevated/40 hover:border-danger-500/40 hover:bg-bg-elevated/60 relative overflow-hidden rounded-2xl border p-6 backdrop-blur-xl transition-all"
      >
        <div className="bg-danger-500/10 group-hover:bg-danger-500/20 absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl transition-all" />
        <div className="mb-4 flex items-center gap-3">
          <div className="border-danger-500/30 bg-danger-500/10 text-danger-400 rounded-xl border p-2.5">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="text-fg-secondary text-sm font-semibold tracking-wider uppercase">
            Priority Radar
          </h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-danger-400 text-xs font-bold tracking-wider">P0 (CRITICAL)</span>
            <span className="text-sm font-bold text-white">{p0}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-black/50">
            <div
              className="bg-danger-500 h-full rounded-full"
              style={{ width: `${Math.min((p0 / 10) * 100, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-warning-400 text-xs font-bold tracking-wider">P1 (HIGH)</span>
            <span className="text-sm font-bold text-white">{p1}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-black/50">
            <div
              className="bg-warning-500 h-full rounded-full"
              style={{ width: `${Math.min((p1 / 20) * 100, 100)}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Velocity Metrics Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="group border-brand-500/20 bg-bg-elevated/40 hover:border-brand-500/40 hover:bg-bg-elevated/60 relative overflow-hidden rounded-2xl border p-6 backdrop-blur-xl transition-all"
      >
        <div className="bg-brand-500/10 group-hover:bg-brand-500/20 absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl transition-all" />
        <div className="mb-4 flex items-center gap-3">
          <div className="border-brand-500/30 bg-brand-500/10 text-brand-400 rounded-xl border p-2.5">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="text-fg-secondary text-sm font-semibold tracking-wider uppercase">
            Velocity Score
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-2">
          <div className="text-brand-400 flex items-baseline gap-1">
            <span className="text-3xl font-black">
              {total > 0 ? Math.round(completed * 1.5) : 0}
            </span>
            <span className="text-sm font-bold">pts/sprint</span>
          </div>
          <div className="border-success-500/20 bg-success-500/10 text-success-400 mt-2 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
            <TrendingUp className="h-3 w-3" />
            <span>Optimum Level</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

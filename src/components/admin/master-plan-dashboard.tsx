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
        className="group relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-zinc-900/40 p-6 backdrop-blur-xl transition-all hover:border-cyan-500/40 hover:bg-zinc-900/60"
      >
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl transition-all group-hover:bg-cyan-500/20" />
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2.5 text-cyan-400">
            <Target className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold tracking-wider text-zinc-300 uppercase">
            Master Plan Progress
          </h3>
        </div>
        <div className="mb-4 flex items-end gap-2">
          <span className="text-4xl font-black text-white">{activeCompletionRate}%</span>
          <span className="mb-1 text-sm font-medium text-zinc-500">Active</span>
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
        className="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-zinc-900/40 p-6 backdrop-blur-xl transition-all hover:border-emerald-500/40 hover:bg-zinc-900/60"
      >
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl transition-all group-hover:bg-emerald-500/20" />
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-emerald-400">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold tracking-wider text-zinc-300 uppercase">
            Task Distribution
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="flex flex-col items-center rounded-lg border border-white/5 bg-black/20 p-2">
            <CheckCircle2 className="mb-1 h-4 w-4 text-emerald-400" />
            <span className="text-lg font-bold text-emerald-400">{completed}</span>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase">Done</span>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-white/5 bg-black/20 p-2">
            <Clock className="mb-1 h-4 w-4 text-amber-400" />
            <span className="text-lg font-bold text-amber-400">{pending}</span>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase">Pend</span>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-white/5 bg-black/20 p-2">
            <Circle className="mb-1 h-4 w-4 text-purple-400" />
            <span className="text-lg font-bold text-purple-400">{paused}</span>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase">Pause</span>
          </div>
        </div>
      </motion.div>

      {/* Priority Radar Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="group relative overflow-hidden rounded-2xl border border-rose-500/20 bg-zinc-900/40 p-6 backdrop-blur-xl transition-all hover:border-rose-500/40 hover:bg-zinc-900/60"
      >
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-rose-500/10 blur-3xl transition-all group-hover:bg-rose-500/20" />
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold tracking-wider text-zinc-300 uppercase">
            Priority Radar
          </h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-rose-400">P0 (CRITICAL)</span>
            <span className="text-sm font-bold text-white">{p0}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-black/50">
            <div
              className="h-full rounded-full bg-rose-500"
              style={{ width: `${Math.min((p0 / 10) * 100, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-amber-400">P1 (HIGH)</span>
            <span className="text-sm font-bold text-white">{p1}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-black/50">
            <div
              className="h-full rounded-full bg-amber-500"
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
        className="group relative overflow-hidden rounded-2xl border border-purple-500/20 bg-zinc-900/40 p-6 backdrop-blur-xl transition-all hover:border-purple-500/40 hover:bg-zinc-900/60"
      >
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl transition-all group-hover:bg-purple-500/20" />
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-2.5 text-purple-400">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold tracking-wider text-zinc-300 uppercase">
            Velocity Score
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-2">
          <div className="flex items-baseline gap-1 text-purple-400">
            <span className="text-3xl font-black">
              {total > 0 ? Math.round(completed * 1.5) : 0}
            </span>
            <span className="text-sm font-bold">pts/sprint</span>
          </div>
          <div className="mt-2 flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-400 uppercase">
            <TrendingUp className="h-3 w-3" />
            <span>Optimum Level</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

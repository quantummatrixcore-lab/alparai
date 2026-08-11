import { parseMasterPlan } from "@/lib/utils/markdown-parser";
import { Target, CheckCircle2, CircleDashed, PauseCircle, AlertTriangle } from "lucide-react";

export function PrioritizationWidget() {
  const { items, error } = parseMasterPlan();

  const total = items.length;
  const completed = items.filter((i) => i.status === "completed").length;
  const pending = items.filter((i) => i.status === "pending").length;
  const paused = items.filter((i) => i.status === "paused").length;

  const priorityCounts = items.reduce(
    (acc, item) => {
      const p = item.priority || "Unassigned";
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const completedPerc = total > 0 ? Math.round((completed / total) * 100) : 0;
  const pendingPerc = total > 0 ? Math.round((pending / total) * 100) : 0;
  const pausedPerc = total > 0 ? Math.round((paused / total) * 100) : 0;

  return (
    <section className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-cyan-500/20 bg-zinc-900/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40 hover:bg-zinc-900/60 md:p-8">
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl transition-all duration-500 group-hover:bg-cyan-500/20" />

      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-cyan-400">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Master Plan Progress</h2>
              <p className="text-xs text-zinc-400">ALPAR AI Backlog Statistics</p>
            </div>
          </div>
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
            {total} Items
          </span>
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <span>Could not parse Master Plan: {error}</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Completed */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-bold">Completed ({completedPerc}%)</span>
                </div>
                <span className="text-xs font-medium text-emerald-300/80">{completed} items</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${completedPerc}%` }}
                />
              </div>
            </div>

            {/* Pending */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400">
                  <CircleDashed className="h-4 w-4" />
                  <span className="font-bold">Pending ({pendingPerc}%)</span>
                </div>
                <span className="text-xs font-medium text-amber-300/80">{pending} items</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${pendingPerc}%` }}
                />
              </div>
            </div>

            {/* Paused */}
            {paused > 0 && (
              <div className="rounded-2xl border border-zinc-500/20 bg-zinc-500/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <PauseCircle className="h-4 w-4" />
                    <span className="font-bold">Paused ({pausedPerc}%)</span>
                  </div>
                  <span className="text-xs font-medium text-zinc-400/80">{paused} items</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/40">
                  <div
                    className="h-full bg-zinc-500 transition-all duration-500"
                    style={{ width: `${pausedPerc}%` }}
                  />
                </div>
              </div>
            )}

            {/* Priority Breakdown */}
            <div className="flex flex-wrap gap-2 pt-2">
              {Object.entries(priorityCounts).map(([priority, count]) => {
                const isHigh =
                  priority.toLowerCase().includes("p0") || priority.toLowerCase().includes("p1");
                const colorClass = isHigh
                  ? "text-red-400 bg-red-500/10 border-red-500/20"
                  : "text-blue-400 bg-blue-500/10 border-blue-500/20";
                return (
                  <div
                    key={priority}
                    className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${colorClass}`}
                  >
                    {priority}: {count}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

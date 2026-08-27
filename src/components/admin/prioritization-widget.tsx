"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { PlanItem, MasterPlanParseError } from "@/lib/utils/markdown-parser";
import { getMasterPlanAction } from "@/actions/admin/master-plan";
import { Target, CheckCircle2, CircleDashed, PauseCircle, AlertTriangle } from "lucide-react";

export interface PrioritizationWidgetProps {
  items?: PlanItem[];
  error?: MasterPlanParseError | null;
}

export function PrioritizationWidget({
  items: initialItems,
  error: initialError = null,
}: PrioritizationWidgetProps = {}) {
  const t = useTranslations("admin");
  const [items, setItems] = useState<PlanItem[]>(initialItems ?? []);
  const [error, setError] = useState<MasterPlanParseError | null>(initialError);

  useEffect(() => {
    if (initialItems !== undefined) {
      setItems(initialItems);
      setError(initialError);
      return;
    }

    let isMounted = true;
    getMasterPlanAction()
      .then((res) => {
        if (isMounted) {
          setItems(res.items);
          setError(res.error);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("read");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initialItems, initialError]);

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
    <section className="group border-accent-500/20 bg-bg-elevated/40 hover:border-accent-500/40 hover:bg-bg-elevated/60 relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 backdrop-blur-xl transition-all duration-300 md:p-8">
      <div className="bg-accent-500/10 group-hover:bg-accent-500/20 absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl transition-all duration-500" />

      <div className="relative z-10 space-y-6">
        <div className="border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="border-accent-500/30 bg-accent-500/10 text-accent-400 rounded-2xl border p-3">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {t("prioritization_title")}
              </h2>
              <p className="text-fg-muted text-xs">{t("prioritization_subtitle")}</p>
            </div>
          </div>
          <span className="border-accent-500/30 bg-accent-500/10 text-accent-400 rounded-full border px-3 py-1 text-xs font-semibold">
            {total} {t("prioritization_items")}
          </span>
        </div>

        {error ? (
          <div className="border-danger-500/30 bg-danger-500/10 text-danger-400 flex items-center gap-2 rounded-2xl border p-4 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>{t("prioritization_parse_error", { error })}</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Completed */}
            <div className="border-success-500/20 bg-success-500/5 rounded-2xl border p-4">
              <div className="flex items-center justify-between">
                <div className="text-success-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-bold">
                    {t("prioritization_completed")} ({completedPerc}%)
                  </span>
                </div>
                <span className="text-success-300/80 text-xs font-medium">
                  {completed} {t("prioritization_items")}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/40">
                <div
                  className="bg-success-500 h-full transition-all duration-500"
                  style={{ width: `${completedPerc}%` }}
                />
              </div>
            </div>

            {/* Pending */}
            <div className="border-warning-500/20 bg-warning-500/5 rounded-2xl border p-4">
              <div className="flex items-center justify-between">
                <div className="text-warning-400 flex items-center gap-2">
                  <CircleDashed className="h-4 w-4" />
                  <span className="font-bold">
                    {t("prioritization_pending")} ({pendingPerc}%)
                  </span>
                </div>
                <span className="text-warning-300/80 text-xs font-medium">
                  {pending} {t("prioritization_items")}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/40">
                <div
                  className="bg-warning-500 h-full transition-all duration-500"
                  style={{ width: `${pendingPerc}%` }}
                />
              </div>
            </div>

            {/* Paused */}
            {paused > 0 && (
              <div className="rounded-2xl border border-zinc-500/20 bg-zinc-500/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-fg-muted flex items-center gap-2">
                    <PauseCircle className="h-4 w-4" />
                    <span className="font-bold">
                      {t("prioritization_paused")} ({pausedPerc}%)
                    </span>
                  </div>
                  <span className="text-fg-muted/80 text-xs font-medium">
                    {paused} {t("prioritization_items")}
                  </span>
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
                  ? "text-danger-400 bg-danger-500/10 border-danger-500/20"
                  : "text-brand-400 bg-brand-500/10 border-brand-500/20";
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

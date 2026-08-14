"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, PlayCircle, Lock, Filter, ArrowRight } from "lucide-react";
import type { PlanItem } from "@/lib/utils/markdown-parser";
import { buildDependencyGraph } from "@/lib/utils/masterplan-deps";

interface MasterPlanDepsTableProps {
  items: PlanItem[];
  onOpenItem: (item: PlanItem) => void;
  searchQuery?: string;
}

export function MasterPlanDepsTable({
  items,
  onOpenItem,
  searchQuery = "",
}: MasterPlanDepsTableProps) {
  const t = useTranslations("admin");
  const [filterMode, setFilterMode] = useState<"all" | "connected" | "blocked" | "startable">(
    "all",
  );

  const graph = useMemo(() => buildDependencyGraph(items), [items]);
  const itemMap = useMemo(() => {
    const map = new Map<string, PlanItem>();
    items.forEach((i) => map.set(i.id, i));
    return map;
  }, [items]);

  const filteredNodes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return graph.nodes.filter((node) => {
      // Search query matching
      if (q) {
        const matchesQuery =
          node.id.toLowerCase().includes(q) ||
          node.title.toLowerCase().includes(q) ||
          (node.owner ?? "").toLowerCase().includes(q) ||
          node.priority.toLowerCase().includes(q);

        if (!matchesQuery) return false;
      }

      // Filter mode matching
      if (filterMode === "connected") {
        return node.dependsOn.length > 0 || node.blocks.length > 0;
      }
      if (filterMode === "blocked") {
        return node.isBlocked;
      }
      if (filterMode === "startable") {
        return node.canStart;
      }

      return true;
    });
  }, [graph.nodes, searchQuery, filterMode]);

  return (
    <div className="space-y-4">
      {/* Sub-header Filter Buttons */}
      <div className="bg-bg-secondary border-border-subtle flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
        <div className="text-fg-muted flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
          <Filter className="text-brand-400 h-4 w-4" />
          <span>{t("deps_table_filter_label")}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterMode("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterMode === "all"
                ? "bg-brand-500/20 text-brand-400 border-brand-500/30 border"
                : "bg-bg-tertiary text-fg-muted border-border-subtle border hover:text-white"
            }`}
          >
            {t("deps_filter_all", { count: graph.stats.totalTasks })}
          </button>
          <button
            onClick={() => setFilterMode("connected")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterMode === "connected"
                ? "bg-brand-500/20 text-brand-400 border-brand-500/30 border"
                : "bg-bg-tertiary text-fg-muted border-border-subtle border hover:text-white"
            }`}
          >
            {t("deps_filter_connected", {
              count: graph.nodes.filter((n) => n.dependsOn.length > 0 || n.blocks.length > 0)
                .length,
            })}
          </button>
          <button
            onClick={() => setFilterMode("startable")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterMode === "startable"
                ? "border-success-500/30 bg-success-500/20 text-success-400 border"
                : "bg-bg-tertiary text-fg-muted border-border-subtle border hover:text-white"
            }`}
          >
            <PlayCircle className="text-success-400 h-3.5 w-3.5" />
            {t("deps_filter_startable", { count: graph.stats.startableCount })}
          </button>
          <button
            onClick={() => setFilterMode("blocked")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterMode === "blocked"
                ? "border-warning-500/30 bg-warning-500/20 text-warning-400 border"
                : "bg-bg-tertiary text-fg-muted border-border-subtle border hover:text-white"
            }`}
          >
            <Lock className="text-warning-400 h-3.5 w-3.5" />
            {t("deps_filter_blocked", { count: graph.stats.blockedCount })}
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-bg-secondary border-border-subtle overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-tertiary/60 border-border-subtle text-fg-muted border-b font-bold tracking-wider uppercase">
              <tr>
                <th scope="col" className="w-20 px-4 py-3.5">
                  {t("deps_th_id")}
                </th>
                <th scope="col" className="min-w-[240px] px-4 py-3.5">
                  {t("deps_th_title")}
                </th>
                <th scope="col" className="w-28 px-4 py-3.5">
                  {t("deps_th_status")}
                </th>
                <th scope="col" className="min-w-[200px] px-4 py-3.5">
                  {t("deps_th_depends_on")}
                </th>
                <th scope="col" className="min-w-[200px] px-4 py-3.5">
                  {t("deps_th_blocks")}
                </th>
                <th scope="col" className="w-36 px-4 py-3.5 text-right">
                  {t("deps_th_readiness")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-border-subtle/50 divide-y">
              <AnimatePresence initial={false}>
                {filteredNodes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-fg-muted py-12 text-center">
                      {t("deps_table_empty")}
                    </td>
                  </tr>
                ) : (
                  filteredNodes.map((node) => {
                    const planItem = itemMap.get(node.id);

                    return (
                      <motion.tr
                        key={node.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => planItem && onOpenItem(planItem)}
                        className="hover:bg-bg-tertiary/40 group cursor-pointer transition-colors"
                      >
                        {/* Task ID */}
                        <td className="px-4 py-3 font-mono font-bold whitespace-nowrap text-white">
                          <span className="bg-bg-tertiary border-border-subtle text-fg-primary group-hover:border-brand-500/40 rounded border px-2 py-1">
                            #{node.id}
                          </span>
                        </td>

                        {/* Title & Owner */}
                        <td className="px-4 py-3">
                          <div className="group-hover:text-brand-300 font-semibold text-white transition-colors">
                            {node.title}
                          </div>
                          <div className="text-fg-muted mt-0.5 flex items-center gap-2 text-[10px]">
                            <span className="text-warning-400 font-bold">{node.priority}</span>
                            {node.owner && (
                              <span>• {t("deps_owner_label", { owner: node.owner })}</span>
                            )}
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {node.status === "completed" && (
                            <span className="border-success-500/30 bg-success-500/10 text-success-400 inline-flex items-center gap-1 rounded border px-2 py-0.5 font-semibold">
                              <CheckCircle2 className="h-3 w-3" /> {t("plan_status_completed")}
                            </span>
                          )}
                          {node.status === "pending" && (
                            <span className="border-warning-500/30 bg-warning-500/10 text-warning-400 inline-flex items-center gap-1 rounded border px-2 py-0.5 font-semibold">
                              <Clock className="h-3 w-3" /> {t("plan_status_pending")}
                            </span>
                          )}
                          {node.status === "paused" && (
                            <span className="border-brand-500/30 bg-brand-500/10 text-brand-400 inline-flex items-center gap-1 rounded border px-2 py-0.5 font-semibold">
                              <Clock className="h-3 w-3" /> {t("plan_status_paused")}
                            </span>
                          )}
                        </td>

                        {/* Depends On (Prerequisites) */}
                        <td className="px-4 py-3">
                          {node.dependsOn.length === 0 ? (
                            <span className="text-fg-muted/60 italic">{t("deps_none")}</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {node.dependsOn.map((depId) => {
                                const depItem = itemMap.get(depId);
                                const isSatisfied = depItem?.status === "completed";

                                return (
                                  <span
                                    key={depId}
                                    title={depItem ? `#${depId}: ${depItem.title}` : `#${depId}`}
                                    className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[11px] font-medium ${
                                      isSatisfied
                                        ? "border-success-500/20 bg-success-500/10 text-success-400 border"
                                        : "border-warning-500/20 bg-warning-500/10 text-warning-400 border"
                                    }`}
                                  >
                                    {isSatisfied ? (
                                      <CheckCircle2 className="text-success-400 h-3 w-3" />
                                    ) : (
                                      <Lock className="text-warning-400 h-3 w-3" />
                                    )}
                                    #{depId}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </td>

                        {/* Blocks */}
                        <td className="px-4 py-3">
                          {node.blocks.length === 0 ? (
                            <span className="text-fg-muted/60 italic">{t("deps_blocks_none")}</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {node.blocks.map((blockedId) => {
                                const blockedItem = itemMap.get(blockedId);
                                const isDone = blockedItem?.status === "completed";

                                return (
                                  <span
                                    key={blockedId}
                                    title={
                                      blockedItem
                                        ? `#${blockedId}: ${blockedItem.title}`
                                        : `#${blockedId}`
                                    }
                                    className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[11px] font-medium ${
                                      isDone
                                        ? "bg-bg-tertiary text-fg-muted border-border-subtle border"
                                        : "border-brand-500/20 bg-brand-500/10 text-brand-400 border"
                                    }`}
                                  >
                                    <ArrowRight className="h-3 w-3" />#{blockedId}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </td>

                        {/* Action Readiness Status */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {node.status === "completed" ? (
                            <span className="text-success-400 text-[11px] font-semibold">
                              {t("deps_status_closed")}
                            </span>
                          ) : node.canStart ? (
                            <span className="border-success-500/40 bg-success-500/15 text-success-400 inline-flex items-center gap-1 rounded border px-2 py-1 font-bold">
                              <PlayCircle className="h-3.5 w-3.5" />{" "}
                              {t("deps_status_startable_short")}
                            </span>
                          ) : node.isBlocked ? (
                            <span
                              className="border-warning-500/40 bg-warning-500/15 text-warning-400 inline-flex items-center gap-1 rounded border px-2 py-1 font-bold"
                              title={`${t("deps_pending_label")}: ${node.pendingDependencies.map((d) => `#${d}`).join(", ")}`}
                            >
                              <Lock className="h-3.5 w-3.5" />{" "}
                              {t("deps_status_blocked_short", {
                                count: node.pendingDependencies.length,
                              })}
                            </span>
                          ) : (
                            <span className="text-fg-muted text-[11px]">
                              {t(
                                node.status === "paused"
                                  ? "plan_status_paused"
                                  : "plan_status_pending",
                              )}
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

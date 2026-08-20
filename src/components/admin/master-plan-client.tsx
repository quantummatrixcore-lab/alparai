"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  Inbox,
  LayoutGrid,
  List,
  Search,
  X,
  PlayCircle,
  Network,
  Table as TableIcon,
} from "lucide-react";
import type { MasterPlanParseError, PlanItem } from "@/lib/utils/markdown-parser";
import { MasterPlanDepsTable } from "@/components/admin/master-plan-deps-table";
import { MasterPlanDepsGraph } from "@/components/admin/master-plan-deps-graph";
import { AdminSubNav, type SubNavItem } from "@/components/admin/admin-design-kit";

interface MasterPlanClientProps {
  items: PlanItem[];
  error: MasterPlanParseError | null;
}

function priorityBadgeClasses(priority: string): string {
  if (priority.includes("P0"))
    return "border border-danger-500/20 bg-danger-500/10 text-danger-400";
  if (priority.includes("P1"))
    return "border border-warning-500/20 bg-warning-500/10 text-warning-400";
  return "border border-brand-500/20 bg-brand-500/10 text-brand-400";
}

function statusMeta(status: PlanItem["status"]) {
  if (status === "completed")
    return { classes: "text-success-400 border-success-500/30 bg-success-500/10" };
  if (status === "paused") return { classes: "text-brand-400 border-brand-500/30 bg-brand-500/10" };
  return { classes: "text-warning-400 border-warning-500/30 bg-warning-500/10" };
}

function PlanCard({
  item,
  compact,
  onOpen,
  pendingDependencies,
}: {
  item: PlanItem;
  compact?: boolean;
  onOpen: (item: PlanItem) => void;
  pendingDependencies?: string[];
}) {
  const t = useTranslations("admin");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      role="button"
      tabIndex={0}
      aria-label={`${t("plan_item_id", { id: item.id })} — ${item.title}`}
      onClick={() => onOpen(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(item);
        }
      }}
      className="bg-bg-secondary border-border-subtle hover:border-brand-500/30 group focus:ring-brand-500/50 flex cursor-pointer flex-col gap-3 rounded-xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:outline-none"
    >
      <div className="flex items-center justify-between">
        <span className="bg-bg-tertiary text-fg-secondary border-border-subtle rounded border px-2 py-0.5 text-[10px] font-black tracking-wider uppercase">
          {t("plan_item_id", { id: item.id })}
        </span>
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-black tracking-wider uppercase ${priorityBadgeClasses(item.priority)}`}
        >
          {item.priority}
        </span>
      </div>
      <p className={`${compact ? "text-sm" : "font-medium"} text-fg-primary`}>{item.title}</p>
      {!compact && item.description && (
        <p className="text-fg-muted line-clamp-2 text-xs leading-relaxed">{item.description}</p>
      )}
      {(() => {
        const depText =
          item.depends && item.depends.length > 0
            ? item.depends.map((d) => `#${d}`).join(", ")
            : item.dependsOn && item.dependsOn.length > 0
              ? item.dependsOn.map((d) => `#${d}`).join(", ")
              : pendingDependencies && pendingDependencies.length > 0
                ? pendingDependencies.map((d) => `#${d}`).join(", ")
                : null;
        if (!depText) return null;
        return (
          <div
            title={`Depends: ${depText}`}
            className="border-warning-500/20 bg-warning-500/10 text-warning-400 mt-1 flex w-fit items-center gap-1.5 rounded border px-2 py-1 text-[10px] font-bold tracking-wider uppercase"
          >
            <AlertTriangle className="text-warning-400 h-3 w-3 shrink-0" />
            <span>Depends: {depText}</span>
          </div>
        );
      })()}
      <div className="flex items-center justify-between">
        {item.owner ? (
          <span className="text-fg-muted text-[10px] font-semibold tracking-wider uppercase">
            [{item.owner}]
          </span>
        ) : (
          <span />
        )}
        <span className="text-brand-400/70 group-hover:text-brand-400 text-[10px] font-bold tracking-wider uppercase opacity-0 transition-opacity group-hover:opacity-100">
          {t("plan_view_details")} â†’
        </span>
      </div>
    </motion.div>
  );
}

export function SortablePlanCard({ item, compact, onOpen, pendingDependencies }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { item },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <PlanCard
        item={item}
        compact={compact}
        onOpen={onOpen}
        pendingDependencies={pendingDependencies}
      />
    </div>
  );
}

function EmptyColumn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="bg-bg-secondary/40 border-border-subtle/50 text-fg-muted flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
      {icon}
      <p className="mt-2 text-xs font-medium">{label}</p>
    </div>
  );
}

export function MasterPlanClient({ items, error }: MasterPlanClientProps) {
  const t = useTranslations("admin");
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "graph" | "table">("kanban");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PlanItem | null>(null);
  const [showStartableOnly, setShowStartableOnly] = useState(false);

  const navItems: SubNavItem[] = useMemo(
    () => [
      {
        id: "kanban",
        label: t("view_kanban"),
        icon: LayoutGrid,
      },
      {
        id: "list",
        label: t("view_list"),
        icon: List,
      },
      {
        id: "graph",
        label: t("view_graph"),
        icon: Network,
      },
      {
        id: "table",
        label: t("view_deps_table"),
        icon: TableIcon,
      },
    ],
    [t],
  );

  const [isPending, startTransition] = useTransition();
  const [activeItem, setActiveItem] = useState<PlanItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveItem(event.active.data.current?.item as PlanItem);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const item = items.find((i) => i.id === activeId);
    if (!item) return;

    let targetStatus: "pending" | "paused" | "completed" | null = null;
    if (["col-pending", "col-paused", "col-completed"].includes(overId)) {
      targetStatus = overId.replace("col-", "") as any;
    } else {
      const overItem = items.find((i) => i.id === overId);
      if (overItem) targetStatus = overItem.status;
    }

    if (targetStatus && targetStatus !== item.status) {
      startTransition(async () => {
        try {
          console.warn("Drag-and-drop status mutations are disabled by Truth Protocol.");
        } catch (e) {
          console.error("Failed to update status", e);
        }
      });
    }
  };

  const completedIds = useMemo(
    () => new Set(items.filter((i) => i.status === "completed").map((i) => i.id)),
    [items],
  );

  const effectiveDependsOn = useMemo(() => {
    const deps = new Map<string, Set<string>>();
    items.forEach((i) => {
      if (!deps.has(i.id)) deps.set(i.id, new Set());
      if (i.dependsOn) {
        i.dependsOn.forEach((d) => deps.get(i.id)!.add(d));
      }
      if (i.blocks) {
        i.blocks.forEach((b) => {
          if (!deps.has(b)) deps.set(b, new Set());
          deps.get(b)!.add(i.id);
        });
      }
    });
    return deps;
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    let res = items;
    if (q) {
      res = res.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q) ||
          i.priority.toLowerCase().includes(q) ||
          (i.owner ?? "").toLowerCase().includes(q),
      );
    }

    if (showStartableOnly) {
      res = res.filter((i) => {
        if (i.status !== "pending") return false;
        const myDeps = effectiveDependsOn.get(i.id);
        if (!myDeps || myDeps.size === 0) return true;
        for (const depId of myDeps) {
          if (!completedIds.has(depId)) return false;
        }
        return true;
      });
    }
    return res;
  }, [items, query, showStartableOnly, effectiveDependsOn, completedIds]);

  const { pendingItems, completedItems, pausedItems, progress, completedCount, activeTotal } =
    useMemo(() => {
      const pending = filteredItems.filter((i) => i.status === "pending");
      const completed = filteredItems.filter((i) => i.status === "completed");
      const paused = filteredItems.filter((i) => i.status === "paused");

      const cCount = completed.length;
      const aTotal = filteredItems.length - paused.length;
      const prog = aTotal > 0 ? (cCount / aTotal) * 100 : 0;

      return {
        pendingItems: pending,
        completedItems: completed,
        pausedItems: paused,
        completedCount: cCount,
        activeTotal: aTotal,
        progress: prog,
      };
    }, [filteredItems]);

  useEffect(() => {
    if (!selected) return;
    const previouslyFocusedElement = document.activeElement as HTMLElement;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
      } else if (e.key === "Tab") {
        const modal = document.getElementById("master-plan-modal");
        if (!modal) return;
        const focusableElements = modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || document.activeElement === modal) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      const modal = document.getElementById("master-plan-modal");
      if (modal) modal.focus();
    }, 10);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      clearTimeout(timer);
      if (previouslyFocusedElement) previouslyFocusedElement.focus();
    };
  }, [selected]);

  const hasError = error !== null;
  const isEmpty = !hasError && items.length === 0;
  const noFilterResults = query.trim() !== "" && filteredItems.length === 0;

  const statusKey: Record<PlanItem["status"], string> = {
    completed: "plan_status_completed",
    pending: "plan_status_pending",
    paused: "plan_status_paused",
  };

  return (
    <div className="space-y-8">
      {/* Parse error — visually distinct from an empty backlog */}
      {hasError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-danger-500/30 bg-danger-500/10 flex items-start gap-3 rounded-xl border p-4"
        >
          <AlertTriangle className="text-danger-400 mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-fg-primary text-sm font-bold">{t("plan_error_title")}</p>
            <p className="text-danger-200/80 mt-1 text-sm">
              {error === "markers" ? t("plan_error_markers_body") : t("plan_error_body")}
            </p>
          </div>
        </motion.div>
      )}

      {/* Genuine empty state — the file parsed fine but has no rows */}
      {isEmpty && (
        <div className="bg-bg-secondary/40 border-border-subtle/50 flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <Inbox className="text-fg-muted mb-3 h-10 w-10 opacity-40" />
          <p className="text-fg-primary text-sm font-bold">{t("plan_empty_title")}</p>
          <p className="text-fg-muted mt-1 max-w-md text-sm">{t("plan_empty_body")}</p>
        </div>
      )}

      {!hasError && !isEmpty && (
        <>
          {/* Dashboard Header Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="bg-bg-secondary border-border-subtle relative overflow-hidden rounded-xl border p-6">
              <div className="bg-brand-500/10 absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl"></div>
              <div className="text-fg-muted mb-1 text-sm font-medium tracking-wider uppercase">
                {t("progress_title")}
              </div>
              <div className="flex items-end gap-2">
                <span className="text-fg-primary text-4xl font-black">{Math.round(progress)}%</span>
                <span className="text-fg-muted mb-1 text-sm font-medium">
                  {t("progress_active", { completed: completedCount, total: activeTotal })}
                </span>
              </div>
              <div className="bg-bg-tertiary mt-5 h-3 w-full overflow-hidden rounded-full shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="from-brand-600 to-brand-400 h-full rounded-full bg-gradient-to-r shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                />
              </div>
            </div>
          </div>

          {/* View Toggle + Filter */}
          <div className="border-border-subtle flex flex-col gap-4 border-b pb-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-fg-primary text-xl font-bold">{t("execution_board")}</h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="bg-bg-tertiary border-border-subtle flex items-center gap-2 rounded-lg border px-3">
                <Search className="text-fg-muted h-4 w-4 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("plan_filter_placeholder")}
                  aria-label={t("plan_filter_placeholder")}
                  className="text-fg-muted placeholder:text-fg-muted/60 bg-transparent py-2 text-sm focus:ring-0 focus:outline-none"
                />
                {query !== "" && (
                  <button
                    onClick={() => setQuery("")}
                    aria-label={t("plan_filter_clear")}
                    className="text-fg-muted hover:text-fg-primary rounded p-0.5 transition-colors focus:ring-2 focus:outline-none"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowStartableOnly(!showStartableOnly)}
                aria-pressed={showStartableOnly}
                className={`focus:ring-brand-500/50 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all focus:ring-2 focus:outline-none ${showStartableOnly ? "bg-brand-500/10 border-brand-500/30 text-brand-400 shadow-sm" : "bg-bg-tertiary border-border-subtle text-fg-muted hover:text-fg-primary"}`}
              >
                <PlayCircle className="h-4 w-4" />
                {t("deps_status_startable")}
              </button>
              <AdminSubNav
                items={navItems}
                activeId={viewMode}
                onChange={(id) => setViewMode(id as "kanban" | "list" | "graph" | "table")}
              />
            </div>
          </div>

          {/* Filter produced no matches — distinct from an empty backlog */}
          {noFilterResults ? (
            <div className="bg-bg-secondary/40 border-border-subtle/50 flex flex-col items-center justify-center rounded-xl border border-dashed py-14 text-center">
              <Search className="text-fg-muted mb-3 h-8 w-8 opacity-40" />
              <p className="text-fg-primary text-sm font-bold">{t("plan_filter_no_results")}</p>
              <button
                onClick={() => setQuery("")}
                className="text-brand-400 mt-2 text-sm font-semibold hover:underline"
              >
                {t("plan_filter_clear")}
              </button>
            </div>
          ) : (
            <>
              {/* Kanban View */}
              {viewMode === "kanban" && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCorners}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Pending Column */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-fg-primary flex items-center gap-2 font-bold">
                          <Clock className="text-warning-400 h-5 w-5" />
                          {t("pending_column")}
                        </h3>
                        <span className="bg-bg-tertiary text-fg-muted rounded-full px-2.5 py-0.5 text-xs font-bold">
                          {pendingItems.length}
                        </span>
                      </div>
                      <SortableContext
                        id="col-pending"
                        items={pendingItems.map((i) => i.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="min-h-[150px] space-y-3">
                          {pendingItems.length === 0 ? (
                            <EmptyColumn
                              icon={<Clock className="h-6 w-6 opacity-40" />}
                              label={t("no_pending_items")}
                            />
                          ) : (
                            <AnimatePresence initial={false}>
                              {pendingItems.map((item) => (
                                <SortablePlanCard
                                  key={item.id}
                                  item={item}
                                  onOpen={setSelected}
                                  pendingDependencies={Array.from(
                                    effectiveDependsOn.get(item.id) || [],
                                  ).filter((d) => !completedIds.has(d))}
                                />
                              ))}
                            </AnimatePresence>
                          )}
                        </div>
                      </SortableContext>
                    </div>

                    {/* Paused Column */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-fg-primary flex items-center gap-2 font-bold">
                          <Clock className="text-brand-400 h-5 w-5" />
                          {t("paused_column")}
                        </h3>
                        <span className="bg-bg-tertiary text-fg-muted rounded-full px-2.5 py-0.5 text-xs font-bold">
                          {pausedItems.length}
                        </span>
                      </div>
                      <SortableContext
                        id="col-paused"
                        items={pausedItems.map((i) => i.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="min-h-[150px] space-y-3">
                          {pausedItems.length === 0 ? (
                            <EmptyColumn
                              icon={<Clock className="h-6 w-6 opacity-40" />}
                              label={t("no_paused_items")}
                            />
                          ) : (
                            <AnimatePresence initial={false}>
                              {pausedItems.map((item) => (
                                <SortablePlanCard
                                  key={item.id}
                                  item={item}
                                  onOpen={setSelected}
                                  pendingDependencies={Array.from(
                                    effectiveDependsOn.get(item.id) || [],
                                  ).filter((d) => !completedIds.has(d))}
                                />
                              ))}
                            </AnimatePresence>
                          )}
                        </div>
                      </SortableContext>
                    </div>

                    {/* Completed Column */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-fg-primary flex items-center gap-2 font-bold">
                          <CheckCircle2 className="text-success-400 h-5 w-5" />
                          {t("completed_column")}
                        </h3>
                        <span className="bg-bg-tertiary text-fg-muted rounded-full px-2.5 py-0.5 text-xs font-bold">
                          {completedItems.length}
                        </span>
                      </div>
                      <SortableContext
                        id="col-completed"
                        items={completedItems.map((i) => i.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="min-h-[150px] space-y-3 opacity-60 transition-opacity hover:opacity-100">
                          {completedItems.length === 0 ? (
                            <EmptyColumn
                              icon={<CheckCircle2 className="h-6 w-6 opacity-40" />}
                              label={t("no_completed_items")}
                            />
                          ) : (
                            <AnimatePresence initial={false}>
                              {completedItems.map((item) => (
                                <SortablePlanCard
                                  compact
                                  key={item.id}
                                  item={item}
                                  onOpen={setSelected}
                                  pendingDependencies={Array.from(
                                    effectiveDependsOn.get(item.id) || [],
                                  ).filter((d) => !completedIds.has(d))}
                                />
                              ))}
                            </AnimatePresence>
                          )}
                        </div>
                      </SortableContext>
                    </div>
                  </div>
                  <DragOverlay>
                    {activeItem ? <PlanCard item={activeItem} onOpen={setSelected} /> : null}
                  </DragOverlay>
                </DndContext>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {filteredItems.map((item) => {
                      const meta = statusMeta(item.status);
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          role="button"
                          tabIndex={0}
                          aria-label={`${t("plan_item_id", { id: item.id })} — ${item.title}`}
                          onClick={() => setSelected(item)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelected(item);
                            }
                          }}
                          className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all hover:-translate-y-0.5 ${
                            item.status === "completed"
                              ? "border-success-500/10 bg-success-500/5"
                              : "bg-bg-secondary border-border-subtle hover:border-brand-500/30"
                          }`}
                        >
                          <div className="mt-0.5">
                            {item.status === "completed" ? (
                              <CheckCircle2 className="text-success-500 h-5 w-5" />
                            ) : item.status === "paused" ? (
                              <Clock className="text-brand-400 h-5 w-5" />
                            ) : (
                              <Circle className="text-fg-muted h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <span className="bg-bg-tertiary text-fg-secondary border-border-subtle rounded border px-2 py-0.5 text-[10px] font-black tracking-wider uppercase">
                                {t("plan_item_id", { id: item.id })}
                              </span>
                              <span
                                className={`rounded px-2 py-0.5 text-[10px] font-black tracking-wider uppercase ${priorityBadgeClasses(item.priority)}`}
                              >
                                {item.priority}
                              </span>
                              <span
                                className={`rounded px-2 py-0.5 text-[10px] font-black tracking-wider uppercase ${meta.classes}`}
                              >
                                {t(statusKey[item.status])}
                              </span>
                              {((item.depends && item.depends.length > 0) ||
                                (item.dependsOn && item.dependsOn.length > 0)) && (
                                <span
                                  title={`Depends: ${(item.depends && item.depends.length > 0 ? item.depends.map((d) => `#${d}`) : item.dependsOn?.map((d) => `#${d}`))?.join(", ")}`}
                                  className="border-warning-500/20 bg-warning-500/10 text-warning-400 rounded border px-2 py-0.5 text-[10px] font-black tracking-wider uppercase"
                                >
                                  Depends:{" "}
                                  {(item.depends && item.depends.length > 0
                                    ? item.depends.map((d) => `#${d}`)
                                    : item.dependsOn?.map((d) => `#${d}`)
                                  )?.join(", ")}
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-sm ${item.status === "completed" ? "text-fg-secondary line-through" : "text-fg-primary font-medium"}`}
                            >
                              {item.title}
                            </p>
                            {item.description && (
                              <p className="text-fg-muted mt-1 text-xs">{item.description}</p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}

              {/* SVG Graph View */}
              {viewMode === "graph" && (
                <MasterPlanDepsGraph items={items} onOpenItem={setSelected} searchQuery={query} />
              )}

              {/* Dependency Table View */}
              {viewMode === "table" && (
                <MasterPlanDepsTable items={items} onOpenItem={setSelected} searchQuery={query} />
              )}
            </>
          )}
        </>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={`${t("plan_detail_title")} — ${selected.title}`}
          >
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            />
            <motion.div
              id="master-plan-modal"
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-bg-secondary border-border-subtle relative w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl focus:outline-none"
            >
              <div className="border-border-subtle flex items-start justify-between gap-4 border-b p-6">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="bg-bg-tertiary text-fg-secondary border-border-subtle rounded border px-2 py-0.5 text-[10px] font-black tracking-wider uppercase">
                      {t("plan_item_id", { id: selected.id })}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-black tracking-wider uppercase ${priorityBadgeClasses(selected.priority)}`}
                    >
                      {selected.priority}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-black tracking-wider uppercase ${statusMeta(selected.status).classes}`}
                    >
                      {t(statusKey[selected.status])}
                    </span>
                  </div>
                  <h3 className="text-fg-primary text-lg font-bold">{selected.title}</h3>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  aria-label={t("plan_modal_close")}
                  className="text-fg-muted hover:bg-bg-tertiary hover:text-fg-primary rounded-lg p-2 transition-colors focus:ring-2 focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
                <div>
                  <p className="text-fg-muted mb-2 text-xs font-bold tracking-wider uppercase">
                    {t("plan_detail_description")}
                  </p>
                  {selected.description ? (
                    <p className="text-fg-secondary text-sm leading-relaxed whitespace-pre-wrap">
                      {selected.description}
                    </p>
                  ) : (
                    <p className="text-fg-muted text-sm italic">
                      {t("plan_detail_no_description")}
                    </p>
                  )}
                </div>

                <div className="border-border-subtle grid grid-cols-1 gap-3 border-t pt-5 sm:grid-cols-2">
                  <div>
                    <p className="text-fg-muted mb-1 text-xs font-bold tracking-wider uppercase">
                      {t("plan_detail_priority")}
                    </p>
                    <p className="text-fg-primary text-sm font-semibold">{selected.priority}</p>
                  </div>
                  <div>
                    <p className="text-fg-muted mb-1 text-xs font-bold tracking-wider uppercase">
                      {t("plan_detail_status")}
                    </p>
                    <p className="text-fg-primary text-sm font-semibold">
                      {t(statusKey[selected.status])}
                    </p>
                  </div>
                  <div>
                    <p className="text-fg-muted mb-1 text-xs font-bold tracking-wider uppercase">
                      {t("plan_detail_owner")}
                    </p>
                    <p className="text-fg-primary text-sm font-semibold">
                      {selected.owner ?? t("plan_detail_no_owner")}
                    </p>
                  </div>
                  <div>
                    <p className="text-fg-muted mb-1 text-xs font-bold tracking-wider uppercase">
                      {t("plan_detail_commit")}
                    </p>
                    <p className="text-fg-primary font-mono text-sm">
                      {selected.commitHash ??
                        (selected.closedBy
                          ? `${selected.closedBy.sha}@${selected.closedBy.branch}`
                          : "—")}
                    </p>
                  </div>
                  <div>
                    <p className="text-fg-muted mb-1 text-xs font-bold tracking-wider uppercase">
                      {t("deps_th_depends_on")}
                    </p>
                    <p className="text-fg-primary text-sm font-semibold">
                      {Array.from(effectiveDependsOn.get(selected.id) || [])
                        .map((d) => `#${d}`)
                        .join(", ") || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

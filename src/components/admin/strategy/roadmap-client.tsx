"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Edit2, Trash2, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { upsertMilestoneAction, deleteMilestoneAction } from "@/actions/strategy";
import { toast } from "sonner";
import type { StrategyMilestone } from "@/types";

interface RoadmapClientProps {
  initialMilestones: StrategyMilestone[];
  isReadOnly: boolean;
  _locale: string;
}

export function RoadmapClient({ initialMilestones, isReadOnly, _locale }: RoadmapClientProps) {
  void _locale;
  const t = useTranslations("admin");

  const [milestones, setMilestones] = useState<StrategyMilestone[]>(initialMilestones);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<Partial<StrategyMilestone> | null>(null);

  // Group milestones by Quarter (e.g. "2026-Q3")
  const quarters = Array.from(new Set(milestones.map((m) => m.quarter))).sort();
  // Ensure current quarters are pre-populated if empty
  const activeQuarters = quarters.length > 0 ? quarters : ["2026-Q3", "2026-Q4", "2027-Q1"];

  const getQuarterMilestones = (q: string) => {
    return milestones.filter((m) => m.quarter === q);
  };

  const handleOpenAdd = (quarter: string) => {
    if (isReadOnly) return;
    setActiveMilestone({
      quarter,
      title: "",
      okr_text: "",
      progress: 0,
      status: "planned",
      linked_metric: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (milestone: StrategyMilestone) => {
    if (isReadOnly) return;
    setActiveMilestone(milestone);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (isReadOnly) return;
    if (!confirm(t("are_you_sure_you_want_to_delete_this_okr"))) {
      return;
    }

    try {
      const res = await deleteMilestoneAction(id);
      if (res.success) {
        setMilestones((prev) => prev.filter((m) => m.id !== id));
        toast.success(t("milestone_deleted"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("milestone_delete_failed"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !activeMilestone || !activeMilestone.quarter || !activeMilestone.title)
      return;

    setIsSaving(true);
    try {
      const res = await upsertMilestoneAction({
        id: activeMilestone.id,
        quarter: activeMilestone.quarter as string,
        title: activeMilestone.title as string,
        okr_text: activeMilestone.okr_text || null,
        progress: Number(activeMilestone.progress || 0),
        status:
          (activeMilestone.status as "planned" | "in_progress" | "done" | "missed") || "planned",
        linked_metric: activeMilestone.linked_metric || null,
      });

      if (res.success) {
        const newMilestone: StrategyMilestone = {
          id: res.id,
          quarter: activeMilestone.quarter as string,
          title: activeMilestone.title as string,
          okr_text: activeMilestone.okr_text || null,
          progress: Number(activeMilestone.progress || 0),
          status:
            (activeMilestone.status as "planned" | "in_progress" | "done" | "missed") || "planned",
          linked_metric: activeMilestone.linked_metric || null,
          owner_user_id: activeMilestone.owner_user_id || null,
          created_at: activeMilestone.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (activeMilestone.id) {
          setMilestones((prev) =>
            prev.map((m) => (m.id === activeMilestone.id ? newMilestone : m)),
          );
          toast.success(t("milestone_updated"));
        } else {
          setMilestones((prev) => [...prev, newMilestone]);
          toast.success(t("new_milestone_registered"));
        }
        setIsModalOpen(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("operation_failed"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ADD MILESTONE BUTTON */}
      {!isReadOnly && (
        <div className="flex justify-end">
          <button
            onClick={() => handleOpenAdd(activeQuarters[0]!)}
            className="bg-brand-600 hover:bg-brand-500 hover:shadow-brand-500/10 flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-lg transition"
          >
            <Plus className="h-4 w-4" />
            {t("add_okr_milestone")}
          </button>
        </div>
      )}

      {/* ROADMAP QUARTERS COLUMN GRID */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {activeQuarters.map((q) => {
          const qMilestones = getQuarterMilestones(q);

          return (
            <div
              key={q}
              className="border-border-subtle bg-bg-secondary/40 flex flex-col rounded-2xl border p-5 backdrop-blur-md"
            >
              <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-2">
                <span className="font-mono text-sm font-black text-white">{q}</span>
                {!isReadOnly && (
                  <button
                    onClick={() => handleOpenAdd(q)}
                    className="text-fg-muted rounded-lg p-1 transition hover:bg-white/10 hover:text-white"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-4">
                {qMilestones.length === 0 ? (
                  <p className="text-fg-muted py-8 text-center text-xs italic">
                    {t("no_targets_planned_for_this_quarter")}
                  </p>
                ) : (
                  qMilestones.map((m) => (
                    <div
                      key={m.id}
                      className="bg-bg-tertiary/20 group relative rounded-xl border border-white/5 p-4 transition hover:border-white/10"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm leading-snug font-bold text-white">{m.title}</h4>
                          {m.okr_text && (
                            <p className="text-fg-muted mt-1 text-xs leading-relaxed">
                              {m.okr_text}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3.5">
                        <div className="text-fg-muted mb-1 flex justify-between text-[9px] font-bold tracking-wider uppercase">
                          <span>{t("progress")}</span>
                          <span>{m.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              m.status === "done"
                                ? "bg-emerald-500"
                                : m.status === "in_progress"
                                  ? "bg-brand-500"
                                  : m.status === "missed"
                                    ? "bg-red-500"
                                    : "bg-white/20",
                            )}
                            style={{ width: `${m.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-fg-muted mt-3 flex items-center justify-between gap-2 border-t border-white/5 pt-2 text-[9px] font-bold tracking-wider uppercase">
                        {m.linked_metric ? (
                          <span className="rounded border border-white/10 bg-white/5 px-1 py-0.5 text-white/70">
                            {m.linked_metric}
                          </span>
                        ) : (
                          <span />
                        )}
                        <span
                          className={cn(
                            "rounded border px-1.5 py-0.5",
                            m.status === "done"
                              ? "border-emerald-500/15 bg-emerald-500/10 text-emerald-400"
                              : m.status === "in_progress"
                                ? "bg-brand-500/10 text-brand-400 border-brand-500/15"
                                : m.status === "missed"
                                  ? "border-red-500/15 bg-red-500/10 text-red-400"
                                  : "text-fg-muted border-white/10 bg-white/5",
                          )}
                        >
                          {m.status === "planned"
                            ? t("rm_status_planned")
                            : m.status === "in_progress"
                              ? t("rm_status_in_progress")
                              : m.status === "done"
                                ? t("rm_status_done")
                                : t("rm_status_missed")}
                        </span>
                      </div>

                      {/* Edit/Delete overlay */}
                      {!isReadOnly && (
                        <div className="bg-bg-secondary/90 absolute top-2 right-2 flex items-center gap-1 rounded-lg border border-white/5 px-1 py-0.5 opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="text-fg-muted rounded p-1 transition hover:bg-white/5 hover:text-white"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="rounded p-1 text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CRUD dialog Modal */}
      {isModalOpen && activeMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-bg-secondary border-border-strong w-full max-w-lg rounded-2xl border p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white uppercase">
                {activeMilestone.id ? t("edit_okr_milestone") : t("add_okr_milestone_1")}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-fg-muted rounded-lg p-1 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-fg-secondary mb-1 block text-xs font-bold tracking-wider uppercase">
                    {t("quarter")}
                  </label>
                  <input
                    type="text"
                    required
                    value={activeMilestone.quarter || ""}
                    onChange={(e) =>
                      setActiveMilestone({ ...activeMilestone, quarter: e.target.value })
                    }
                    placeholder={t("rm_quarter_placeholder")}
                    className="bg-bg-tertiary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border px-4 py-2.5 font-mono text-sm text-white focus:ring-1 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-fg-secondary mb-1 block text-xs font-bold tracking-wider uppercase">
                    {t("milestone_title")}
                  </label>
                  <input
                    type="text"
                    required
                    value={activeMilestone.title || ""}
                    onChange={(e) =>
                      setActiveMilestone({ ...activeMilestone, title: e.target.value })
                    }
                    placeholder={t("rm_title_placeholder")}
                    className="bg-bg-tertiary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border px-4 py-2.5 text-sm text-white focus:ring-1 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-fg-secondary mb-1 block text-xs font-bold tracking-wider uppercase">
                  {t("okr_targets")}
                </label>
                <textarea
                  value={activeMilestone.okr_text || ""}
                  onChange={(e) =>
                    setActiveMilestone({ ...activeMilestone, okr_text: e.target.value })
                  }
                  rows={2}
                  className="bg-bg-tertiary border-border-subtle focus:border-brand-500 w-full rounded-xl border px-4 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-fg-secondary mb-1 block text-xs font-bold tracking-wider uppercase">
                    {t("status")}
                  </label>
                  <select
                    value={activeMilestone.status}
                    onChange={(e) =>
                      setActiveMilestone({
                        ...activeMilestone,
                        status: e.target.value as "planned" | "in_progress" | "done" | "missed",
                      })
                    }
                    className="bg-bg-tertiary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border px-4 py-2.5 text-sm text-white focus:ring-1 focus:outline-none"
                  >
                    <option value="planned">{t("rm_status_planned")}</option>
                    <option value="in_progress">{t("rm_status_in_progress")}</option>
                    <option value="done">{t("rm_status_done")}</option>
                    <option value="missed">{t("rm_status_missed")}</option>
                  </select>
                </div>

                <div>
                  <label className="text-fg-secondary mb-1 block text-xs font-bold tracking-wider uppercase">
                    {t("linked_metric")}
                  </label>
                  <input
                    type="text"
                    value={activeMilestone.linked_metric || ""}
                    onChange={(e) =>
                      setActiveMilestone({ ...activeMilestone, linked_metric: e.target.value })
                    }
                    placeholder={t("rm_metric_placeholder")}
                    className="bg-bg-tertiary border-border-subtle focus:border-brand-500 w-full rounded-xl border px-4 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-fg-secondary mb-1.5 block flex justify-between text-xs font-bold tracking-wider uppercase">
                  <span>{t("okr_progress")}</span>
                  <span className="font-mono">{activeMilestone.progress || 0}%</span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    max={100}
                    min={0}
                    value={activeMilestone.progress || 0}
                    onChange={(e) =>
                      setActiveMilestone({ ...activeMilestone, progress: Number(e.target.value) })
                    }
                    className="accent-brand-500 flex-1"
                  />
                  <input
                    type="number"
                    max={100}
                    min={0}
                    value={activeMilestone.progress || 0}
                    onChange={(e) =>
                      setActiveMilestone({
                        ...activeMilestone,
                        progress: Math.min(100, Math.max(0, Number(e.target.value))),
                      })
                    }
                    className="bg-bg-tertiary border-border-subtle focus:border-brand-500 w-16 rounded-xl border px-3 py-1.5 text-right font-mono text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border-border-subtle rounded-xl border px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-brand-600 hover:bg-brand-500 hover:shadow-brand-500/10 flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("saving")}
                    </>
                  ) : (
                    t("swot_save")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

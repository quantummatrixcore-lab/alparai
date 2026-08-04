"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Edit2, Trash2, Calendar, Shield, X, HelpCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { upsertRiskAction, deleteRiskAction } from "@/actions/strategy";
import { toast } from "sonner";
import type { StrategyRisk } from "@/types";

interface RiskMatrixClientProps {
  initialRisks: StrategyRisk[];
  isReadOnly: boolean;
  locale: string;
}

export function RiskMatrixClient({
  initialRisks,
  isReadOnly,
  locale: _locale,
}: RiskMatrixClientProps) {
  const t = useTranslations("admin");

  const [risks, setRisks] = useState<StrategyRisk[]>(initialRisks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeRisk, setActiveRisk] = useState<Partial<StrategyRisk> | null>(null);

  // Selected cell filter in 5x5 grid
  const [selectedCell, setSelectedCell] = useState<{ p: number; i: number } | null>(null);

  // Group risks by Probability (1-5) and Impact (1-5)
  const getCellRisks = (p: number, i: number) => {
    return risks.filter((r) => r.probability === p && r.impact === i);
  };

  // Determine cell color based on score (p * i)
  const getCellColor = (p: number, i: number, count: number) => {
    const score = p * i;
    const isSelected = selectedCell && selectedCell.p === p && selectedCell.i === i;

    let baseColor =
      "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20";
    if (score >= 15) {
      baseColor = "bg-red-500/20 hover:bg-red-500/35 text-red-400 border-red-500/30";
    } else if (score >= 8) {
      baseColor = "bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/25";
    }

    return cn(
      "relative flex h-16 w-full cursor-pointer flex-col items-center justify-center rounded-xl border text-lg font-bold transition-all duration-300 select-none",
      baseColor,
      isSelected &&
        "ring-brand-500 ring-offset-bg-primary z-10 scale-[1.03] shadow-lg ring-2 ring-offset-2",
      count === 0 && "opacity-25 hover:opacity-40",
    );
  };

  const handleOpenAdd = () => {
    if (isReadOnly) return;
    setActiveRisk({
      code: `R0${risks.length + 1}`,
      title: "",
      description: "",
      probability: 3,
      impact: 3,
      mitigation_plan: "",
      target_date: "",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (risk: StrategyRisk) => {
    if (isReadOnly) return;
    setActiveRisk(risk);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (isReadOnly) return;
    if (!confirm(t("are_you_sure_you_want_to_delete_this_ris"))) {
      return;
    }

    try {
      const res = await deleteRiskAction(id);
      if (res.success) {
        setRisks((prev) => prev.filter((r) => r.id !== id));
        toast.success(t("risk_deleted_successfully"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("risk_delete_failed"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !activeRisk || !activeRisk.code || !activeRisk.title) return;

    setIsSaving(true);
    try {
      const res = await upsertRiskAction({
        id: activeRisk.id,
        code: activeRisk.code,
        title: activeRisk.title,
        description: activeRisk.description || null,
        probability: Number(activeRisk.probability || 3),
        impact: Number(activeRisk.impact || 3),
        mitigation_plan: activeRisk.mitigation_plan || null,
        target_date: activeRisk.target_date || null,
        status: activeRisk.status || "active",
      });

      if (res.success) {
        const newRisk: StrategyRisk = {
          id: res.id,
          code: activeRisk.code,
          title: activeRisk.title,
          description: activeRisk.description || null,
          probability: Number(activeRisk.probability || 3),
          impact: Number(activeRisk.impact || 3),
          mitigation_plan: activeRisk.mitigation_plan || null,
          target_date: activeRisk.target_date || null,
          status: activeRisk.status || "active",
          owner_user_id: activeRisk.owner_user_id || null,
          created_at: activeRisk.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (activeRisk.id) {
          setRisks((prev) => prev.map((r) => (r.id === activeRisk.id ? newRisk : r)));
          toast.success(t("risk_updated_successfully"));
        } else {
          setRisks((prev) => [...prev, newRisk]);
          toast.success(t("new_risk_registered"));
        }
        setIsModalOpen(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("operation_failed"));
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered risks list based on selected matrix cell
  const filteredRisks = selectedCell
    ? risks.filter((r) => r.probability === selectedCell.p && r.impact === selectedCell.i)
    : risks;

  // Grid headers/axis
  const probabilities = [5, 4, 3, 2, 1]; // Y-axis (Probability, high at top)
  const impacts = [1, 2, 3, 4, 5]; // X-axis (Impact, high at right)

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* 5x5 HEATMAP MATRIX (YÜKSEK ÇÖZÜNÜRLÜKLÜ RİSK ANALİZİ) */}
      <div className="lg:col-span-5">
        <div className="border-border-subtle bg-bg-secondary/40 rounded-2xl border p-5 backdrop-blur-md">
          <h3 className="mb-4 flex items-center justify-between text-xs font-bold tracking-wider text-white uppercase">
            <span>{t("5x5_risk_heatmap_matrix")}</span>
            {selectedCell && (
              <button
                onClick={() => setSelectedCell(null)}
                className="text-brand-400 hover:text-brand-300 text-[10px] font-bold tracking-wider uppercase transition"
              >
                {t("reset_filter")}
              </button>
            )}
          </h3>

          <div className="flex flex-col items-stretch">
            {/* Heatmap Grid */}
            <div className="flex gap-2">
              {/* Y-axis Label */}
              <div className="text-fg-muted flex w-8 shrink-0 flex-col justify-between py-8 text-right font-mono text-[9px] font-bold tracking-wider uppercase select-none">
                <span>P5</span>
                <span>P4</span>
                <span>P3</span>
                <span>P2</span>
                <span>P1</span>
              </div>

              <div className="flex-1 space-y-2">
                {probabilities.map((p) => (
                  <div key={p} className="grid grid-cols-5 gap-2">
                    {impacts.map((i) => {
                      const cellRisks = getCellRisks(p, i);
                      const count = cellRisks.length;
                      return (
                        <div
                          key={i}
                          onClick={() =>
                            setSelectedCell(
                              selectedCell && selectedCell.p === p && selectedCell.i === i
                                ? null
                                : { p, i },
                            )
                          }
                          className={getCellColor(p, i, count)}
                        >
                          <span>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* X-axis Label */}
            <div className="mt-2 flex gap-2">
              <div className="w-8 shrink-0" />
              <div className="text-fg-muted grid flex-1 grid-cols-5 gap-2 text-center font-mono text-[9px] font-bold tracking-wider uppercase select-none">
                <span>I1</span>
                <span>I2</span>
                <span>I3</span>
                <span>I4</span>
                <span>I5</span>
              </div>
            </div>
          </div>

          <div className="text-fg-muted mt-5 flex justify-between gap-4 border-t border-white/5 pt-4 text-[10px] font-bold tracking-wider uppercase">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded border border-emerald-500/40 bg-emerald-500/25" />
              <span>{t("low_1_6")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded border border-amber-500/40 bg-amber-500/25" />
              <span>{t("medium_8_12")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded border border-red-500/40 bg-red-500/25" />
              <span>{t("high_15_25")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RİSK LİSTESİ TABLOSU */}
      <div className="flex flex-col lg:col-span-7">
        <div className="border-border-subtle bg-bg-secondary/40 flex flex-1 flex-col justify-between rounded-2xl border p-5 backdrop-blur-md">
          <div>
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold tracking-wider text-white uppercase">
                {t("risk_matrix_logs")}
                {selectedCell && (
                  <span className="text-brand-400 ml-2 font-mono lowercase">
                    {t("risk_filtered")} P{selectedCell.p} {t("i")}
                    {selectedCell.i})
                  </span>
                )}
              </h3>
              {!isReadOnly && (
                <button
                  onClick={handleOpenAdd}
                  className="bg-brand-600 hover:bg-brand-500 hover:shadow-brand-500/10 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow-lg transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("register_risk")}
                </button>
              )}
            </div>

            <div className="max-h-[460px] scrollbar-thin space-y-4 overflow-y-auto pr-1">
              {filteredRisks.length === 0 ? (
                <p className="text-fg-muted py-8 text-center text-xs italic">
                  {t("no_risks_found_in_this_category")}
                </p>
              ) : (
                filteredRisks.map((risk) => {
                  const score = risk.probability * risk.impact;
                  const isHigh = score >= 15;
                  const isMedium = score >= 8 && score < 15;

                  return (
                    <div
                      key={risk.id}
                      className="bg-bg-tertiary/20 group relative rounded-xl border border-white/5 p-4 transition hover:border-white/10"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-brand-400 font-mono text-xs font-black tracking-wider">
                              {risk.code}
                            </span>
                            <h4 className="truncate text-sm leading-snug font-bold text-white">
                              {risk.title}
                            </h4>
                          </div>
                          {risk.description && (
                            <p className="text-fg-muted mt-1.5 text-xs leading-relaxed">
                              {risk.description}
                            </p>
                          )}
                        </div>

                        {/* Risk level score ring */}
                        <div className="flex shrink-0 items-center gap-2">
                          <div
                            className={cn(
                              "flex h-10 w-10 flex-col items-center justify-center rounded-xl border text-sm font-black",
                              isHigh
                                ? "border-red-500/20 bg-red-500/10 text-red-400"
                                : isMedium
                                  ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                                  : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
                            )}
                          >
                            <span>{score}</span>
                            <span className="mt-0.5 text-[7px] font-bold tracking-wider uppercase">
                              {t("risk_score_label")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {risk.mitigation_plan && (
                        <div className="mt-3 border-t border-white/5 pt-2.5">
                          <span className="text-fg-muted block flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase">
                            <Shield className="h-3 w-3 text-emerald-400" />
                            {t("mitigation_plan")}
                          </span>
                          <p className="text-fg-muted/80 mt-1 text-xs leading-relaxed italic">
                            {risk.mitigation_plan}
                          </p>
                        </div>
                      )}

                      <div className="text-fg-muted mt-3 flex flex-wrap items-center gap-4 border-t border-white/5 pt-2 text-[10px] font-bold tracking-wider uppercase">
                        {risk.target_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{risk.target_date}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <HelpCircle className="h-3 w-3" />
                          <span>
                            P:{risk.probability} {t("i")}
                            {risk.impact}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "rounded border px-1.5 py-0.5 text-[8px]",
                            risk.status === "active"
                              ? "border-amber-500/15 bg-amber-500/5 text-amber-400"
                              : risk.status === "mitigated"
                                ? "border-emerald-500/15 bg-emerald-500/5 text-emerald-400"
                                : risk.status === "triggered"
                                  ? "border-red-500/15 bg-red-500/5 text-red-400"
                                  : "text-fg-muted border-white/10 bg-white/5",
                          )}
                        >
                          {risk.status === "active"
                            ? t("risk_active")
                            : risk.status === "mitigated"
                              ? t("risk_mitigated")
                              : risk.status === "triggered"
                                ? t("risk_triggered")
                                : t("risk_closed")}
                        </span>
                      </div>

                      {/* Edit/Delete overlay */}
                      {!isReadOnly && (
                        <div className="bg-bg-secondary/90 absolute top-3 right-16 flex items-center gap-1 rounded-lg border border-white/5 px-1 py-0.5 opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => handleOpenEdit(risk)}
                            className="text-fg-muted rounded p-1 transition hover:bg-white/5 hover:text-white"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(risk.id)}
                            className="rounded p-1 text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CRUD dialog Modal */}
      {isModalOpen && activeRisk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-bg-secondary border-border-strong w-full max-w-lg rounded-2xl border p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white uppercase">
                {activeRisk.id ? t("edit_risk_log") : t("register_strategic_risk")}
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
                    {t("risk_code_label")}
                  </label>
                  <input
                    type="text"
                    required
                    value={activeRisk.code || ""}
                    onChange={(e) => setActiveRisk({ ...activeRisk, code: e.target.value })}
                    placeholder={t("risk_code_placeholder")}
                    className="bg-bg-tertiary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border px-4 py-2.5 text-sm text-white focus:ring-1 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-fg-secondary mb-1 block text-xs font-bold tracking-wider uppercase">
                    {t("risk_title")}
                  </label>
                  <input
                    type="text"
                    required
                    value={activeRisk.title || ""}
                    onChange={(e) => setActiveRisk({ ...activeRisk, title: e.target.value })}
                    placeholder={t("risk_title_placeholder")}
                    className="bg-bg-tertiary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border px-4 py-2.5 text-sm text-white focus:ring-1 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-fg-secondary mb-1 block text-xs font-bold tracking-wider uppercase">
                  {t("description_1")}
                </label>
                <textarea
                  value={activeRisk.description || ""}
                  onChange={(e) => setActiveRisk({ ...activeRisk, description: e.target.value })}
                  rows={2}
                  className="bg-bg-tertiary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border px-4 py-2 text-sm text-white focus:ring-1 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-fg-secondary mb-1 block text-xs font-bold tracking-wider uppercase">
                    {t("probability_1_5")}
                  </label>
                  <select
                    value={activeRisk.probability}
                    onChange={(e) =>
                      setActiveRisk({ ...activeRisk, probability: Number(e.target.value) })
                    }
                    className="bg-bg-tertiary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border px-4 py-2.5 text-sm text-white focus:ring-1 focus:outline-none"
                  >
                    <option value="1">1 - {t("risk_prob_very_low")}</option>
                    <option value="2">2 - {t("risk_prob_low")}</option>
                    <option value="3">3 - {t("risk_prob_medium")}</option>
                    <option value="4">4 - {t("risk_prob_high")}</option>
                    <option value="5">5 - {t("risk_prob_very_high")}</option>
                  </select>
                </div>

                <div>
                  <label className="text-fg-secondary mb-1 block text-xs font-bold tracking-wider uppercase">
                    {t("impact_1_5")}
                  </label>
                  <select
                    value={activeRisk.impact}
                    onChange={(e) =>
                      setActiveRisk({ ...activeRisk, impact: Number(e.target.value) })
                    }
                    className="bg-bg-tertiary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border px-4 py-2.5 text-sm text-white focus:ring-1 focus:outline-none"
                  >
                    <option value="1">1 - {t("risk_impact_negligible")}</option>
                    <option value="2">2 - {t("risk_impact_minor")}</option>
                    <option value="3">3 - {t("risk_impact_moderate")}</option>
                    <option value="4">4 - {t("risk_impact_major")}</option>
                    <option value="5">5 - {t("risk_impact_catastrophic")}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-fg-secondary mb-1 block text-xs font-bold tracking-wider uppercase">
                  {t("mitigation_plan_1")}
                </label>
                <textarea
                  value={activeRisk.mitigation_plan || ""}
                  onChange={(e) =>
                    setActiveRisk({ ...activeRisk, mitigation_plan: e.target.value })
                  }
                  rows={2}
                  className="bg-bg-tertiary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border px-4 py-2 text-sm text-white focus:ring-1 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-fg-secondary mb-1 block text-xs font-bold tracking-wider uppercase">
                    {t("status_1")}
                  </label>
                  <select
                    value={activeRisk.status}
                    onChange={(e) =>
                      setActiveRisk({
                        ...activeRisk,
                        status: e.target.value as "active" | "mitigated" | "triggered" | "closed",
                      })
                    }
                    className="bg-bg-tertiary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border px-4 py-2.5 text-sm text-white focus:ring-1 focus:outline-none"
                  >
                    <option value="active">{t("risk_active")}</option>
                    <option value="mitigated">{t("risk_mitigated")}</option>
                    <option value="triggered">{t("risk_triggered")}</option>
                    <option value="closed">{t("risk_closed")}</option>
                  </select>
                </div>

                <div>
                  <label className="text-fg-secondary mb-1 block text-xs font-bold tracking-wider uppercase">
                    {t("target_date")}
                  </label>
                  <input
                    type="date"
                    value={activeRisk.target_date || ""}
                    onChange={(e) => setActiveRisk({ ...activeRisk, target_date: e.target.value })}
                    className="bg-bg-tertiary border-border-subtle w-full rounded-xl border px-4 py-2 text-sm text-white focus:outline-none"
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

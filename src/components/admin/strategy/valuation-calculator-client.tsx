"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, BarChart2, Calendar, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveValuationAction } from "@/actions/strategy";
import { toast } from "sonner";
import type { StrategyValuation } from "@/types";
import type { Json } from "@/types/database";

interface ValuationCalculatorClientProps {
  initialValuations: StrategyValuation[];
  strategyCounts?: {
    swot: number;
    risks: number;
    milestones: number;
  };
  revenueMetrics?: {
    mrr: number;
    arr: number;
    activeSubs: number;
  };
  isReadOnly: boolean;
  locale: string;
}

export function ValuationCalculatorClient({
  initialValuations,
  strategyCounts = { swot: 0, risks: 0, milestones: 0 },
  revenueMetrics = { mrr: 0, arr: 0, activeSubs: 0 },
  isReadOnly,
  locale,
}: ValuationCalculatorClientProps) {
  const t = useTranslations("admin");
  const [valuations, setValuations] = useState<StrategyValuation[]>(initialValuations);
  const [activeTab, setActiveTab] = useState<
    "berkus" | "scorecard" | "vc" | "revenue" | "average" | "history"
  >("berkus");
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState("");

  // 1. Berkus Method State
  const [berkusInputs, setBerkusInputs] = useState({
    idea: 500000,
    prototype: 450000,
    team: 400000,
    relations: 200000,
    rollout: 300000,
  });

  const berkusValuation = Object.values(berkusInputs).reduce((acc, curr) => acc + curr, 0);

  // 2. Scorecard Method State
  const [scorecardBaseline, setScorecardBaseline] = useState(2500000);
  const [scorecardInputs, setScorecardInputs] = useState({
    team: 80, // 25% weight
    opportunity: 130, // 25% weight
    technology: 120, // 15% weight
    competition: 130, // 10% weight
    marketing: 70, // 10% weight
    capital: 100, // 5% weight
    other: 100, // 10% weight
  });

  const scorecardMultiplier =
    (0.25 * scorecardInputs.team +
      0.25 * scorecardInputs.opportunity +
      0.15 * scorecardInputs.technology +
      0.1 * scorecardInputs.competition +
      0.1 * scorecardInputs.marketing +
      0.05 * scorecardInputs.capital +
      0.1 * scorecardInputs.other) /
    100;

  const scorecardValuation = Math.round(scorecardBaseline * scorecardMultiplier);

  // 3. VC Method State
  const [vcExitValue, setVcExitValue] = useState(40000000);
  const [vcTargetRoi, setVcTargetRoi] = useState(25);
  const [vcInvestment, setVcInvestment] = useState(250000);

  const vcPostMoney = Math.round(vcExitValue / vcTargetRoi);
  const vcValuation = vcPostMoney - vcInvestment;

  // 4. Revenue Multiplier State
  const [revenueMultiplier, setRevenueMultiplier] = useState(10);
  const hasRevenue = revenueMetrics.arr > 0;
  const revenueValuation = hasRevenue ? Math.round(revenueMetrics.arr * revenueMultiplier) : 0;

  // 5. Consolidated Weighted Average
  const averageValuation = hasRevenue
    ? Math.round(
        berkusValuation * 0.3 +
          scorecardValuation * 0.3 +
          vcValuation * 0.2 +
          revenueValuation * 0.2,
      )
    : Math.round(berkusValuation * 0.4 + scorecardValuation * 0.4 + vcValuation * 0.2);

  const lowValuation = Math.round(berkusValuation);
  const baseValuation = averageValuation;
  const highValuation = Math.max(vcValuation, revenueValuation);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSaveSnapshot = async (
    method: "berkus" | "scorecard" | "vc" | "revenue" | "average",
  ) => {
    if (isReadOnly) return;
    setIsSaving(true);

    let val = 0;
    let inputsObj: Json = {};

    if (method === "berkus") {
      val = berkusValuation;
      inputsObj = berkusInputs;
    } else if (method === "scorecard") {
      val = scorecardValuation;
      inputsObj = { ...scorecardInputs, baseline: scorecardBaseline };
    } else if (method === "vc") {
      val = vcValuation;
      inputsObj = { exitValue: vcExitValue, targetRoi: vcTargetRoi, investment: vcInvestment };
    } else if (method === "revenue") {
      val = revenueValuation;
      inputsObj = { arr: revenueMetrics.arr, multiplier: revenueMultiplier };
    } else {
      val = averageValuation;
      inputsObj = {
        berkus: berkusValuation,
        scorecard: scorecardValuation,
        vc: vcValuation,
        revenue: revenueValuation,
      };
    }

    try {
      const res = await saveValuationAction({
        method,
        inputs: inputsObj,
        result_pre_money: val,
        notes: notes || null,
      });

      if (res.success) {
        toast.success(t("val_snapshot_saved"));
        // Add to local state list
        const logged: StrategyValuation = {
          id: res.id,
          method,
          inputs: inputsObj,
          result_pre_money: val,
          notes: notes || null,
          snapshot_date: new Date().toISOString().split("T")[0]!,
          created_by: null,
          created_at: new Date().toISOString(),
        };
        setValuations((prev) => [logged, ...prev]);
        setNotes("");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("val_snapshot_failed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoSuggestFromStrategy = () => {
    const { swot, risks, milestones } = strategyCounts;

    // Calculate Berkus adjustments based on real strategy counts
    const prototypeBonus = milestones > 0 ? Math.min(500000, 300000 + milestones * 35000) : 300000;
    const teamBonus = swot > 0 ? Math.min(500000, 350000 + swot * 20000) : 350000;
    const rolloutBonus =
      risks > 0 ? Math.min(500000, 250000 + Math.max(0, 10 - risks) * 25000) : 250000;

    setBerkusInputs((prev) => ({
      ...prev,
      prototype: prototypeBonus,
      team: teamBonus,
      rollout: rolloutBonus,
    }));

    // Calculate Scorecard adjustments
    setScorecardInputs((prev) => ({
      ...prev,
      technology: Math.min(150, 100 + milestones * 5),
      competition: Math.min(150, 90 + swot * 3),
      marketing: Math.min(150, 80 + Math.max(0, 10 - risks) * 4),
    }));

    toast.success(
      `Valuation parameters auto-suggested from Strategy metrics (${swot} SWOT, ${risks} Risks, ${milestones} Milestones).`,
    );
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* CALCULATOR COLUMN */}
      <div className="space-y-6 lg:col-span-8">
        {/* Method Select Tabs + Auto-Suggest Action */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="bg-bg-secondary/40 border-border-subtle flex scrollbar-none gap-2 overflow-x-auto rounded-2xl border p-1.5 backdrop-blur-md">
            <button
              onClick={() => setActiveTab("berkus")}
              className={cn(
                "flex-1 rounded-xl px-4 py-2 text-xs font-bold tracking-wider uppercase transition duration-300",
                activeTab === "berkus"
                  ? "bg-brand-500/15 text-brand-300 border-brand-500/20 border shadow-[inset_0_0_12px_rgba(168,85,247,0.1)]"
                  : "text-fg-muted hover:bg-white/5 hover:text-white",
              )}
            >
              {t("val_berkus_method")}
            </button>
            <button
              onClick={() => setActiveTab("scorecard")}
              className={cn(
                "flex-1 rounded-xl px-4 py-2 text-xs font-bold tracking-wider uppercase transition duration-300",
                activeTab === "scorecard"
                  ? "bg-brand-500/15 text-brand-300 border-brand-500/20 border shadow-[inset_0_0_12px_rgba(168,85,247,0.1)]"
                  : "text-fg-muted hover:bg-white/5 hover:text-white",
              )}
            >
              {t("val_scorecard_method")}
            </button>
            <button
              onClick={() => setActiveTab("vc")}
              className={cn(
                "flex-1 rounded-xl px-4 py-2 text-xs font-bold tracking-wider uppercase transition duration-300",
                activeTab === "vc"
                  ? "bg-brand-500/15 text-brand-300 border-brand-500/20 border shadow-[inset_0_0_12px_rgba(168,85,247,0.1)]"
                  : "text-fg-muted hover:bg-white/5 hover:text-white",
              )}
            >
              {t("val_vc_exit_method")}
            </button>
            <button
              onClick={() => setActiveTab("revenue")}
              className={cn(
                "flex-1 rounded-xl px-4 py-2 text-xs font-bold tracking-wider uppercase transition duration-300",
                activeTab === "revenue"
                  ? "bg-brand-500/15 text-brand-300 border-brand-500/20 border shadow-[inset_0_0_12px_rgba(168,85,247,0.1)]"
                  : "text-fg-muted hover:bg-white/5 hover:text-white",
              )}
            >
              {t("val_revenue_multiplier_method")}
            </button>
            <button
              onClick={() => setActiveTab("average")}
              className={cn(
                "flex-1 rounded-xl px-4 py-2 text-xs font-bold tracking-wider uppercase transition duration-300",
                activeTab === "average"
                  ? "bg-brand-500/15 text-brand-300 border-brand-500/20 border shadow-[inset_0_0_12px_rgba(168,85,247,0.1)]"
                  : "text-fg-muted hover:bg-white/5 hover:text-white",
              )}
            >
              {t("val_consolidated_title")}
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={cn(
                "flex-1 rounded-xl px-4 py-2 text-xs font-bold tracking-wider uppercase transition duration-300",
                activeTab === "history"
                  ? "bg-brand-500/15 text-brand-300 border-brand-500/20 border shadow-[inset_0_0_12px_rgba(168,85,247,0.1)]"
                  : "text-fg-muted hover:bg-white/5 hover:text-white",
              )}
            >
              {t("val_log_history")}
            </button>
          </div>

          <button
            onClick={handleAutoSuggestFromStrategy}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300 transition hover:bg-amber-500/20"
            title={t("auto_fill_valuation_multipliers_based_on")}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            {t("auto_suggest_from_strategy_data")}
          </button>
        </div>

        {/* TAB 1: BERKUS METHOD FORM */}
        {activeTab === "berkus" && (
          <div className="border-border-subtle bg-bg-secondary/40 space-y-4 rounded-2xl border p-6 backdrop-blur-md">
            <h3 className="border-b border-white/5 pb-2 text-sm font-bold tracking-wider text-white uppercase">
              {t("val_berkus_title")}
            </h3>
            <p className="text-fg-muted text-xs leading-relaxed">{t("val_berkus_desc")}</p>

            <div className="space-y-4 pt-2">
              {Object.keys(berkusInputs).map((key) => {
                const label =
                  key === "idea"
                    ? t("val_berkus_idea")
                    : key === "prototype"
                      ? t("val_berkus_prototype")
                      : key === "team"
                        ? t("val_berkus_team")
                        : key === "relations"
                          ? t("val_berkus_relations")
                          : t("val_berkus_rollout");

                return (
                  <div
                    key={key}
                    className="flex flex-col justify-between gap-2 border-b border-white/5 pb-3 sm:flex-row sm:items-center"
                  >
                    <span className="text-xs font-semibold text-white/90">{label}</span>
                    <input
                      type="number"
                      max={500000}
                      min={0}
                      value={berkusInputs[key as keyof typeof berkusInputs]}
                      onChange={(e) =>
                        setBerkusInputs({
                          ...berkusInputs,
                          [key]: Math.min(500000, Math.max(0, Number(e.target.value))),
                        })
                      }
                      className="bg-bg-tertiary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border px-3 py-1.5 text-right font-mono text-sm text-white focus:ring-1 focus:outline-none sm:w-36"
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
              <span className="text-sm font-extrabold text-white">
                {t("val_berkus_calc_result")}
              </span>
              <span className="font-mono text-2xl font-black text-emerald-400">
                {formatCurrency(berkusValuation)}
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: SCORECARD METHOD FORM */}
        {activeTab === "scorecard" && (
          <div className="border-border-subtle bg-bg-secondary/40 space-y-4 rounded-2xl border p-6 backdrop-blur-md">
            <h3 className="border-b border-white/5 pb-2 text-sm font-bold tracking-wider text-white uppercase">
              {t("val_scorecard_title")}
            </h3>
            <p className="text-fg-muted text-xs leading-relaxed">{t("val_scorecard_desc")}</p>

            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
              <div>
                <label className="text-fg-secondary mb-1 block text-xs font-bold tracking-wider uppercase">
                  {t("val_scorecard_baseline_label")}
                </label>
                <input
                  type="number"
                  value={scorecardBaseline}
                  onChange={(e) => setScorecardBaseline(Math.max(0, Number(e.target.value)))}
                  className="bg-bg-tertiary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border px-4 py-2 font-mono text-sm text-white focus:ring-1 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4 border-t border-white/5 pt-4">
              {Object.keys(scorecardInputs).map((key) => {
                const label =
                  key === "team"
                    ? t("val_scorecard_team")
                    : key === "opportunity"
                      ? t("val_scorecard_opportunity")
                      : key === "technology"
                        ? t("val_scorecard_technology")
                        : key === "competition"
                          ? t("val_scorecard_competition")
                          : key === "marketing"
                            ? t("val_scorecard_marketing")
                            : key === "capital"
                              ? t("val_scorecard_capital")
                              : t("val_scorecard_other");

                return (
                  <div
                    key={key}
                    className="flex flex-col justify-between gap-2 border-b border-white/5 pb-3 sm:flex-row sm:items-center"
                  >
                    <span className="text-xs font-semibold text-white/90">{label}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        max={150}
                        min={0}
                        value={scorecardInputs[key as keyof typeof scorecardInputs]}
                        onChange={(e) =>
                          setScorecardInputs({
                            ...scorecardInputs,
                            [key]: Number(e.target.value),
                          })
                        }
                        className="accent-brand-500 w-32"
                      />
                      <input
                        type="number"
                        max={150}
                        min={0}
                        value={scorecardInputs[key as keyof typeof scorecardInputs]}
                        onChange={(e) =>
                          setScorecardInputs({
                            ...scorecardInputs,
                            [key]: Math.min(150, Math.max(0, Number(e.target.value))),
                          })
                        }
                        className="bg-bg-tertiary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-16 rounded-xl border px-2 py-1 text-right font-mono text-xs text-white focus:ring-1 focus:outline-none"
                      />
                      <span className="text-fg-muted font-mono text-xs">%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-fg-muted flex justify-between font-mono text-xs font-bold">
              <span>{t("val_scorecard_multiplier_label")}</span>
              <span className="text-white">{scorecardMultiplier.toFixed(3)}x</span>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
              <span className="text-sm font-extrabold text-white">
                {t("val_scorecard_calc_result")}
              </span>
              <span className="font-mono text-2xl font-black text-emerald-400">
                {formatCurrency(scorecardValuation)}
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: VC METHOD FORM */}
        {activeTab === "vc" && (
          <div className="border-border-subtle bg-bg-secondary/40 space-y-4 rounded-2xl border p-6 backdrop-blur-md">
            <h3 className="border-b border-white/5 pb-2 text-sm font-bold tracking-wider text-white uppercase">
              {t("val_vc_title")}
            </h3>
            <p className="text-fg-muted text-xs leading-relaxed">{t("val_vc_desc")}</p>

            <div className="space-y-4 pt-2">
              <div className="flex flex-col justify-between gap-2 border-b border-white/5 pb-3 sm:flex-row sm:items-center">
                <span className="text-xs font-semibold text-white/90">
                  {t("val_vc_exit_val_label")}
                </span>
                <input
                  type="number"
                  value={vcExitValue}
                  onChange={(e) => setVcExitValue(Math.max(0, Number(e.target.value)))}
                  className="bg-bg-tertiary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border px-3 py-1.5 text-right font-mono text-sm text-white focus:ring-1 focus:outline-none sm:w-36"
                />
              </div>

              <div className="flex flex-col justify-between gap-2 border-b border-white/5 pb-3 sm:flex-row sm:items-center">
                <span className="text-xs font-semibold text-white/90">{t("val_vc_roi_label")}</span>
                <input
                  type="number"
                  value={vcTargetRoi}
                  onChange={(e) => setVcTargetRoi(Math.max(1, Number(e.target.value)))}
                  className="bg-bg-tertiary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border px-3 py-1.5 text-right font-mono text-sm text-white focus:ring-1 focus:outline-none sm:w-36"
                />
              </div>

              <div className="flex flex-col justify-between gap-2 border-b border-white/5 pb-3 sm:flex-row sm:items-center">
                <span className="text-xs font-semibold text-white/90">
                  {t("val_vc_investment_label")}
                </span>
                <input
                  type="number"
                  value={vcInvestment}
                  onChange={(e) => setVcInvestment(Math.max(0, Number(e.target.value)))}
                  className="bg-bg-tertiary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border px-3 py-1.5 text-right font-mono text-sm text-white focus:ring-1 focus:outline-none sm:w-36"
                />
              </div>
            </div>

            <div className="text-fg-muted flex justify-between font-mono text-xs font-bold">
              <span>{t("val_vc_post_money_label")}</span>
              <span className="text-white">{formatCurrency(vcPostMoney)}</span>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
              <span className="text-sm font-extrabold text-white">{t("val_vc_calc_result")}</span>
              <span className="font-mono text-2xl font-black text-emerald-400">
                {formatCurrency(vcValuation)}
              </span>
            </div>
          </div>
        )}

        {/* TAB 4: REVENUE MULTIPLIER FORM */}
        {activeTab === "revenue" && (
          <div className="border-border-subtle bg-bg-secondary/40 space-y-4 rounded-2xl border p-6 backdrop-blur-md">
            <h3 className="border-b border-white/5 pb-2 text-sm font-bold tracking-wider text-white uppercase">
              {t("val_revenue_title")}
            </h3>
            <p className="text-fg-muted text-xs leading-relaxed">{t("val_revenue_desc")}</p>

            <div className="space-y-4 pt-2">
              <div className="flex justify-between border-b border-white/5 pb-3 text-xs">
                <span className="text-fg-muted">{t("val_mrr_usd")}</span>
                <span className="font-mono font-bold text-white">
                  {formatCurrency(revenueMetrics.mrr)}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3 text-xs">
                <span className="text-fg-muted">{t("val_arr_usd")}</span>
                <span className="font-mono font-bold text-white">
                  {formatCurrency(revenueMetrics.arr)}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3 text-xs">
                <span className="text-fg-muted">{t("val_active_subs")}</span>
                <span className="font-mono font-bold text-white">{revenueMetrics.activeSubs}</span>
              </div>

              {hasRevenue ? (
                <div className="flex flex-col justify-between gap-2 border-b border-white/5 pb-3 sm:flex-row sm:items-center">
                  <span className="text-xs font-semibold text-white/90">
                    {t("val_revenue_multiplier")}
                  </span>
                  <input
                    type="number"
                    value={revenueMultiplier}
                    onChange={(e) => setRevenueMultiplier(Math.max(1, Number(e.target.value)))}
                    className="bg-bg-tertiary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border px-3 py-1.5 text-right font-mono text-sm text-white focus:ring-1 focus:outline-none sm:w-36"
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-4 text-center text-xs text-amber-300">
                  {t("val_pre_revenue_status")}
                </div>
              )}
            </div>

            {hasRevenue && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                <span className="text-sm font-extrabold text-white">{t("val_revenue_title")}</span>
                <span className="font-mono text-2xl font-black text-emerald-400">
                  {formatCurrency(revenueValuation)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CONSOLIDATED WEIGHTED DETAILS */}
        {activeTab === "average" && (
          <div className="border-border-subtle bg-bg-secondary/40 space-y-4 rounded-2xl border p-6 backdrop-blur-md">
            <h3 className="border-b border-white/5 pb-2 text-sm font-bold tracking-wider text-white uppercase">
              {t("val_consolidated_title")}
            </h3>
            <p className="text-fg-muted text-xs leading-relaxed">
              {locale === "tr"
                ? "Düşük (Berkus), Orta (Ağırlıklı Blend) ve Yüksek (Büyüme/VC) değerleme aralıkları."
                : "Low (Berkus), Base (Weighted Blend), and High (Growth/VC) valuation ranges."}
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex justify-between border-b border-white/5 pb-3 text-xs">
                <span className="text-fg-muted">{t("val_low_range")}</span>
                <span className="font-mono font-bold text-white">
                  {formatCurrency(lowValuation)}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3 text-xs">
                <span className="text-fg-muted">{t("val_base_range")}</span>
                <span className="text-brand-300 font-mono font-bold">
                  {formatCurrency(baseValuation)}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3 text-xs">
                <span className="text-fg-muted">{t("val_high_range")}</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatCurrency(highValuation)}
                </span>
              </div>
            </div>

            <div className="text-fg-muted rounded-xl border border-white/5 bg-neutral-900/40 p-4 text-[10px] leading-relaxed">
              {locale === "tr" ? (
                <>
                  <strong>Ağırlıklı Ortalama Formülü:</strong>
                  <br />
                  {hasRevenue
                    ? "Berkus (%30) + Scorecard (%30) + VC (%20) + Gelir Çarpanı (%20)"
                    : "Berkus (%40) + Scorecard (%40) + VC (%20)"}
                </>
              ) : (
                <>
                  <strong>Weighted Average Formula:</strong>
                  <br />
                  {hasRevenue
                    ? "Berkus (30%) + Scorecard (30%) + VC (20%) + Revenue Multiplier (20%)"
                    : "Berkus (40%) + Scorecard (40%) + VC (20%)"}
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: VALUATION HISTORY LOG */}
        {activeTab === "history" && (
          <div className="border-border-subtle bg-bg-secondary/40 space-y-4 rounded-2xl border p-6 backdrop-blur-md">
            <h3 className="border-b border-white/5 pb-2 text-sm font-bold tracking-wider text-white uppercase">
              {t("val_history_title")}
            </h3>

            <div className="overflow-x-auto">
              <table className="text-fg-secondary w-full text-left text-sm">
                <thead className="text-fg-muted border-b border-white/5 text-[10px] font-bold tracking-wider uppercase">
                  <tr>
                    <th className="pb-3">{t("val_col_date")}</th>
                    <th className="pb-3">{t("val_col_method")}</th>
                    <th className="pb-3 text-right">{t("val_col_valuation")}</th>
                    <th className="pb-3 pl-4">{t("val_col_notes")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-xs">
                  {valuations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-fg-muted py-8 text-center italic">
                        {t("val_history_empty")}
                      </td>
                    </tr>
                  ) : (
                    valuations.map((val) => (
                      <tr key={val.id} className="transition hover:bg-white/5">
                        <td className="flex items-center gap-1 py-3">
                          <Calendar className="text-fg-muted h-3.5 w-3.5" />
                          {val.snapshot_date}
                        </td>
                        <td className="text-brand-300 py-3 font-semibold uppercase">
                          {val.method}
                        </td>
                        <td className="py-3 text-right font-extrabold text-white">
                          {formatCurrency(val.result_pre_money)}
                        </td>
                        <td
                          className="text-fg-muted max-w-[200px] truncate py-3 pl-4 font-sans"
                          title={val.notes || ""}
                        >
                          {val.notes || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SUMMARY SIDEBAR COLUMN */}
      <div className="space-y-6 lg:col-span-4">
        {/* Consolidated Summary */}
        <div className="border-border-subtle bg-bg-secondary/40 flex flex-col justify-between rounded-2xl border p-5 backdrop-blur-md">
          <div>
            <h3 className="mb-4 flex items-center gap-1.5 text-xs font-bold tracking-wider text-white uppercase">
              <BarChart2 className="text-brand-400 h-4 w-4" />
              {t("val_consolidated_title")}
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between border-b border-white/5 pb-2 text-xs">
                <span className="text-fg-muted">{t("val_berkus_method_label")}</span>
                <span className="font-mono font-bold text-white">
                  {formatCurrency(berkusValuation)}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2 text-xs">
                <span className="text-fg-muted">{t("val_scorecard_method_label")}</span>
                <span className="font-mono font-bold text-white">
                  {formatCurrency(scorecardValuation)}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2 text-xs">
                <span className="text-fg-muted">{t("val_vc_method_label")}</span>
                <span className="font-mono font-bold text-white">
                  {formatCurrency(vcValuation)}
                </span>
              </div>
              {hasRevenue && (
                <div className="flex justify-between border-b border-white/5 pb-2 text-xs">
                  <span className="text-fg-muted">{t("val_revenue_method_label")}</span>
                  <span className="font-mono font-bold text-white">
                    {formatCurrency(revenueValuation)}
                  </span>
                </div>
              )}

              <div className="mt-6 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-center">
                <span className="text-fg-muted block text-[10px] font-bold tracking-wider uppercase">
                  {t("val_consolidated_avg_label")}
                </span>
                <span className="mt-1 block font-mono text-2xl font-black text-emerald-400">
                  {formatCurrency(baseValuation)}
                </span>
                <div className="text-fg-muted mt-2 flex justify-around border-t border-emerald-500/10 pt-2 text-[10px]">
                  <div>
                    <span className="block font-bold">{t("val_low_range")}</span>
                    <span className="font-mono text-white">{formatCurrency(lowValuation)}</span>
                  </div>
                  <div>
                    <span className="block font-bold">{t("val_high_range")}</span>
                    <span className="font-mono text-white">{formatCurrency(highValuation)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!isReadOnly && activeTab !== "history" && (
            <div className="mt-6 space-y-3 border-t border-white/5 pt-4">
              <label className="text-fg-secondary mb-1 block text-xs font-bold tracking-wider uppercase">
                {t("val_snapshot_notes_label")}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("val_snapshot_notes_placeholder")}
                rows={2}
                className="bg-bg-tertiary border-border-subtle focus:border-brand-500 w-full rounded-xl border px-3 py-2 text-xs text-white focus:outline-none"
              />

              <button
                onClick={() => handleSaveSnapshot(activeTab)}
                disabled={isSaving}
                className="bg-brand-600 hover:bg-brand-500 hover:shadow-brand-500/10 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-lg transition"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {t("swot_saving")}
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    {t("val_save_snapshot")}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

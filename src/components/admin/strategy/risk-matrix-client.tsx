"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Shield,
  X,
  HelpCircle,
  Loader2,
  Flame,
  AlertCircle,
  CheckCircle2,
  LayoutGrid,
  ScatterChart as ScatterChartIcon,
  Search,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceArea,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { upsertRiskAction, deleteRiskAction } from "@/actions/strategy";
import { toast } from "sonner";
import type { StrategyRisk } from "@/types";

interface RiskMatrixClientProps {
  initialRisks: StrategyRisk[];
  isReadOnly: boolean;
  locale: string;
}

type ViewMode = "heatmap" | "scatter";
type RiskFilter =
  "all" | "high" | "medium" | "low" | "active" | "mitigated" | "triggered" | "closed";

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

  // View mode: Heatmap or Scatter chart
  const [viewMode, setViewMode] = useState<ViewMode>("heatmap");

  // Selected cell filter in 5x5 grid (Probability vs Impact)
  const [selectedCell, setSelectedCell] = useState<{ p: number; i: number } | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<RiskFilter>("all");

  // Calculated KPI stats
  const stats = useMemo(() => {
    const total = risks.length;
    let high = 0;
    let medium = 0;
    let low = 0;
    let active = 0;
    let scoreSum = 0;

    risks.forEach((r) => {
      const score = r.probability * r.impact;
      scoreSum += score;
      if (score >= 15) high++;
      else if (score >= 8) medium++;
      else low++;

      if (r.status === "active") active++;
    });

    const avgExposure = total > 0 ? (scoreSum / total).toFixed(1) : "0.0";

    return { total, high, medium, low, active, avgExposure };
  }, [risks]);

  // Group risks by Probability (1-5) and Impact (1-5)
  const getCellRisks = (p: number, i: number) => {
    return risks.filter((r) => r.probability === p && r.impact === i);
  };

  // Determine cell color based on score (p * i)
  const getCellColor = (p: number, i: number, count: number) => {
    const score = p * i;
    const isSelected = selectedCell && selectedCell.p === p && selectedCell.i === i;

    let colorStyles =
      "border-success-500/20 bg-gradient-to-br from-success-500/15 via-success-500/5 to-teal-950/20 text-success-300 shadow-emerald-950/20 hover:border-success-400/40 hover:bg-success-500/25";

    if (score >= 15) {
      colorStyles =
        "border-danger-500/30 bg-gradient-to-br from-danger-500/25 via-danger-500/15 to-rose-950/40 text-danger-300 shadow-red-950/30 hover:border-danger-400/50 hover:bg-danger-500/35";
    } else if (score >= 8) {
      colorStyles =
        "border-warning-500/25 bg-gradient-to-br from-warning-500/20 via-warning-500/10 to-orange-950/30 text-warning-300 shadow-amber-950/20 hover:border-warning-400/40 hover:bg-warning-500/30";
    }

    return cn(
      "group relative flex h-16 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border p-2.5 shadow-lg backdrop-blur-md transition-all duration-300 select-none",
      colorStyles,
      isSelected &&
        "ring-brand-400 border-border-subtle/500 z-20 scale-[1.04] shadow-2xl ring-2 ring-offset-2 ring-offset-slate-950",
      count === 0 && "opacity-35 hover:opacity-75",
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

  // Filtered risks list based on matrix selection, search query, and filter pill
  const filteredRisks = useMemo(() => {
    return risks.filter((r) => {
      // 1. Matrix cell filter
      if (selectedCell) {
        if (r.probability !== selectedCell.p || r.impact !== selectedCell.i) {
          return false;
        }
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchCode = r.code.toLowerCase().includes(q);
        const matchDesc = r.description?.toLowerCase().includes(q) ?? false;
        const matchMitigation = r.mitigation_plan?.toLowerCase().includes(q) ?? false;
        if (!matchTitle && !matchCode && !matchDesc && !matchMitigation) {
          return false;
        }
      }

      // 3. Category / Status pill filter
      const score = r.probability * r.impact;
      if (activeFilter === "high") return score >= 15;
      if (activeFilter === "medium") return score >= 8 && score < 15;
      if (activeFilter === "low") return score < 8;
      if (activeFilter === "active") return r.status === "active";
      if (activeFilter === "mitigated") return r.status === "mitigated";
      if (activeFilter === "triggered") return r.status === "triggered";
      if (activeFilter === "closed") return r.status === "closed";

      return true;
    });
  }, [risks, selectedCell, searchQuery, activeFilter]);

  // Scatter chart data mapping
  const scatterData = useMemo(() => {
    return risks.map((r) => ({
      ...r,
      x: r.impact,
      y: r.probability,
      score: r.probability * r.impact,
      z: r.probability * r.impact * 20 + 100, // Dot size
    }));
  }, [risks]);

  // Matrix axis definitions
  const probabilities = [5, 4, 3, 2, 1]; // Y-axis (Probability 5 down to 1)
  const impacts = [1, 2, 3, 4, 5]; // X-axis (Impact 1 to 5)

  return (
    <div className="space-y-8">
      {/* KPI METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-bg-elevated/50 border-border-subtle relative overflow-hidden rounded-2xl border p-4 shadow-xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-fg-muted text-[11px] font-bold tracking-wider uppercase">
              Total Risks
            </span>
            <div className="border-brand-500/20 bg-brand-500/10 text-brand-400 rounded-xl border p-2">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-fg-secondaryxl font-black tracking-tight text-white">
              {stats.total}
            </span>
            <span className="text-fg-muted text-[10px] font-semibold">{stats.active} Active</span>
          </div>
          <div className="bg-brand-500/5 pointer-events-none absolute -right-6 -bottom-6 h-20 w-20 rounded-full blur-2xl" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="border-danger-500/20 relative overflow-hidden rounded-2xl border bg-gradient-to-br from-red-950/30 via-slate-900/60 to-slate-900/50 p-4 shadow-xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-danger-300 text-[11px] font-bold tracking-wider uppercase">
              Critical / High
            </span>
            <div className="border-danger-500/30 bg-danger-500/20 text-danger-400 animate-pulse rounded-xl border p-2">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-danger-400 text-fg-secondaryxl font-black tracking-tight">
              {stats.high}
            </span>
            <span className="text-danger-400/80 text-[10px] font-bold tracking-wider uppercase">
              Score ≥ 15
            </span>
          </div>
          <div className="bg-danger-500/10 pointer-events-none absolute -right-6 -bottom-6 h-20 w-20 rounded-full blur-2xl" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="border-warning-500/20 relative overflow-hidden rounded-2xl border bg-gradient-to-br from-amber-950/30 via-slate-900/60 to-slate-900/50 p-4 shadow-xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-warning-300 text-[11px] font-bold tracking-wider uppercase">
              Medium Risk
            </span>
            <div className="border-warning-500/30 bg-warning-500/20 text-warning-400 rounded-xl border p-2">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-warning-400 text-fg-secondaryxl font-black tracking-tight">
              {stats.medium}
            </span>
            <span className="text-warning-400/80 text-[10px] font-bold tracking-wider uppercase">
              Score 8-14
            </span>
          </div>
          <div className="bg-warning-500/10 pointer-events-none absolute -right-6 -bottom-6 h-20 w-20 rounded-full blur-2xl" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="border-success-500/20 relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-950/30 via-slate-900/60 to-slate-900/50 p-4 shadow-xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-success-300 text-[11px] font-bold tracking-wider uppercase">
              Low Risk
            </span>
            <div className="border-success-500/30 bg-success-500/20 text-success-400 rounded-xl border p-2">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-success-400 text-fg-secondaryxl font-black tracking-tight">
              {stats.low}
            </span>
            <span className="text-success-400/80 text-[10px] font-bold tracking-wider uppercase">
              Score 1-7
            </span>
          </div>
          <div className="bg-success-500/10 pointer-events-none absolute -right-6 -bottom-6 h-20 w-20 rounded-full blur-2xl" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="bg-bg-elevated/50 border-border-subtle relative col-span-2 overflow-hidden rounded-2xl border p-4 shadow-xl backdrop-blur-xl sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-fg-muted text-[11px] font-bold tracking-wider uppercase">
              Avg Exposure
            </span>
            <div className="border-accent-500/20 bg-accent-500/10 text-accent-400 rounded-xl border p-2">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-accent-300 text-fg-secondaryxl font-black tracking-tight">
              {stats.avgExposure}
              <span className="text-fg-muted text-xs font-normal"> / 25</span>
            </span>
            <Sparkles className="text-accent-400/60 h-4 w-4" />
          </div>
          <div className="bg-accent-500/5 pointer-events-none absolute -right-6 -bottom-6 h-20 w-20 rounded-full blur-2xl" />
        </motion.div>
      </div>

      {/* MAIN CONTENT GRID (VISUALIZATION + LOGS) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* LEFT COLUMN: HEATMAP / SCATTER CHART (5 COLS) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="dark:bg-bg-tertiary/30 border-border-subtle rounded-3xl border bg-white/5 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3),_inset_0_1px_1px_0_rgba(255,255,255,0.25)] ring-1 ring-white/5 backdrop-blur-3xl backdrop-contrast-125 backdrop-saturate-150">
            {/* Header & Mode Switcher */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="text-brand-400 h-4 w-4" />
                <h3 className="text-xs font-extrabold tracking-wider text-white uppercase">
                  {t("5x5_risk_heatmap_matrix")}
                </h3>
              </div>

              {/* View Switcher Controls */}
              <div className="bg-bg-tertiary/60 border-border-subtle flex items-center gap-1 rounded-xl border p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("heatmap")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase transition-all duration-200",
                    viewMode === "heatmap"
                      ? "bg-brand-500 shadow-brand-500/20 text-white shadow-md"
                      : "text-fg-muted hover:text-white",
                  )}
                >
                  <LayoutGrid className="h-3 w-3" />
                  <span>5x5 Heatmap</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("scatter")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase transition-all duration-200",
                    viewMode === "scatter"
                      ? "bg-brand-500 shadow-brand-500/20 text-white shadow-md"
                      : "text-fg-muted hover:text-white",
                  )}
                >
                  <ScatterChartIcon className="h-3 w-3" />
                  <span>2D Scatter</span>
                </button>
              </div>
            </div>

            {/* Matrix Filter reset indicator */}
            {selectedCell && (
              <div className="border-brand-500/30 bg-brand-500/10 text-brand-300 mb-4 flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold">
                <span>
                  {t("risk_filtered")} P{selectedCell.p} : I{selectedCell.i}
                </span>
                <button
                  onClick={() => setSelectedCell(null)}
                  className="text-brand-400 flex items-center gap-1 text-[10px] font-bold uppercase transition hover:text-white"
                >
                  <RotateCcw className="h-3 w-3" />
                  {t("reset_filter")}
                </button>
              </div>
            )}

            {/* VIEW MODE 1: 5x5 HEATMAP MATRIX */}
            {viewMode === "heatmap" ? (
              <div className="flex flex-col items-stretch">
                <div className="flex gap-2.5">
                  {/* Y-AXIS LABEL (PROBABILITY P5 -> P1) */}
                  <div className="text-fg-muted flex w-10 shrink-0 flex-col justify-between py-2 text-right font-mono text-[10px] font-bold select-none">
                    <span title="Probability 5 (Very High)">P5</span>
                    <span title="Probability 4 (High)">P4</span>
                    <span title="Probability 3 (Medium)">P3</span>
                    <span title="Probability 2 (Low)">P2</span>
                    <span title="Probability 1 (Very Low)">P1</span>
                  </div>

                  {/* HEATMAP GRID */}
                  <div className="flex-1 space-y-2">
                    {probabilities.map((p) => (
                      <div key={p} className="grid grid-cols-5 gap-2">
                        {impacts.map((i) => {
                          const cellRisks = getCellRisks(p, i);
                          const count = cellRisks.length;
                          const score = p * i;

                          return (
                            <motion.div
                              key={i}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                setSelectedCell(
                                  selectedCell && selectedCell.p === p && selectedCell.i === i
                                    ? null
                                    : { p, i },
                                )
                              }
                              className={getCellColor(p, i, count)}
                            >
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-extrabold">{count}</span>
                                {count > 0 && score >= 15 && (
                                  <span className="bg-danger-400 h-1.5 w-1.5 animate-ping rounded-full" />
                                )}
                              </div>
                              <span className="text-[9px] font-medium opacity-60">{score} pts</span>
                            </motion.div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* X-AXIS LABEL (IMPACT I1 -> I5) */}
                <div className="mt-3 flex gap-2.5">
                  <div className="w-10 shrink-0" />
                  <div className="text-fg-muted grid flex-1 grid-cols-5 gap-2 text-center font-mono text-[10px] font-bold select-none">
                    <span title="Impact 1 (Negligible)">I1</span>
                    <span title="Impact 2 (Minor)">I2</span>
                    <span title="Impact 3 (Moderate)">I3</span>
                    <span title="Impact 4 (Major)">I4</span>
                    <span title="Impact 5 (Catastrophic)">I5</span>
                  </div>
                </div>

                {/* MATRIX COLOR LEGEND */}
                <div className="text-fg-muted border-border-subtle mt-6 flex items-center justify-between gap-2 border-t pt-4 text-[10px] font-bold tracking-wider uppercase">
                  <div className="flex items-center gap-1.5">
                    <span className="border-success-500/40 bg-success-500/25 h-3 w-3 rounded-md border" />
                    <span>{t("low_1_6")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="border-warning-500/40 bg-warning-500/25 h-3 w-3 rounded-md border" />
                    <span>{t("medium_8_12")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="border-danger-500/40 bg-danger-500/25 h-3 w-3 rounded-md border" />
                    <span>{t("high_15_25")}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* VIEW MODE 2: RECHARTS 2D SCATTER PLOT */
              <div className="w-full space-y-2">
                <div className="h-[360px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />

                      {/* Quadrant risk areas */}
                      <ReferenceArea
                        x1={0.5}
                        x2={5.5}
                        y1={3.5}
                        y2={5.5}
                        fill="#ef4444"
                        fillOpacity={0.06}
                      />
                      <ReferenceArea
                        x1={3.5}
                        x2={5.5}
                        y1={0.5}
                        y2={3.5}
                        fill="#f59e0b"
                        fillOpacity={0.05}
                      />
                      <ReferenceArea
                        x1={0.5}
                        x2={3.5}
                        y1={0.5}
                        y2={3.5}
                        fill="#10b981"
                        fillOpacity={0.04}
                      />

                      <XAxis
                        type="number"
                        dataKey="x"
                        name="Impact"
                        domain={[0.5, 5.5]}
                        ticks={[1, 2, 3, 4, 5]}
                        stroke="#94a3b8"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        label={{
                          value: "Impact (1-5)",
                          position: "insideBottom",
                          offset: -10,
                          fill: "#94a3b8",
                          fontSize: 11,
                        }}
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        name="Probability"
                        domain={[0.5, 5.5]}
                        ticks={[1, 2, 3, 4, 5]}
                        stroke="#94a3b8"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        label={{
                          value: "Probability (1-5)",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#94a3b8",
                          fontSize: 11,
                        }}
                      />
                      <ZAxis type="number" dataKey="z" range={[100, 400]} />

                      <RechartsTooltip
                        cursor={{ strokeDasharray: "3 3", stroke: "#ffffff30" }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0]?.payload as StrategyRisk & { score: number };
                            const isHigh = data.score >= 15;
                            const isMedium = data.score >= 8 && data.score < 15;

                            return (
                              <div className="bg-bg-tertiary/90 border-border-strong max-w-xs rounded-2xl border p-3.5 text-xs text-white shadow-2xl backdrop-blur-2xl">
                                <div className="border-border-subtle mb-2 flex items-center justify-between gap-2 border-b pb-2">
                                  <span className="text-brand-400 font-mono font-black">
                                    {data.code}
                                  </span>
                                  <span
                                    className={cn(
                                      "rounded-md border px-2 py-0.5 text-[9px] font-black uppercase",
                                      isHigh
                                        ? "border-danger-500/40 bg-danger-500/20 text-danger-300"
                                        : isMedium
                                          ? "border-warning-500/40 bg-warning-500/20 text-warning-300"
                                          : "border-success-500/40 bg-success-500/20 text-success-300",
                                    )}
                                  >
                                    Score: {data.score}
                                  </span>
                                </div>
                                <p className="mb-1 text-sm leading-snug font-bold text-white">
                                  {data.title}
                                </p>
                                {data.description && (
                                  <p className="text-fg-muted mb-2 line-clamp-2 text-[11px]">
                                    {data.description}
                                  </p>
                                )}
                                <div className="text-fg-secondary border-border-subtle grid grid-cols-2 gap-2 border-t pt-2 text-[10px]">
                                  <div>
                                    <span className="text-fg-disabled block">Probability:</span>
                                    <span className="font-semibold text-white">
                                      {data.probability} / 5
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-fg-disabled block">Impact:</span>
                                    <span className="font-semibold text-white">
                                      {data.impact} / 5
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />

                      <Scatter name="Risks" data={scatterData}>
                        {scatterData.map((entry, index) => {
                          const score = entry.score;
                          const fillColor =
                            score >= 15 ? "#ef4444" : score >= 8 ? "#f59e0b" : "#10b981";
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={fillColor}
                              stroke="#ffffff80"
                              strokeWidth={1.5}
                            />
                          );
                        })}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-fg-muted text-center text-[10px] italic">
                  Hover over risk nodes to view details
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: RISK CARDS LIST & CONTROLS (7 COLS) */}
        <div className="flex flex-col space-y-4 lg:col-span-7">
          <div className="dark:bg-bg-tertiary/30 border-border-subtle flex flex-1 flex-col justify-between rounded-3xl border bg-white/5 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3),_inset_0_1px_1px_0_rgba(255,255,255,0.25)] ring-1 ring-white/5 backdrop-blur-3xl backdrop-contrast-125 backdrop-saturate-150">
            <div>
              {/* Header + Register Risk Button */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-white uppercase">
                    <span>{t("risk_matrix_logs")}</span>
                    <span className="text-fg-muted border-border-subtle rounded-full border bg-white/5 px-2 py-0.5 font-mono text-[10px]">
                      {filteredRisks.length} / {risks.length}
                    </span>
                  </h3>
                </div>

                {!isReadOnly && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleOpenAdd}
                    className="bg-brand-600 hover:bg-brand-500 shadow-brand-500/20 flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-lg transition"
                  >
                    <Plus className="h-4 w-4" />
                    {t("register_risk")}
                  </motion.button>
                )}
              </div>

              {/* SEARCH & QUICK FILTER PILLS BAR */}
              <div className="mb-4 space-y-3">
                {/* Search input */}
                <div className="relative">
                  <Search className="text-fg-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search risks by code, title or mitigation..."
                    className="focus:border-brand-500 focus:ring-brand-500 bg-bg-tertiary/60 border-border-subtle w-full rounded-xl border py-2 pr-4 pl-9 text-xs text-white placeholder-slate-500 focus:ring-1 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-fg-muted absolute top-1/2 right-3 -translate-y-1/2 text-xs hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { id: "all", label: "All" },
                      { id: "high", label: "Critical (≥15)" },
                      { id: "medium", label: "Medium (8-14)" },
                      { id: "low", label: "Low (1-7)" },
                      { id: "active", label: t("risk_active") },
                      { id: "mitigated", label: t("risk_mitigated") },
                      { id: "triggered", label: t("risk_triggered") },
                    ] as const
                  ).map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={cn(
                        "rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase transition-all duration-200 select-none",
                        activeFilter === filter.id
                          ? "border-brand-500/50 bg-brand-500/20 text-brand-300 shadow-sm"
                          : "text-fg-muted border-border-subtle/50 bg-white/5 hover:border-white/15 hover:text-white",
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* RISK CARDS CONTAINER WITH ANIMATE PRESENCE */}
              <div className="max-h-[460px] scrollbar-thin space-y-3.5 overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {filteredRisks.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-12 text-center"
                    >
                      <HelpCircle className="text-fg-secondary mx-auto mb-2 h-8 w-8" />
                      <p className="text-fg-muted text-xs italic">
                        {t("no_risks_found_in_this_category")}
                      </p>
                    </motion.div>
                  ) : (
                    filteredRisks.map((risk) => {
                      const score = risk.probability * risk.impact;
                      const isHigh = score >= 15;
                      const isMedium = score >= 8 && score < 15;

                      return (
                        <motion.div
                          key={risk.id}
                          layout
                          initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                          transition={{
                            type: "spring" as const,
                            stiffness: 400,
                            damping: 30,
                            mass: 0.8,
                          }}
                          className={cn(
                            "group relative overflow-hidden rounded-2xl border p-4 backdrop-blur-md transition-all duration-300",
                            isHigh
                              ? "border-danger-500/20 hover:border-danger-500/40 bg-gradient-to-r from-red-950/20 via-slate-900/50 to-slate-900/40"
                              : isMedium
                                ? "border-warning-500/20 hover:border-warning-500/40 bg-gradient-to-r from-amber-950/20 via-slate-900/50 to-slate-900/40"
                                : "border-success-500/20 hover:border-success-500/40 bg-gradient-to-r from-emerald-950/20 via-slate-900/50 to-slate-900/40",
                          )}
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
                                <p className="text-fg-secondary mt-1.5 text-xs leading-relaxed">
                                  {risk.description}
                                </p>
                              )}
                            </div>

                            {/* Risk score badge */}
                            <div className="flex shrink-0 items-center gap-2">
                              <div
                                className={cn(
                                  "flex h-11 w-11 flex-col items-center justify-center rounded-xl border text-sm font-black shadow-md",
                                  isHigh
                                    ? "border-danger-500/30 bg-danger-500/20 text-danger-300"
                                    : isMedium
                                      ? "border-warning-500/30 bg-warning-500/20 text-warning-300"
                                      : "border-success-500/30 bg-success-500/20 text-success-300",
                                )}
                              >
                                <span>{score}</span>
                                <span className="text-[7px] font-bold tracking-wider uppercase opacity-80">
                                  Score
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Mitigation Plan section */}
                          {risk.mitigation_plan && (
                            <div className="border-border-subtle/50 mt-3 border-t pt-2.5">
                              <span className="text-fg-muted flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase">
                                <Shield className="text-success-400 h-3 w-3" />
                                {t("mitigation_plan")}
                              </span>
                              <p className="text-fg-secondary/90 mt-1 text-xs leading-relaxed italic">
                                {risk.mitigation_plan}
                              </p>
                            </div>
                          )}

                          {/* Footer Info & Badges */}
                          <div className="text-fg-muted border-border-subtle/50 mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-2 text-[10px] font-bold tracking-wider uppercase">
                            <div className="flex items-center gap-3">
                              {risk.target_date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="text-fg-muted h-3 w-3" />
                                  <span>{risk.target_date}</span>
                                </span>
                              )}
                              <span className="flex items-center gap-1 font-mono">
                                <span>P:{risk.probability}</span>
                                <span>I:{risk.impact}</span>
                              </span>
                            </div>

                            <span
                              className={cn(
                                "rounded-md border px-2 py-0.5 text-[9px] font-bold",
                                risk.status === "active"
                                  ? "border-warning-500/30 bg-warning-500/10 text-warning-300"
                                  : risk.status === "mitigated"
                                    ? "border-success-500/30 bg-success-500/10 text-success-300"
                                    : risk.status === "triggered"
                                      ? "border-danger-500/30 bg-danger-500/10 text-danger-300"
                                      : "text-fg-muted border-border-subtle bg-white/5",
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

                          {/* Hover action overlay */}
                          {!isReadOnly && (
                            <div className="bg-bg-tertiary/80 border-border-subtle absolute top-3 right-16 flex items-center gap-1 rounded-xl border px-1.5 py-1 opacity-0 shadow-xl backdrop-blur-md transition-all duration-200 group-hover:opacity-100">
                              <button
                                onClick={() => handleOpenEdit(risk)}
                                title="Edit Risk"
                                className="text-fg-muted rounded-lg p-1 transition hover:bg-white/10 hover:text-white"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(risk.id)}
                                title="Delete Risk"
                                className="text-danger-400 hover:bg-danger-500/20 hover:text-danger-300 rounded-lg p-1 transition"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CRUD DIALOG MODAL WITH ANIMATE PRESENCE */}
      <AnimatePresence>
        {isModalOpen && activeRisk && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-bg-elevated w-full max-w-lg rounded-2xl border border-white/15 p-6 shadow-2xl backdrop-blur-2xl"
            >
              <div className="border-border-subtle mb-4 flex items-center justify-between border-b pb-3">
                <h3 className="flex items-center gap-2 text-base font-bold tracking-wider text-white uppercase">
                  <Shield className="text-brand-400 h-4 w-4" />
                  {activeRisk.id ? t("edit_risk_log") : t("register_strategic_risk")}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-fg-muted rounded-lg p-1 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-fg-secondary mb-1 block text-[11px] font-bold tracking-wider uppercase">
                      {t("risk_code_label")}
                    </label>
                    <input
                      type="text"
                      required
                      value={activeRisk.code || ""}
                      onChange={(e) => setActiveRisk({ ...activeRisk, code: e.target.value })}
                      placeholder={t("risk_code_placeholder")}
                      className="focus:border-brand-500 focus:ring-brand-500 bg-bg-tertiary/60 border-border-subtle w-full rounded-xl border px-3.5 py-2.5 text-xs text-white focus:ring-1 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-fg-secondary mb-1 block text-[11px] font-bold tracking-wider uppercase">
                      {t("risk_title")}
                    </label>
                    <input
                      type="text"
                      required
                      value={activeRisk.title || ""}
                      onChange={(e) => setActiveRisk({ ...activeRisk, title: e.target.value })}
                      placeholder={t("risk_title_placeholder")}
                      className="focus:border-brand-500 focus:ring-brand-500 bg-bg-tertiary/60 border-border-subtle w-full rounded-xl border px-3.5 py-2.5 text-xs text-white focus:ring-1 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-fg-secondary mb-1 block text-[11px] font-bold tracking-wider uppercase">
                    {t("description_1")}
                  </label>
                  <textarea
                    value={activeRisk.description || ""}
                    onChange={(e) => setActiveRisk({ ...activeRisk, description: e.target.value })}
                    rows={2}
                    className="focus:border-brand-500 focus:ring-brand-500 bg-bg-tertiary/60 border-border-subtle w-full rounded-xl border px-3.5 py-2 text-xs text-white focus:ring-1 focus:outline-none"
                  />
                </div>

                {/* VISUAL SLIDERS & LIVE SCORE PREVIEW */}
                <div className="bg-bg-tertiary/40 border-border-subtle space-y-3 rounded-xl border p-3.5">
                  <div className="text-fg-secondary flex items-center justify-between text-xs font-bold uppercase">
                    <span>Probability & Impact Picker</span>
                    {/* Live score readout */}
                    {(() => {
                      const prob = Number(activeRisk.probability || 3);
                      const imp = Number(activeRisk.impact || 3);
                      const score = prob * imp;
                      const isHigh = score >= 15;
                      const isMed = score >= 8 && score < 15;

                      return (
                        <span
                          className={cn(
                            "rounded-md border px-2 py-0.5 text-[10px] font-black uppercase",
                            isHigh
                              ? "border-danger-500/40 bg-danger-500/20 text-danger-300"
                              : isMed
                                ? "border-warning-500/40 bg-warning-500/20 text-warning-300"
                                : "border-success-500/40 bg-success-500/20 text-success-300",
                          )}
                        >
                          Score: {prob} × {imp} = {score}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-fg-muted mb-1 block text-[10px] font-bold tracking-wider uppercase">
                        {t("probability_1_5")}
                      </label>
                      <select
                        value={activeRisk.probability}
                        onChange={(e) =>
                          setActiveRisk({ ...activeRisk, probability: Number(e.target.value) })
                        }
                        className="focus:border-brand-500 bg-bg-elevated border-border-subtle w-full rounded-xl border px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="1">1 - {t("risk_prob_very_low")}</option>
                        <option value="2">2 - {t("risk_prob_low")}</option>
                        <option value="3">3 - {t("risk_prob_medium")}</option>
                        <option value="4">4 - {t("risk_prob_high")}</option>
                        <option value="5">5 - {t("risk_prob_very_high")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-fg-muted mb-1 block text-[10px] font-bold tracking-wider uppercase">
                        {t("impact_1_5")}
                      </label>
                      <select
                        value={activeRisk.impact}
                        onChange={(e) =>
                          setActiveRisk({ ...activeRisk, impact: Number(e.target.value) })
                        }
                        className="focus:border-brand-500 bg-bg-elevated border-border-subtle w-full rounded-xl border px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="1">1 - {t("risk_impact_negligible")}</option>
                        <option value="2">2 - {t("risk_impact_minor")}</option>
                        <option value="3">3 - {t("risk_impact_moderate")}</option>
                        <option value="4">4 - {t("risk_impact_major")}</option>
                        <option value="5">5 - {t("risk_impact_catastrophic")}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-fg-secondary mb-1 block text-[11px] font-bold tracking-wider uppercase">
                    {t("mitigation_plan_1")}
                  </label>
                  <textarea
                    value={activeRisk.mitigation_plan || ""}
                    onChange={(e) =>
                      setActiveRisk({ ...activeRisk, mitigation_plan: e.target.value })
                    }
                    rows={2}
                    className="focus:border-brand-500 focus:ring-brand-500 bg-bg-tertiary/60 border-border-subtle w-full rounded-xl border px-3.5 py-2 text-xs text-white focus:ring-1 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-fg-secondary mb-1 block text-[11px] font-bold tracking-wider uppercase">
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
                      className="focus:border-brand-500 bg-bg-tertiary/60 border-border-subtle w-full rounded-xl border px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="active">{t("risk_active")}</option>
                      <option value="mitigated">{t("risk_mitigated")}</option>
                      <option value="triggered">{t("risk_triggered")}</option>
                      <option value="closed">{t("risk_closed")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-fg-secondary mb-1 block text-[11px] font-bold tracking-wider uppercase">
                      {t("target_date")}
                    </label>
                    <input
                      type="date"
                      value={activeRisk.target_date || ""}
                      onChange={(e) =>
                        setActiveRisk({ ...activeRisk, target_date: e.target.value })
                      }
                      className="focus:border-brand-500 bg-bg-tertiary/60 border-border-subtle w-full rounded-xl border px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="border-border-subtle mt-6 flex justify-end gap-2 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-fg-secondary border-border-subtle rounded-xl border px-4 py-2 text-xs font-semibold transition hover:bg-white/5 hover:text-white"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-brand-600 hover:bg-brand-500 flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-lg transition"
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

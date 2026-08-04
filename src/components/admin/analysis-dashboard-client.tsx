"use client";

import * as React from "react";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Clock,
  Lock,
  ExternalLink,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface ScoreSet {
  vision_mission: number;
  message_content: number;
  ux_ui_design: number;
  technical_architecture: number;
  legal_compliance: number;
  business_model: number;
  growth_viral: number;
  traction_social_proof: number;
  investor_readiness: number;
  societal_impact: number;
  total: number;
  total_max: number;
}

interface Audit {
  model_id: string;
  model_name: string;
  provider: string;
  audit_date: string;
  audit_type: string;
  is_free?: boolean;
  scores: ScoreSet;
  unique_insight: string;
  key_recommendations: string[];
}

interface P0Blocker {
  id: string;
  title: string;
  category: "data" | "ui" | "i18n" | "legal" | "security" | "performance";
  status: "open" | "in-progress" | "resolved" | "wont-fix";
  first_reported: string;
  resolved_date?: string | null;
  model_count: number;
  effort?: string;
}

interface ConsensusFinding {
  finding: string;
  model_count: string;
  status?: string;
}

interface ScoreEvolution {
  date: string;
  round: number;
  average_score: number;
  highest: number;
  lowest: number;
  model_count: number;
  note?: string;
}

interface RegistryData {
  metadata: {
    project: string;
    created: string;
    last_updated: string;
    total_models: number;
    scoring_weights: Record<string, number>;
  };
  audits: Audit[];
  consensus_findings: {
    unanimous: ConsensusFinding[];
    strong_consensus: ConsensusFinding[];
  };
  p0_tracker: P0Blocker[];
  score_evolution: ScoreEvolution[];
}

interface Props {
  registryData: RegistryData;
}

interface LiveAnalysisResult {
  overall_score: number;
  executive_summary: string;
  security_flaws: string[] | string;
  recommendations: string[] | string;
}

export function AnalysisDashboardClient({ registryData }: Props) {
  const t = useTranslations("admin");
  const [p0Filter, setP0Filter] = React.useState<"all" | "open" | "resolved">("all");
  const [p0Search, setP0Search] = React.useState("");
  const [carouselIndex, setCarouselIndex] = React.useState(0);
  const [isLiveAnalyzing, setIsLiveAnalyzing] = React.useState(false);
  const [liveResult, setLiveResult] = React.useState<LiveAnalysisResult | null>(null);
  const [showFreeModels, setShowFreeModels] = React.useState(true);

  const [logs, _setLogs] = React.useState<string[]>([]);

  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Real logs would stream from a monitoring endpoint
    // Currently showing empty state until logging backend is connected
  }, []);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredAudits = showFreeModels
    ? registryData.audits
    : registryData.audits.filter((audit) => !audit.is_free);

  const totalModels = filteredAudits.length;
  const p0Tracker = registryData.p0_tracker;
  const openP0Count = p0Tracker.filter(
    (b) => b.status === "open" || b.status === "in-progress",
  ).length;
  const resolvedP0Count = p0Tracker.filter((b) => b.status === "resolved").length;

  const evolution = registryData.score_evolution;
  const latestRound = evolution[evolution.length - 1];
  const previousRound = evolution.length > 1 ? evolution[evolution.length - 2] : null;

  const currentAvg = latestRound?.average_score ?? 400;
  const previousAvg = previousRound?.average_score ?? 400;
  const scoreDiff = currentAvg - previousAvg;

  React.useEffect(() => {
    if (carouselIndex >= filteredAudits.length && filteredAudits.length > 0) {
      setCarouselIndex(0);
    }
  }, [filteredAudits.length, carouselIndex]);

  const handleNextInsight = () => {
    setCarouselIndex((prev) => (prev + 1) % Math.max(1, filteredAudits.length));
  };

  const handlePrevInsight = () => {
    setCarouselIndex(
      (prev) =>
        (prev - 1 + Math.max(1, filteredAudits.length)) % Math.max(1, filteredAudits.length),
    );
  };

  const handleRunLiveAnalysis = async () => {
    setIsLiveAnalyzing(true);
    setLiveResult(null);
    toast.loading("Yapay zeka analiz yapıyor (gpt-4o-mini)...", { id: "live-analysis" });
    try {
      const res = await fetch("/api/admin/live-analysis", {
        cache: "no-store",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      let result;
      try {
        result = await res.json();
      } catch (_e) {
        throw new Error(`API yanıtı okunamadı (Status: ${res.status})`);
      }

      if (!res.ok) {
        throw new Error(result?.message || `Sunucu hatası: ${res.status}`);
      }

      setIsLiveAnalyzing(false);

      if (result.success && result.data) {
        toast.success("Analiz tamamlandı!", { id: "live-analysis" });
        setLiveResult(result.data);
      } else {
        toast.error(result.message || "Analiz sırasında bir hata oluştu.", { id: "live-analysis" });
      }
    } catch (err) {
      setIsLiveAnalyzing(false);
      toast.error(
        `Ağ veya Sunucu Hatası: ${err instanceof Error ? err.message : "Bilinmeyen hata"}`,
        { id: "live-analysis" },
      );
    }
  };

  const filteredP0Blockers = p0Tracker.filter((item) => {
    const matchesFilter =
      p0Filter === "all" ||
      (p0Filter === "open" && (item.status === "open" || item.status === "in-progress")) ||
      (p0Filter === "resolved" && item.status === "resolved");

    const matchesSearch =
      item.title.toLowerCase().includes(p0Search.toLowerCase()) ||
      item.category.toLowerCase().includes(p0Search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const categories = [
    { key: "vision_mission", label: t("cat_vision_mission") },
    { key: "message_content", label: t("cat_message_content") },
    { key: "ux_ui_design", label: t("cat_ux_ui_design") },
    { key: "technical_architecture", label: t("cat_technical_architecture") },
    { key: "legal_compliance", label: t("cat_legal_compliance") },
    { key: "business_model", label: t("cat_business_model") },
    { key: "growth_viral", label: t("cat_growth_viral") },
    { key: "traction_social_proof", label: t("cat_traction_social_proof") },
    { key: "investor_readiness", label: t("cat_investor_readiness") },
    { key: "societal_impact", label: t("cat_societal_impact") },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    if (score >= 40) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    if (score > 0) return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    return "text-fg-muted bg-bg-tertiary border-border-subtle";
  };

  return (
    <div className="space-y-8">
      {/* Top Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={showFreeModels}
            onChange={(e) => setShowFreeModels(e.target.checked)}
            className="text-brand-500 cursor-pointer rounded border-white/20 bg-neutral-900"
          />
          <span className="text-fg-secondary text-sm font-medium">
            {t("show_free_models", { defaultValue: "Show Free Models" })}
          </span>
        </label>
        <div>
          <button
            onClick={handleRunLiveAnalysis}
            disabled={isLiveAnalyzing}
            className="bg-brand-500 hover:bg-brand-400 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Bot className={cn("h-4 w-4", isLiveAnalyzing && "animate-spin")} />
            {isLiveAnalyzing ? "Analiz Ediliyor..." : "Yapay Zeka Analizini Başlat (Canlı)"}
          </button>
        </div>
      </div>

      {liveResult && (
        <div className="bg-bg-secondary/80 border-brand-500/40 relative overflow-hidden rounded-2xl border p-6 shadow-xl backdrop-blur-xl">
          <div className="bg-brand-500/20 absolute -top-10 -right-10 rounded-full p-20 blur-3xl"></div>
          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <Bot className="text-brand-400 h-6 w-6" />
                {t("canl_qa_sistem_raporu")}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-fg-muted font-mono text-sm">{t("skor")}</span>
                <span
                  className={cn(
                    "text-2xl font-black",
                    getScoreColor(liveResult.overall_score || 0),
                  )}
                >
                  {liveResult.overall_score || "?"}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-fg-secondary mb-2 text-xs font-semibold tracking-wider uppercase">
                  {t("y_netici_zeti")}
                </h3>
                <p className="text-sm leading-relaxed text-white/80">
                  {liveResult.executive_summary}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-rose-400">
                    <AlertTriangle className="h-4 w-4" /> {t("g_venlik_a_klar")}
                  </h3>
                  <ul className="text-fg-primary list-inside list-disc space-y-2 text-sm">
                    {Array.isArray(liveResult.security_flaws) ? (
                      liveResult.security_flaws.map((flaw: string, i: number) => (
                        <li key={i}>{flaw}</li>
                      ))
                    ) : (
                      <li>{liveResult.security_flaws as string}</li>
                    )}
                  </ul>
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> {t("tavsiyeler")}
                  </h3>
                  <ul className="text-fg-primary list-inside list-disc space-y-2 text-sm">
                    {Array.isArray(liveResult.recommendations) ? (
                      liveResult.recommendations.map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))
                    ) : (
                      <li>{liveResult.recommendations as string}</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setLiveResult(null)}
                className="text-fg-muted text-xs transition-colors hover:text-white"
              >
                {t("kapat")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {/* Top Metrics Bento Row */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Metric 1: Average Score */}
          <div className="group hover:border-brand-500/30 relative flex flex-col overflow-hidden rounded-lg border border-white/10 bg-neutral-900/60 p-5 shadow-md backdrop-blur-xl transition-all duration-300">
            <div className="from-brand-500 absolute top-0 left-0 h-1 w-full bg-gradient-to-r to-transparent opacity-50 transition-all transition-opacity group-hover:opacity-100"></div>
            <div className="mb-4 flex items-start justify-between">
              <span className="text-fg-muted text-xs font-semibold tracking-widest uppercase">
                {t("average_score")}
              </span>
              <TrendingUp className="text-brand-400 h-5 w-5" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                {currentAvg}
              </span>
              <span className="text-fg-muted text-sm">/ 1000</span>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-cyan-400">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>
                +{scoreDiff} {t("increase_from_r1", { diff: scoreDiff })}
              </span>
            </div>
            {/* Dynamic Trendline SVG */}
            <div className="mt-3 flex h-8 items-end gap-1 opacity-70">
              {evolution.length > 0 ? (
                // Use actual evolution data, pad to at least 5 bars if needed
                Array.from({ length: Math.max(5, evolution.length) }).map((_, i) => {
                  const evIndex = i - (Math.max(5, evolution.length) - evolution.length);
                  const point = evIndex >= 0 ? evolution[evIndex] : null;
                  const heightPercent = point
                    ? Math.max(10, (point.average_score / 1000) * 100)
                    : 10 + i * 15; // Fallback heights for padding
                  const isLatest = i === Math.max(5, evolution.length) - 1;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "w-full rounded-t-sm",
                        isLatest
                          ? "bg-brand-500 animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                          : "bg-brand-500/30 transition-opacity hover:opacity-100",
                      )}
                      style={{ height: `${heightPercent}%` }}
                      title={
                        point
                          ? `Round ${point.round}: ${point.average_score}`
                          : "Historical Context"
                      }
                    />
                  );
                })
              ) : (
                <>
                  <div className="bg-brand-500/10 h-[30%] w-full rounded-t-sm"></div>
                  <div className="bg-brand-500/20 h-[45%] w-full rounded-t-sm"></div>
                  <div className="bg-brand-500/30 h-[60%] w-full rounded-t-sm"></div>
                  <div className="bg-brand-500/50 h-[80%] w-full rounded-t-sm shadow-[0_0_10px_rgba(168,85,247,0.3)]"></div>
                  <div className="bg-brand-500 h-[95%] w-full animate-pulse rounded-t-sm shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
                </>
              )}
            </div>
          </div>

          {/* Metric 2: Total Frontiers */}
          <div className="group relative flex flex-col overflow-hidden rounded-lg border border-white/10 bg-neutral-900/60 p-5 shadow-md backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/30">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-cyan-500 to-transparent opacity-50 transition-all transition-opacity group-hover:opacity-100"></div>
            <div className="mb-4 flex items-start justify-between">
              <span className="text-fg-muted text-xs font-semibold tracking-widest uppercase">
                {t("total_models")}
              </span>
              <Database className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                {totalModels}
              </span>
              <span className="text-fg-muted text-sm">{t("frontiers")}</span>
            </div>
            <div className="mt-4 font-mono text-[10px] tracking-wider text-cyan-400 uppercase">
              {t("active_nodes_secured")}
            </div>
          </div>

          {/* Metric 3: Open P0 Blockers */}
          <div
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-lg border bg-neutral-900/60 p-5 shadow-md backdrop-blur-xl transition-all duration-300",
              openP0Count > 0
                ? "border-rose-500/30 bg-rose-950/5 hover:border-rose-500/50"
                : "hover:border-brand-500/30 border-white/10",
            )}
          >
            {openP0Count > 0 && (
              <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-rose-500 to-transparent"></div>
            )}
            <div className="mb-4 flex items-start justify-between">
              <span className="text-fg-muted text-xs font-semibold tracking-widest uppercase">
                {t("open_p0_blockers")}
              </span>
              <AlertTriangle
                className={cn("h-5 w-5", openP0Count > 0 ? "text-rose-400" : "text-fg-muted")}
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "text-4xl font-extrabold tracking-tight",
                  openP0Count > 0
                    ? "text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                    : "text-white",
                )}
              >
                {openP0Count}
              </span>
              <span className="text-fg-muted text-sm">{t("critical")}</span>
            </div>
            <div className="mt-4 font-mono text-[10px] tracking-wider text-rose-400/80 uppercase">
              {openP0Count > 0 ? t("requires_immediate") : t("all_operational")}
            </div>
          </div>

          {/* Metric 4: Resolved P0 Blockers */}
          <div className="group relative flex flex-col overflow-hidden rounded-lg border border-white/10 bg-neutral-900/60 p-5 shadow-md backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/30">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-transparent opacity-50 transition-opacity group-hover:opacity-100"></div>
            <div className="mb-4 flex items-start justify-between">
              <span className="text-fg-muted text-xs font-semibold tracking-widest uppercase">
                {t("resolved_p0_blockers")}
              </span>
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                {resolvedP0Count}
              </span>
              <span className="text-fg-muted text-sm">{t("fixed")}</span>
            </div>
            <div className="mt-4 font-mono text-[10px] tracking-wider text-emerald-400/80 uppercase">
              {t("remediated_active")}
            </div>
          </div>
        </div>

        {/* Bento Main Grid Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Model Comparison Matrix (Spans 2 Columns) */}
          <div className="border-t-brand-500/30 flex flex-col justify-between rounded-lg border border-white/10 bg-neutral-900/60 p-6 shadow-md backdrop-blur-xl lg:col-span-2">
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-md flex items-center gap-2 font-semibold text-white">
                  <Database className="text-brand-400 h-5 w-5" />
                  {t("model_comparison_matrix")}
                </h3>
                <span className="text-fg-muted font-mono text-xs tracking-wider uppercase">
                  {t("heatmap_analysis")}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="text-fg-muted w-full min-w-[500px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="text-fg-muted border-b border-white/10 text-xs tracking-wider uppercase">
                      <th className="py-3 pr-4 font-semibold">{t("model_core")}</th>
                      {filteredAudits.map((a) => (
                        <th key={a.model_id} className="px-2 py-3 text-center font-semibold">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className="block max-w-[85px] truncate font-mono text-[11px]"
                              title={a.model_name}
                            >
                              {a.model_name.replace(" (360°)", "")}
                            </span>
                            {a.is_free && (
                              <span className="rounded border border-emerald-500/30 bg-emerald-500/20 px-1.5 py-0.5 font-sans text-[9px] font-semibold text-emerald-400">
                                Free
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-xs">
                    {categories.map(({ key, label }) => (
                      <tr key={key} className="transition-colors hover:bg-white/5">
                        <td className="text-fg-primary py-3 pr-4 font-sans font-medium">{label}</td>
                        {filteredAudits.map((a) => {
                          const score = (a.scores as unknown as Record<string, number>)[key];
                          const hasScore = score !== undefined && score !== 0;
                          return (
                            <td key={a.model_id} className="px-1 py-3 text-center">
                              <span
                                className={cn(
                                  "inline-block min-w-[32px] rounded border px-2 py-1 text-center font-bold",
                                  hasScore
                                    ? getScoreColor(score)
                                    : "text-fg-muted/40 border-white/5 bg-neutral-950/20",
                                )}
                              >
                                {hasScore ? score : "—"}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    <tr className="bg-brand-950/20 border-t-2 border-white/10 text-sm font-bold">
                      <td className="text-brand-400 py-4 pr-4 font-sans">
                        {t("total_score", { defaultValue: "TOTAL SCORE" })}
                      </td>
                      {filteredAudits.map((a) => {
                        const total = a.scores.total;
                        return (
                          <td key={a.model_id} className="px-1 py-4 text-center">
                            <span className="text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                              {total}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right column: Audit Consensus & Telemetry Feed */}
          <div className="flex flex-col justify-between space-y-6">
            {/* Audit Consensus */}
            <div className="rounded-lg border border-white/10 border-t-cyan-500/30 bg-neutral-900/60 p-6 shadow-md backdrop-blur-xl">
              <h3 className="text-md mb-4 flex items-center gap-2 font-semibold text-white">
                <CheckCircle2 className="h-5 w-5 text-cyan-400" />
                {t("consensus_core_alignment")}
              </h3>
              <div className="space-y-4">
                {/* Unanimous Pass */}
                <div className="flex items-center justify-between rounded border border-white/5 bg-neutral-950/40 p-3 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {t("unanimous_consensus")}
                      </div>
                      <div className="text-fg-muted font-mono text-[10px]">
                        {t("all_agents_unison")}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-2xl font-extrabold tracking-tighter text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                    {registryData.consensus_findings.unanimous.length}
                  </span>
                </div>

                {/* Strong Consensus */}
                <div className="flex items-center justify-between rounded border border-white/5 bg-neutral-950/40 p-3 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-brand-500/10 border-brand-500/30 flex h-8 w-8 items-center justify-center rounded-full border shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                      <TrendingUp className="text-brand-400 h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {t("strong_consensus")}
                      </div>
                      <div className="text-fg-muted font-mono text-[10px]">
                        {t("majority_compliance")}
                      </div>
                    </div>
                  </div>
                  <span className="text-brand-400 font-mono text-2xl font-extrabold tracking-tighter drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                    {registryData.consensus_findings.strong_consensus.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Telemetry Feed Log Window */}
            <div className="flex min-h-[220px] flex-grow flex-col rounded-lg border border-cyan-500/20 bg-neutral-950/80 p-5 shadow-[0_0_20px_rgba(6,182,212,0.08)] backdrop-blur-2xl">
              <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                <span className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-cyan-400 uppercase">
                  <span className="h-2 w-2 animate-ping rounded-full bg-cyan-400"></span>
                  {t("telemetry_feed")}
                </span>
                <span className="text-fg-muted font-mono text-[10px]">{t("terminal_version")}</span>
              </div>
              <div className="max-h-[160px] flex-grow scrollbar-thin scrollbar-thumb-cyan-500/30 space-y-1.5 overflow-y-auto pr-2 font-mono text-[10px] text-cyan-300/80">
                {logs.map((log, index) => {
                  const translatedLog = t(log);
                  let logColor = "text-cyan-300/80";
                  if (translatedLog.includes("WARN:") || translatedLog.includes("UYARI:"))
                    logColor = "text-amber-400";
                  if (translatedLog.includes("OK:") || translatedLog.includes("TAMAM:"))
                    logColor = "text-cyan-400 font-semibold";
                  if (
                    translatedLog.includes("SYS_MONITOR:") ||
                    translatedLog.includes("SİS_GÖZLEM:") ||
                    translatedLog.includes("SİS_İZLEME:")
                  )
                    logColor = "text-brand-400/90";
                  if (translatedLog.includes("SECURE:") || translatedLog.includes("GÜVENLİ:"))
                    logColor = "text-emerald-400 font-semibold";
                  return (
                    <div
                      key={index}
                      className={cn("flex gap-2 leading-relaxed break-all", logColor)}
                    >
                      {translatedLog}
                    </div>
                  );
                })}
                <div className="flex items-center font-bold text-cyan-400">
                  {t("awaiting_input")}
                  <span className="ml-1 inline-block h-3.5 w-1.5 animate-pulse bg-cyan-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Third Row: Unique Insights Carousel & Access Management */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Access Management */}
          <div className="rounded-lg border border-white/10 border-t-white/20 bg-neutral-900/60 p-6 shadow-md backdrop-blur-xl lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-md flex items-center gap-2 font-semibold text-white">
                <Lock className="text-brand-400 h-5 w-5" />
                {t("access_management")}
              </h3>
              <button className="bg-brand-500/20 hover:bg-brand-500/30 border-brand-500/30 text-brand-300 rounded border px-3 py-1 text-xs font-semibold shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all duration-200">
                {t("create_api_key")}
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Production Key */}
              <div className="hover:border-brand-500/30 rounded border border-white/5 bg-neutral-950/60 p-4 transition-all duration-300">
                <div className="mb-2 flex items-start justify-between">
                  <span className="text-xs font-semibold text-white">
                    {t("prod_gateway_master")}
                  </span>
                  <span className="rounded border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 font-mono text-[9px] tracking-wider text-cyan-400 uppercase">
                    {t("active")}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between rounded border border-white/5 bg-neutral-900 p-2">
                  <code className="text-fg-muted font-mono text-xs tracking-widest">
                    {t("sk_prod_8f9a")}
                  </code>
                  <button
                    onClick={() => handleCopyKey("sk-prod-a1b2c3d4e5f6g7h8j9k08f9a")}
                    className="text-fg-muted p-1 transition-colors hover:text-white"
                    title={t("copy")}
                  >
                    <span className="font-mono text-[10px]">
                      {copiedKey === "sk-prod-a1b2c3d4e5f6g7h8j9k08f9a" ? t("copied") : t("copy")}
                    </span>
                  </button>
                </div>
              </div>

              {/* Staging Key */}
              <div className="rounded border border-white/5 bg-neutral-950/40 p-4 opacity-50">
                <div className="mb-2 flex items-start justify-between">
                  <span className="text-fg-muted text-xs font-semibold">
                    {t("stag_sandbox_client")}
                  </span>
                  <span className="text-fg-muted rounded border border-white/10 bg-neutral-800 px-2 py-0.5 font-mono text-[9px] tracking-wider uppercase">
                    {t("revoked")}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between rounded border border-white/5 bg-neutral-900/50 p-2">
                  <code className="text-fg-disabled font-mono text-xs tracking-widest">
                    {t("sk_stag_2b1c")}
                  </code>
                  <span className="text-fg-disabled px-1 font-mono text-[10px]">
                    {t("blocked")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Unique Insights Carousel (1 Column) */}
          <div className="from-brand-950/20 border-brand-500/20 flex flex-col justify-between rounded-lg border bg-gradient-to-b to-neutral-900/60 p-6 shadow-md backdrop-blur-xl">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-md flex items-center gap-2 font-semibold text-white">
                  <TrendingUp className="text-brand-400 h-5 w-5" />
                  {t("unique_insights")}
                </h3>
                <div className="flex gap-1.5">
                  <button
                    onClick={handlePrevInsight}
                    className="rounded-md border border-white/10 p-1 transition-all duration-200 hover:bg-white/5"
                  >
                    <ChevronLeft className="h-4 w-4 text-white" />
                  </button>
                  <button
                    onClick={handleNextInsight}
                    className="rounded-md border border-white/10 p-1 transition-all duration-200 hover:bg-white/5"
                  >
                    <ChevronRight className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="relative mt-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-brand-500/20 text-brand-300 border-brand-500/30 rounded-md border px-2 py-0.5 text-[10px] font-semibold">
                        {filteredAudits[carouselIndex]?.provider}
                      </span>
                      {filteredAudits[carouselIndex]?.is_free && (
                        <span className="rounded border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                          Free
                        </span>
                      )}
                    </div>
                    <span className="text-fg-muted font-mono text-[10px]">
                      {carouselIndex + 1} / {filteredAudits.length}
                    </span>
                  </div>
                  <h4 className="mt-3 text-sm font-semibold text-white">
                    {filteredAudits[carouselIndex]?.model_name}
                  </h4>
                  <p className="text-fg-secondary mt-3 line-clamp-3 text-xs leading-relaxed italic">
                    {t("ldquo")}
                    {filteredAudits[carouselIndex]?.unique_insight}
                    {t("rdquo")}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
              <span className="text-fg-muted text-[10px]">
                {t("reported")}: {filteredAudits[carouselIndex]?.audit_date}
              </span>
            </div>
          </div>
        </div>

        {/* P0 Blocker Tracker Card */}
        <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-6 shadow-md backdrop-blur-xl">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-md flex items-center gap-2 font-semibold text-white">
                <AlertTriangle className="text-brand-400 h-5 w-5" />
                {t("p0_blocker_tracker")}
              </h3>
              <p className="text-fg-muted mt-1 text-xs">{t("blocker_tracker_desc")}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="text-fg-muted absolute top-2.5 left-3 h-4 w-4" />
                <input
                  type="text"
                  placeholder={t("search_blockers")}
                  value={p0Search}
                  onChange={(e) => setP0Search(e.target.value)}
                  className="focus:border-brand-500 focus:ring-brand-500 placeholder-fg-muted rounded-md border border-white/10 bg-neutral-950/80 py-2 pr-4 pl-9 text-xs text-white transition-all duration-200 focus:ring-1 focus:outline-none"
                />
              </div>
              <div className="flex rounded-lg border border-white/10 bg-neutral-950/80 p-1">
                <button
                  onClick={() => setP0Filter("all")}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                    p0Filter === "all"
                      ? "bg-brand-500/20 text-brand-300 shadow-[0_0_10px_rgba(168,85,247,0.25)]"
                      : "text-fg-muted hover:text-fg-primary",
                  )}
                >
                  {t("all")}
                </button>
                <button
                  onClick={() => setP0Filter("open")}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                    p0Filter === "open"
                      ? "bg-brand-500/20 text-brand-300 shadow-[0_0_10px_rgba(168,85,247,0.25)]"
                      : "text-fg-muted hover:text-fg-primary",
                  )}
                >
                  {t("open")}
                </button>
                <button
                  onClick={() => setP0Filter("resolved")}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                    p0Filter === "resolved"
                      ? "bg-brand-500/20 text-brand-300 shadow-[0_0_10px_rgba(168,85,247,0.25)]"
                      : "text-fg-muted hover:text-fg-primary",
                  )}
                >
                  {t("resolved")}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-2 divide-y divide-white/5">
            {filteredP0Blockers.length > 0 ? (
              filteredP0Blockers.map((item) => {
                const isResolved = item.status === "resolved";
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 px-2 py-4 transition-colors duration-200 hover:bg-white/5"
                  >
                    <div className="mt-1">
                      {isResolved ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-md border border-rose-500/50 bg-rose-500/5">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-fg-muted font-mono text-xs">{item.id}</span>
                        <h4
                          className={cn(
                            "text-sm font-semibold text-white",
                            isResolved && "text-fg-muted line-through",
                          )}
                        >
                          {item.title}
                        </h4>
                        <span className="text-fg-secondary rounded-full border border-white/5 bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold uppercase">
                          {item.category}
                        </span>
                        {!isResolved && (
                          <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
                            {t("open")}
                          </span>
                        )}
                      </div>
                      <div className="text-fg-muted flex flex-wrap items-center gap-4 font-mono text-xs">
                        <span className="flex items-center gap-1">
                          <ExternalLink className="h-3.5 w-3.5" />
                          {t("reported_by_models", { count: item.model_count })}
                        </span>
                        {item.effort && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {t("est_effort", { effort: item.effort })}
                          </span>
                        )}
                        <span>{t("first_reported", { date: item.first_reported })}</span>
                        {item.resolved_date && (
                          <span className="font-semibold text-emerald-400">
                            {t("resolved_label", { date: item.resolved_date })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-fg-muted py-8 text-center text-sm">{t("no_blockers")}</div>
            )}
          </div>
        </div>

        {/* War Room: Soft Launch Monitoring Card */}
        <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-6 shadow-md backdrop-blur-xl">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-md flex items-center gap-2 font-semibold text-white">
                <Database className="h-5 w-5 animate-pulse text-cyan-400" />
                {t("war_room_title")}
              </h3>
              <p className="text-fg-muted mt-1 text-xs">{t("war_room_desc")}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Production Links */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold tracking-wider text-white uppercase">
                {t("analytics")}
              </h4>
              <div className="grid gap-3">
                <a
                  href="https://vercel.com/quantummatrixcore-lab/alparai-com/analytics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:border-brand-500/30 flex items-center justify-between rounded-lg border border-white/5 bg-neutral-950/40 p-3 transition-all duration-200 hover:bg-neutral-950/60"
                >
                  <span className="text-xs font-medium text-white">{t("vercel_monitoring")}</span>
                  <ExternalLink className="text-fg-muted h-4 w-4" />
                </a>
                <a
                  href="https://supabase.com/dashboard/project/azszpzyvxjduhemkjsdh/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:border-brand-500/30 flex items-center justify-between rounded-lg border border-white/5 bg-neutral-950/40 p-3 transition-all duration-200 hover:bg-neutral-950/60"
                >
                  <span className="text-xs font-medium text-white">{t("supabase_monitoring")}</span>
                  <ExternalLink className="text-fg-muted h-4 w-4" />
                </a>
                <a
                  href="https://sentry.io/organizations/quantummatrixcore/projects/alpar-ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:border-brand-500/30 flex items-center justify-between rounded-lg border border-white/5 bg-neutral-950/40 p-3 transition-all duration-200 hover:bg-neutral-950/60"
                >
                  <span className="text-xs font-medium text-white">{t("sentry_monitoring")}</span>
                  <ExternalLink className="text-fg-muted h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Edge Rate Limiting Parameters */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold tracking-wider text-white uppercase">
                {t("active_rate_limits")}
              </h4>
              <div className="grid gap-3">
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-neutral-950/40 p-3">
                  <span className="text-fg-secondary text-xs">{t("incident_rate_limit")}</span>
                  <span className="rounded border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                    {t("edge")}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-neutral-950/40 p-3">
                  <span className="text-fg-secondary text-xs">{t("comment_rate_limit")}</span>
                  <span className="rounded border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                    {t("edge")}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-neutral-950/40 p-3">
                  <span className="text-fg-secondary text-xs">{t("affected_rate_limit")}</span>
                  <span className="rounded border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                    {t("edge")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

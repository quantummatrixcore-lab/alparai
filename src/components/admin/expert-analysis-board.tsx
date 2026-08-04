"use client";

import { useState, useEffect } from "react";
import { EXPERT_PERSONAS, type ExpertPersona } from "@/lib/config/expert-personas";
import {
  runExpertAnalysisAction,
  type ExpertAnalysisReport,
} from "@/actions/admin/expert-analysis";
import {
  Users,
  Sparkles,
  Brain,
  ShieldAlert,
  Rocket,
  DollarSign,
  Scale,
  Eye,
  Radio,
  Share2,
  Loader2,
  CheckCircle2,
  Bot,
  Clock,
  Play,
} from "lucide-react";
import { useTranslations } from "next-intl";

const ICON_MAP: Record<string, React.ReactNode> = {
  "ai-ecosystem-architect": <Brain className="h-6 w-6 text-purple-400" />,
  "silicon-valley-startup-team": <Rocket className="h-6 w-6 text-amber-400" />,
  "vc-angel-investor": <DollarSign className="h-6 w-6 text-emerald-400" />,
  "advisory-board": <Users className="h-6 w-6 text-blue-400" />,
  "growth-gtm-hacker": <Sparkles className="h-6 w-6 text-pink-400" />,
  "regulatory-legal-assessor": <Scale className="h-6 w-6 text-cyan-400" />,
  "futurist-strategist": <Eye className="h-6 w-6 text-indigo-400" />,
  "red-team-security": <ShieldAlert className="h-6 w-6 text-rose-400" />,
  "osint-analyst": <Radio className="h-6 w-6 text-yellow-400" />,
  "social-media-viral-strategist": <Share2 className="h-6 w-6 text-teal-400" />,
};

export function ExpertAnalysisBoard() {
  const t = useTranslations("admin");
  const [mounted, setMounted] = useState(false);
  const [reports, setReports] = useState<Record<string, ExpertAnalysisReport>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRunSingle = async (expertId: string) => {
    setLoadingMap((prev) => ({ ...prev, [expertId]: true }));
    try {
      const report = await runExpertAnalysisAction(expertId);
      setReports((prev) => ({ ...prev, [expertId]: report }));
    } catch (err) {
      console.error(`Failed to analyze expert ${expertId}:`, err);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [expertId]: false }));
    }
  };

  const handleRunAll = async () => {
    setIsBatchRunning(true);
    const initialLoading: Record<string, boolean> = {};
    EXPERT_PERSONAS.forEach((p) => {
      initialLoading[p.id] = true;
    });
    setLoadingMap(initialLoading);

    try {
      const results = await Promise.all(
        EXPERT_PERSONAS.map(async (persona) => {
          try {
            const report = await runExpertAnalysisAction(persona.id);
            return { expertId: persona.id, report };
          } catch {
            return null;
          }
        }),
      );

      const newReports: Record<string, ExpertAnalysisReport> = { ...reports };
      results.forEach((res) => {
        if (res) {
          newReports[res.expertId] = res.report;
        }
      });
      setReports(newReports);
    } finally {
      setLoadingMap({});
      setIsBatchRunning(false);
    }
  };

  return (
    <div className="space-y-8 p-6 text-white" suppressHydrationWarning>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-white">
            <Users className="h-8 w-8 text-cyan-400" />
            <span>{t("multi_perspective_expert_board_analysis")}</span>
          </h1>
          <p className="mt-2 text-slate-400">
            <span>{t("simulated_10_persona_c_suite_specialist_")}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunAll}
          disabled={isBatchRunning}
          className="bg-brand-500 hover:bg-brand-600 shadow-brand-500/20 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition duration-200 active:scale-95 disabled:opacity-50"
        >
          {isBatchRunning ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <Play className="h-4 w-4 fill-current text-white" />
          )}
          <span>{isBatchRunning ? "Analyzing All..." : "Run All 10 Expert Analyses"}</span>
        </button>
      </div>

      {/* Grid of 10 Expert Personas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {EXPERT_PERSONAS.map((persona: ExpertPersona) => {
          const isLoading = !!loadingMap[persona.id];
          const report = reports[persona.id];

          return (
            <div
              key={persona.id}
              className="flex flex-col justify-between space-y-4 rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm transition hover:border-slate-700 hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-2.5">
                      {ICON_MAP[persona.id] ?? <Brain className="h-6 w-6 text-cyan-400" />}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        <span>{persona.name}</span>
                      </h3>
                      <p className="font-mono text-xs text-slate-400">
                        <span>{persona.roleTitle}</span>
                      </p>
                    </div>
                  </div>
                  {report && (
                    <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> Ready
                    </span>
                  )}
                </div>

                <p className="line-clamp-2 text-xs text-slate-300">
                  <span>{persona.focusArea}</span>
                </p>

                {report && (
                  <div className="mt-3 space-y-2 rounded-lg border border-slate-800 bg-slate-950/80 p-3.5 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5 font-mono text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 text-cyan-300">
                        <Bot className="h-3 w-3" /> {report.modelUsed}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {mounted &&
                          new Date(report.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                      </span>
                    </div>
                    <p className="font-sans leading-relaxed whitespace-pre-line text-slate-200">
                      {report.critique}
                    </p>

                    {/* Dynamic Percentage Statistic Nodes (Confidence Score) */}
                    <div className="mt-3 border-t border-slate-800/60 pt-3">
                      <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-slate-400">
                        <span>{t("confidence_score", { defaultValue: "Confidence Score" })}</span>
                        <span className="font-bold text-emerald-400">
                          {report.confidenceScore}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-out"
                          style={{ width: `${report.confidenceScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                <span className="rounded border border-cyan-800/60 bg-cyan-950/60 px-2 py-0.5 font-mono text-[11px] text-cyan-400">
                  <span>{t("chain")}</span> <span>{persona.capabilityDomain}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleRunSingle(persona.id)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 rounded-md bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-cyan-500 active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  <span>{isLoading ? "Analyzing..." : "Trigger Analysis"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

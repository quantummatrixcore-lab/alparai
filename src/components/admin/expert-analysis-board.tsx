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
  "ai-ecosystem-architect": <Brain className="text-brand-400 h-6 w-6" />,
  "silicon-valley-startup-team": <Rocket className="text-warning-400 h-6 w-6" />,
  "vc-angel-investor": <DollarSign className="text-success-400 h-6 w-6" />,
  "advisory-board": <Users className="text-brand-400 h-6 w-6" />,
  "growth-gtm-hacker": <Sparkles className="h-6 w-6 text-accent-400" />,
  "regulatory-legal-assessor": <Scale className="text-accent-400 h-6 w-6" />,
  "futurist-strategist": <Eye className="text-brand-400 h-6 w-6" />,
  "red-team-security": <ShieldAlert className="text-danger-400 h-6 w-6" />,
  "osint-analyst": <Radio className="text-warning-400 h-6 w-6" />,
  "social-media-viral-strategist": <Share2 className="text-accent-400 h-6 w-6" />,
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
            <Users className="text-accent-400 h-8 w-8" />
            <span>{t("multi_perspective_expert_board_analysis")}</span>
          </h1>
          <p className="text-fg-muted mt-2">
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
              className="border-border-subtle bg-bg-elevated/80 hover:border-border-strong flex flex-col justify-between space-y-4 rounded-xl border p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="border-border-strong bg-bg-secondary rounded-lg border p-2.5">
                      {ICON_MAP[persona.id] ?? <Brain className="text-accent-400 h-6 w-6" />}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        <span>{persona.name}</span>
                      </h3>
                      <p className="text-fg-muted font-mono text-xs">
                        <span>{persona.roleTitle}</span>
                      </p>
                    </div>
                  </div>
                  {report && (
                    <span className="border-success-500/30 bg-success-500/10 text-success-400 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold">
                      <CheckCircle2 className="h-3 w-3" /> Ready
                    </span>
                  )}
                </div>

                <p className="text-fg-secondary line-clamp-2 text-xs">
                  <span>{persona.focusArea}</span>
                </p>

                {report && (
                  <div className="bg-bg-tertiary/80 border-border-subtle mt-3 space-y-3 rounded-xl border p-4 text-xs backdrop-blur-xl">
                    <div className="text-fg-muted border-border-subtle flex items-center justify-between border-b pb-2 font-mono text-[10px]">
                      <span className="text-accent-300 flex items-center gap-1 font-bold">
                        <Bot className="text-accent-400 h-3.5 w-3.5" /> {report.modelUsed}
                      </span>
                      <span className="text-fg-muted flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {mounted &&
                          new Date(report.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                      </span>
                    </div>

                    <p className="text-fg-primary font-sans text-xs leading-relaxed whitespace-pre-line">
                      {report.critique}
                    </p>

                    {/* Key Findings section */}
                    {report.keyFindings && report.keyFindings.length > 0 && (
                      <div className="border-brand-500/20 space-y-1.5 rounded-lg border bg-brand-900/20 p-2.5">
                        <div className="text-brand-300 font-mono text-[10px] font-bold tracking-wider uppercase">
                          Strategic Findings
                        </div>
                        <ul className="text-brand-200/90 list-disc space-y-1 pl-3.5 text-[11px]">
                          {report.keyFindings.map((finding, idx) => (
                            <li key={idx}>{finding}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommended Actions section */}
                    {report.recommendedActions && report.recommendedActions.length > 0 && (
                      <div className="border-success-500/20 space-y-1.5 rounded-lg border bg-success-900/20 p-2.5">
                        <div className="text-success-300 font-mono text-[10px] font-bold tracking-wider uppercase">
                          Recommended Actions
                        </div>
                        <ul className="text-success-200/90 list-disc space-y-1 pl-3.5 text-[11px]">
                          {report.recommendedActions.map((action, idx) => (
                            <li key={idx}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Dynamic Percentage Statistic Nodes (Confidence Score) */}
                    <div className="border-border-subtle mt-3 border-t pt-3">
                      <div className="text-fg-muted mb-1 flex items-center justify-between font-mono text-[10px]">
                        <span>{t("confidence_score", { defaultValue: "Confidence Score" })}</span>
                        <span className="text-success-400 font-bold">
                          {report.confidenceScore}%
                        </span>
                      </div>
                      <div className="bg-bg-secondary h-1.5 w-full overflow-hidden rounded-full">
                        <div
                          className="to-success-400 h-full rounded-full bg-gradient-to-r from-brand-500 transition-all duration-1000 ease-out"
                          style={{ width: `${report.confidenceScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-border-subtle/80 flex items-center justify-between border-t pt-3">
                <span className="border-accent-800/60 text-accent-400 rounded border bg-accent-900/60 px-2 py-0.5 font-mono text-[11px]">
                  <span>{t("chain")}</span> <span>{persona.capabilityDomain}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleRunSingle(persona.id)}
                  disabled={isLoading}
                  className="bg-accent-600 hover:bg-accent-500 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-white transition active:scale-95 disabled:opacity-50"
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

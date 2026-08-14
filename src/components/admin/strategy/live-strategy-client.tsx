"use client";

import React from "react";
import { Bot, Loader2, Target, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface LiveStrategyClientProps {
  context: {
    strengths: number;
    weaknesses: number;
    opportunities: number;
    threats: number;
    highRisks: number;
    activeRisks: number;
    doneMilestones: number;
    totalMilestones: number;
  };
}

interface LiveStrategyResult {
  health_score: number;
  executive_summary: string;
  strategic_gaps: string[] | string;
  recommendations: string[] | string;
}

export function LiveStrategyClient({ context }: LiveStrategyClientProps) {
  const t = useTranslations("admin");
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [result, setResult] = React.useState<LiveStrategyResult | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/admin/live-strategy", {
        cache: "no-store",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context }),
        credentials: "include",
      });

      let resData;
      try {
        resData = await res.json();
      } catch (_e) {
        console.error("Ignored error:", _e);
      }

      if (!res.ok) {
        throw new Error(resData?.message || "Sunucu hatası");
      }

      if (resData?.success && resData?.data) {
        setResult(resData.data as LiveStrategyResult);
        toast.success("AI Strategy Analysis Complete");
      } else {
        toast.error(resData?.error || "Failed to run analysis");
      }
    } catch (_err) {
      toast.error("An error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success-400";
    if (score >= 60) return "text-warning-400";
    return "text-danger-400";
  };

  return (
    <div className="mt-8">
      {!result ? (
        <div className="flex justify-center">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="group border-brand-500/20 bg-brand-500/10 text-brand-300 hover:bg-brand-500/20 hover:text-brand-200 relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl border px-8 py-4 font-bold transition-all"
          >
            {isAnalyzing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Bot className="h-5 w-5 transition-transform group-hover:scale-110" />
            )}
            <span>
              {isAnalyzing ? "Yapay Zeka Analiz Ediyor..." : "Yapay Zeka Analizini Başlat (Canlı)"}
            </span>
            <div className="from-brand-500/0 via-brand-500/10 to-brand-500/0 absolute inset-0 -z-10 bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        </div>
      ) : (
        <div className="border-brand-500/20 bg-brand-500/5 relative overflow-hidden rounded-2xl border p-6 backdrop-blur-sm">
          <div className="bg-brand-500/10 pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <Bot className="text-brand-400 h-6 w-6" />
                {t("canl_ai_strateji_raporu")}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-fg-muted font-mono text-sm">{t("sa_lik_skoru")}</span>
                <span
                  className={cn("text-2xl font-black", getScoreColor(result.health_score || 0))}
                >
                  {result.health_score || "?"}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-fg-secondary mb-2 text-xs font-semibold tracking-wider uppercase">
                  {t("y_netici_zeti")}
                </h3>
                <p className="text-sm leading-relaxed text-white/80">{result.executive_summary}</p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="border-danger-500/20 bg-danger-500/5 rounded-xl border p-4">
                  <h3 className="text-danger-400 mb-3 flex items-center gap-2 font-semibold">
                    <AlertTriangle className="h-4 w-4" /> {t("stratejik_bo_luklar")}
                  </h3>
                  <ul className="text-fg-primary list-inside list-disc space-y-2 text-sm">
                    {Array.isArray(result.strategic_gaps) ? (
                      result.strategic_gaps.map((gap: string, i: number) => <li key={i}>{gap}</li>)
                    ) : (
                      <li>{result.strategic_gaps as string}</li>
                    )}
                  </ul>
                </div>

                <div className="border-success-500/20 bg-success-500/5 rounded-xl border p-4">
                  <h3 className="text-success-400 mb-3 flex items-center gap-2 font-semibold">
                    <Target className="h-4 w-4" /> {t("tavsiyeler")}
                  </h3>
                  <ul className="text-fg-primary list-inside list-disc space-y-2 text-sm">
                    {Array.isArray(result.recommendations) ? (
                      result.recommendations.map((rec: string, i: number) => <li key={i}>{rec}</li>)
                    ) : (
                      <li>{result.recommendations as string}</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setResult(null)}
                className="text-fg-muted text-xs transition-colors hover:text-white"
              >
                {t("kapat")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

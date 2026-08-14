"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Code2, Play, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  analyzeCodeWithBlackbox,
  type CodeAnalysisResult,
} from "@/actions/admin/blackbox-analysis";

export function BlackboxCodeAnalysisSection() {
  const t = useTranslations("admin");
  const [filePath, setFilePath] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CodeAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await analyzeCodeWithBlackbox(filePath, code);
      setResult(res);
    } catch {
      setResult({
        analysis: "Failed to analyze code snippet.",
        suggestions: ["Please try again."],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-border-subtle bg-bg-secondary space-y-4 rounded-2xl border p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Code2 className="h-6 w-6 text-emerald-400" />
          <h2 className="text-fg-primary text-xl font-bold">{t("blackbox_analysis_title")}</h2>
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
          {t("blackbox_engine_active")}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-fg-muted mb-1 block text-xs font-medium uppercase">
            {t("blackbox_file_path")}
          </label>
          <input
            type="text"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            placeholder={t("blackbox_file_placeholder")}
            className="border-border-subtle bg-bg-tertiary text-fg-primary placeholder-fg-muted/60 w-full rounded-xl border px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-fg-muted mb-1 block text-xs font-medium uppercase">
            {t("blackbox_code_snippet")}
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={6}
            placeholder={t("blackbox_code_placeholder")}
            className="border-border-subtle bg-bg-tertiary text-fg-primary placeholder-fg-muted/60 w-full rounded-xl border p-4 font-mono text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !code.trim()}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> {t("blackbox_analyzing")}
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> {t("blackbox_run_analysis")}
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="border-border-subtle bg-bg-tertiary mt-6 space-y-4 rounded-xl border p-4">
          <div className="space-y-2">
            <h3 className="text-fg-primary flex items-center gap-2 text-sm font-bold uppercase">
              <AlertCircle className="h-4 w-4 text-emerald-400" /> {t("blackbox_exec_analysis")}
            </h3>
            <p className="text-fg-primary text-sm whitespace-pre-wrap">{result.analysis}</p>
          </div>

          {result.suggestions && result.suggestions.length > 0 && (
            <div className="border-border-subtle space-y-2 border-t pt-4">
              <h3 className="text-fg-muted text-xs font-bold uppercase">
                Actionable Recommendations
              </h3>
              <ul className="space-y-2">
                {result.suggestions.map((item, idx) => (
                  <li key={idx} className="text-fg-primary flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

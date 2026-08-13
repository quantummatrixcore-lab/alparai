"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { analyzeCompliance } from "@/actions/analyze-compliance";
import type { ComplianceResult } from "@/actions/analyze-compliance";

export default function AnalyzerPage() {
  const t = useTranslations("analyzer");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComplianceResult | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await analyzeCompliance(text);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-950 p-8 text-white">
      <div className="w-full max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">{t("title")}</h1>
          <p className="mt-2 text-zinc-400">{t("description")}</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl backdrop-blur-md">
          <textarea
            className="h-64 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-zinc-300 transition-all focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
            placeholder={t("placeholder")}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "..." : t("analyze_btn")}
            </button>
          </div>
        </div>

        {result && (
          <div className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl backdrop-blur-md">
            <h2 className="text-2xl font-semibold text-zinc-100">{t("result_title")}</h2>

            <div className="flex items-center space-x-4">
              <span className="font-medium text-zinc-400">{t("score")}:</span>
              <span
                className={`text-3xl font-bold ${result.score > 70 ? "text-green-500" : result.score > 40 ? "text-yellow-500" : "text-red-500"}`}
              >
                {result.score}/100
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-lg font-medium text-red-400">{t("risks")}</h3>
                {result.risks.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1 text-zinc-300">
                    {result.risks.map((risk, i) => (
                      <li key={i}>{risk}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-zinc-500">-</p>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium text-blue-400">{t("recommendations")}</h3>
                {result.recommendations.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1 text-zinc-300">
                    {result.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-zinc-500">-</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

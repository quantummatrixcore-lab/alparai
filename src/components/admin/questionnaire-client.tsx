"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { exportRunToMarkdown } from "@/actions/strategy-questionnaire";
import { toast } from "sonner";
import {
  ClipboardList,
  Play,
  RotateCcw,
  Clock,
  Cpu,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface RunRow {
  id: string;
  status: string;
  model_ids: string[];
  total_questions: number;
  total_answers: number;
  started_at: string;
  completed_at: string | null;
}

interface AnswerRow {
  id: string;
  run_id: string;
  model_id: string;
  model_name: string;
  question_index: number;
  question_id: string;
  section: string;
  answer_text: string | null;
  error_message: string | null;
  latency_ms: number | null;
  tokens_used: number | null;
  created_at: string;
}

interface ModelInfo {
  id: string;
  label: string;
  tier: string;
}

interface I18nStrings {
  runButton: string;
  runAgainButton: string;
  running: string;
  history: string;
  tableQuestion: string;
  tableModel: string;
  tableAnswer: string;
  exportMd: string;
  noRuns: string;
  noAnswers: string;
  statusCompleted: string;
  statusFailed: string;
  statusRunning: string;
  tokens: string;
  latency: string;
  selectAll: string;
  questionsCount: string;
  modelsLabel: string;
  close: string;
  error: string;
  totalRuns: string;
}

export function QuestionnaireClient({
  runs,
  answers,
  latestRunId: _latestRunId,
  models,
  locale,
  i18n,
}: {
  runs: RunRow[];
  answers: AnswerRow[];
  latestRunId: string | null;
  models: ModelInfo[];
  locale: string;
  i18n: I18nStrings;
}) {
  const t = useTranslations("admin");
  const [running, setRunning] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>(models.map((m) => m.id));
  const [expandedAnswer, setExpandedAnswer] = useState<{
    questionId: string;
    modelName: string;
  } | null>(null);

  const isTurkish = locale === "tr";

  async function handleRun() {
    setRunning(true);
    try {
      const response = await fetch("/api/admin/strategy-questionnaire", {
        cache: "no-store",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedModels }),
        credentials: "include",
      });

      let res;
      try {
        res = await response.json();
      } catch (_e) {
        throw new Error(`API yanıtı okunamadı (${response.status})`);
      }

      if (!res.ok) {
        alert(`${i18n.error}: ${res.error || "Unknown"}`);
      } else {
        toast.success(isTurkish ? "Anket başlatıldı!" : "Questionnaire started!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata oluştu");
    } finally {
      setRunning(false);
    }
  }

  async function handleExport(runId: string) {
    setExporting(runId);
    try {
      const res = await exportRunToMarkdown(runId);
      if (res.ok) {
        toast.success(
          isTurkish
            ? "Rapor başarıyla markdown dosyasına eklendi!"
            : "Report successfully appended to markdown file!",
        );
      } else {
        toast.error(`${i18n.error}: ${res.error || "Unknown"}`);
      }
    } catch {
      toast.error(isTurkish ? "Dışa aktarım başarısız oldu" : "Export failed");
    } finally {
      setExporting(null);
    }
  }

  function getAgreementLevel(qId: string): { level: "high" | "medium" | "low"; ratio: number } {
    const qAnswers = answers.filter((a) => a.question_id === qId && a.answer_text);
    if (qAnswers.length < 2) return { level: "low", ratio: 0 };

    const clean = (t: string) => {
      const firstSentence = t.split(/[.!?]/)[0] || "";
      return new Set(
        firstSentence
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, "")
          .split(/\s+/)
          .filter(Boolean),
      );
    };

    const sets = qAnswers.map((a) => clean(a.answer_text!));
    let totalSim = 0;
    let pairs = 0;

    for (let i = 0; i < sets.length; i++) {
      for (let j = i + 1; j < sets.length; j++) {
        const s1 = sets[i]!;
        const s2 = sets[j]!;
        const intersection = new Set([...s1].filter((x) => s2.has(x)));
        const union = new Set([...s1, ...s2]);
        if (union.size > 0) {
          totalSim += intersection.size / union.size;
        }
        pairs++;
      }
    }

    const avgSim = pairs > 0 ? totalSim / pairs : 0;
    let level: "high" | "medium" | "low" = "low";
    if (avgSim > 0.45) level = "high";
    else if (avgSim > 0.25) level = "medium";

    return { level, ratio: avgSim };
  }

  function toggleModel(id: string) {
    setSelectedModels((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  }

  const evaluatedModels = Array.from(new Set(answers.map((a) => a.model_name)));

  const answersMap: Record<string, Record<string, AnswerRow>> = {};
  for (const ans of answers) {
    const qMap = answersMap[ans.question_id] ?? {};
    qMap[ans.model_name] = ans;
    answersMap[ans.question_id] = qMap;
  }

  return (
    <div className="space-y-6">
      {runs.length === 0 && (
        <div className="bg-bg-secondary border-border-subtle rounded-xl border p-8 text-center">
          <ClipboardList className="text-fg-muted mx-auto mb-3 h-10 w-10" />
          <p className="text-fg-muted text-sm">{i18n.noRuns}</p>
        </div>
      )}

      <div className="bg-bg-secondary border-border-subtle rounded-xl border p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">{i18n.modelsLabel}</h3>
            <p className="text-fg-muted mt-0.5 text-xs">{i18n.selectAll}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedModels(models.map((m) => m.id))}
              className="text-fg-muted text-xs underline underline-offset-2 hover:text-white"
            >
              {isTurkish ? "Tümünü Seç" : "Select All"}
            </button>
            <button
              onClick={() => setSelectedModels([])}
              className="text-fg-muted text-xs underline underline-offset-2 hover:text-white"
            >
              {isTurkish ? "Tümünü Kaldır" : "Clear"}
            </button>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {models.map((m) => (
            <button
              key={m.id}
              onClick={() => toggleModel(m.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                selectedModels.includes(m.id)
                  ? "bg-brand-500/20 text-brand-300 ring-brand-500/40 ring-1"
                  : "bg-bg-tertiary text-fg-muted ring-border-subtle ring-1 hover:text-white"
              }`}
            >
              <Cpu className="h-3 w-3" />
              {m.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleRun}
          disabled={running || selectedModels.length === 0}
          className="bg-brand-500 hover:bg-brand-600 disabled:bg-bg-tertiary disabled:text-fg-muted text-bg-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black transition-all disabled:cursor-not-allowed"
        >
          {running ? (
            <RotateCcw className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
          {running ? i18n.running : runs.length === 0 ? i18n.runButton : i18n.runAgainButton}
        </button>
      </div>

      {runs.length > 0 && (
        <div className="bg-bg-secondary border-border-subtle rounded-xl border p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              {i18n.history} ({runs.length})
            </h3>
            <span className="text-fg-muted text-xs">
              {i18n.totalRuns}: {runs.length}
            </span>
          </div>
          <div className="space-y-2">
            {runs.slice(0, 10).map((run) => (
              <div
                key={run.id}
                className="bg-bg-tertiary/30 border-border-subtle flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {run.status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : run.status === "failed" ? (
                    <AlertCircle className="h-4 w-4 text-rose-400" />
                  ) : (
                    <RotateCcw className="h-4 w-4 animate-spin text-amber-400" />
                  )}
                  <div>
                    <span className="font-mono text-xs text-white">
                      {new Date(run.started_at).toLocaleString(isTurkish ? "tr-TR" : "en-US")}
                    </span>
                    <span className="text-fg-muted ml-3 text-xs">
                      {run.total_answers}/{run.total_questions} {t("answers")}
                    </span>
                    <span className="text-fg-muted ml-3 text-xs">
                      {(run.model_ids || []).length} {t("models")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {run.status === "completed" && (
                    <button
                      onClick={() => handleExport(run.id)}
                      disabled={exporting !== null}
                      className="bg-bg-secondary hover:bg-bg-tertiary border-border-subtle inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold text-white transition-all disabled:opacity-50"
                    >
                      <ClipboardList className="h-3.5 w-3.5" />
                      {exporting === run.id
                        ? isTurkish
                          ? "Dışa Aktarılıyor..."
                          : "Exporting..."
                        : i18n.exportMd}
                    </button>
                  )}
                  <Badge
                    variant={
                      run.status === "completed"
                        ? "success"
                        : run.status === "failed"
                          ? "danger"
                          : "default"
                    }
                    className="text-[10px]"
                  >
                    {run.status === "completed"
                      ? i18n.statusCompleted
                      : run.status === "failed"
                        ? i18n.statusFailed
                        : i18n.statusRunning}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {evaluatedModels.length > 0 && (
        <div className="bg-bg-secondary border-border-subtle overflow-hidden rounded-xl border">
          <div className="border-border-subtle border-b px-5 py-4">
            <h3 className="text-sm font-bold text-white">{i18n.tableAnswer}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-bg-tertiary/50 border-border-subtle text-fg-muted border-b text-[11px] font-bold tracking-wider uppercase">
                  <th className="min-w-[280px] px-5 py-3">{i18n.tableQuestion}</th>
                  {evaluatedModels.map((m) => (
                    <th key={m} className="min-w-[220px] px-5 py-3">
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-border-subtle divide-y">
                {Array.from(new Set(answers.map((a) => a.question_id))).map((qId) => {
                  const section = answers.find((a) => a.question_id === qId)?.section;
                  return (
                    <tr key={qId} className="hover:bg-bg-tertiary/20 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-1.5">
                          <Badge
                            variant="outline"
                            className="font-mono text-[10px] tracking-wider uppercase"
                          >
                            {qId} · {section}
                          </Badge>
                          {(() => {
                            const { level, ratio } = getAgreementLevel(qId);
                            if (ratio === 0) return null;
                            return (
                              <Badge
                                variant="outline"
                                className={
                                  level === "high"
                                    ? "border-emerald-500/20 bg-emerald-500/10 text-[9px] font-bold text-emerald-400"
                                    : level === "medium"
                                      ? "border-amber-500/20 bg-amber-500/10 text-[9px] font-bold text-amber-400"
                                      : "border-blue-500/20 bg-blue-500/10 text-[9px] font-bold text-blue-400"
                                }
                              >
                                {isTurkish ? "Fikir Birliği: " : "Agreement: "}
                                {level === "high"
                                  ? isTurkish
                                    ? "Yüksek"
                                    : "High"
                                  : level === "medium"
                                    ? isTurkish
                                      ? "Orta"
                                      : "Medium"
                                    : isTurkish
                                      ? "Bölünmüş / Düşük"
                                      : "Split / Low"}
                              </Badge>
                            );
                          })()}
                        </div>
                      </td>
                      {evaluatedModels.map((modelName) => {
                        const ans = answersMap[qId]?.[modelName];
                        if (!ans) {
                          return (
                            <td
                              key={modelName}
                              className="text-fg-muted px-5 py-3 text-center text-xs italic"
                            >
                              -
                            </td>
                          );
                        }
                        const isExpanded =
                          expandedAnswer?.questionId === qId &&
                          expandedAnswer?.modelName === modelName;
                        return (
                          <td key={modelName} className="px-5 py-3 align-top">
                            {ans.error_message ? (
                              <span className="text-xs text-rose-400">
                                {i18n.error}: {ans.error_message}
                              </span>
                            ) : (
                              <div>
                                <p
                                  className={`text-xs leading-relaxed text-white ${isExpanded ? "" : "line-clamp-3"}`}
                                >
                                  {ans.answer_text}
                                </p>
                                <button
                                  onClick={() =>
                                    setExpandedAnswer(
                                      isExpanded ? null : { questionId: qId, modelName },
                                    )
                                  }
                                  className="text-brand-400 hover:text-brand-300 mt-1.5 text-[11px] font-bold hover:underline"
                                >
                                  {isExpanded
                                    ? isTurkish
                                      ? "Daralt"
                                      : "Collapse"
                                    : isTurkish
                                      ? "Devamını Oku →"
                                      : "Read More →"}
                                </button>
                                <div className="text-fg-muted mt-2 flex items-center gap-3 border-t border-white/5 pt-2 font-mono text-[10px]">
                                  {ans.latency_ms != null && (
                                    <span className="inline-flex items-center gap-1">
                                      <Clock className="h-3 w-3" /> {ans.latency_ms}ms
                                    </span>
                                  )}
                                  {ans.tokens_used != null && (
                                    <span className="inline-flex items-center gap-1">
                                      <Cpu className="h-3 w-3" /> {ans.tokens_used}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

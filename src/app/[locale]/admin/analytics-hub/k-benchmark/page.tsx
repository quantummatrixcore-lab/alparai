import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireModerator } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { Star } from "@phosphor-icons/react/dist/ssr";
import { Award, BarChart3 } from "lucide-react";
import Image from "next/image";
import { TrendMetricCard } from "@/components/admin/metric-card";
import { BenchTrRunButton } from "@/components/admin/bench-tr-run-button";
import { AnalyticsHubTabs } from "@/components/admin/analytics-hub-tabs";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";

interface BenchTrRow {
  id: string;
  model_name: string;
  provider_slug: string;
  tr_grammar_score: number;
  tr_bias_score: number;
  tr_factuality_pct: number;
  eval_dataset_ver: string;
  created_at: string;
}

function getProviderLogo(providerName: string): string {
  if (!providerName) return "/logos/providers/other.svg";
  const name = providerName.toLowerCase();
  if (name.includes("openai")) return "/logos/providers/openai.svg";
  if (name.includes("anthropic")) return "/logos/providers/anthropic.svg";
  if (name.includes("google")) return "/logos/providers/google.svg";
  if (name.includes("deepseek")) return "/logos/providers/deepseek.svg";
  if (name.includes("meta") || name.includes("facebook")) return "/logos/providers/meta.svg";
  if (name.includes("alibaba") || name.includes("qwen")) return "/logos/providers/alibaba.svg";
  if (name.includes("mistral")) return "/logos/providers/mistral.svg";
  if (name.includes("cohere")) return "/logos/providers/cohere.svg";
  if (name.includes("perplexity")) return "/logos/providers/perplexity.svg";
  return "/logos/providers/other.svg";
}

export default async function KBenchmarkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireModerator();
  const t = await getTranslations({ locale, namespace: "admin" });

  const supabase = await createServerClient();
  const { data: rawScores, error } = await supabase
    .from("k_model_scores")
    .select("*, ai_models:model_id(*, ai_providers:provider_id(*))")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching k_model_scores:", error);
  }

  const scores = rawScores && rawScores.length > 0 ? rawScores : [];
  const benchTrRows: BenchTrRow[] = [];

  return (
    <AdminContainer shell>
      <AnalyticsHubTabs />
      <AdminPageHeader title={t("kbench_title")} subtitle={t("kbench_subtitle")} />
      <div className="animate-in fade-in space-y-8 duration-500">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TrendMetricCard
            title={t("kb_total_models")}
            value={scores.length}
            icon={<Award className="h-4 w-4" />}
            trend="up"
            trendLabel={t("kb_trend_ratings")}
            accentColor="#f59e0b"
            sparkData={[...scores]
              .reverse()
              .slice(-10)
              .map((_, i) => ({ value: scores.length - Math.min(10, scores.length) + i + 1 }))}
            chartType="bar"
          />
          <TrendMetricCard
            title={t("kb_avg_score")}
            value={
              scores.length > 0
                ? `${(scores.reduce((a, s) => a + (s.score ?? 0), 0) / scores.length).toFixed(1)}`
                : "—"
            }
            icon={<BarChart3 className="h-4 w-4" />}
            trend="up"
            trendLabel={t("kb_trend_audit")}
            accentColor="#6366f1"
            sparkData={(() => {
              let currentSum = 0;
              const rev = [...scores].reverse();
              const calculated = [];
              for (let i = 0; i < rev.length; i++) {
                currentSum += rev[i]?.score ?? 0;
                calculated.push({ value: Number((currentSum / (i + 1)).toFixed(1)) });
              }
              return calculated.slice(-10);
            })()}
            chartType="line"
          />
        </div>

        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-300">
          <p className="mb-1 flex items-center gap-2 text-sm font-bold">{t("kbench_box_title")}</p>
          <p className="text-[11px] leading-relaxed">{t("kbench_box_desc")}</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/5 bg-zinc-900/40 ring-1 ring-white/10 backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white">
              <thead className="text-fg-muted bg-white/5 text-xs font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">{t("kbench_th_model")}</th>
                  <th className="px-6 py-4">{t("kbench_th_score")}</th>
                  <th className="px-6 py-4">{t("kbench_th_status")}</th>
                  <th className="px-6 py-4">{t("kbench_th_evaluated")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {scores.map((score) => {
                  const modelDisplayName =
                    ((score as Record<string, unknown>).model_name as string) ||
                    (
                      (score as Record<string, unknown>).ai_models as
                        { name?: string; model_id?: string } | undefined
                    )?.name ||
                    (
                      (score as Record<string, unknown>).ai_models as
                        { name?: string; model_id?: string } | undefined
                    )?.model_id ||
                    score.model_id ||
                    t("kbench_unknown_model");

                  return (
                    <tr key={score.id} className="transition-colors hover:bg-white/5">
                      <td className="px-6 py-4 font-mono text-xs text-white">
                        <div className="text-sm font-bold text-white">{modelDisplayName}</div>
                        <span className="mt-1 inline-flex items-center gap-1 rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                          {(() => {
                            const providerName =
                              ((score as Record<string, unknown>).provider_name as string) ||
                              (
                                (score as Record<string, unknown>).ai_models as
                                  { ai_providers?: { name?: string } } | undefined
                              )?.ai_providers?.name ||
                              "AI Provider";

                            return (
                              <>
                                <Image
                                  src={getProviderLogo(providerName)}
                                  alt={providerName}
                                  width={12}
                                  height={12}
                                  className="opacity-80"
                                />
                                {providerName}
                              </>
                            );
                          })()}
                        </span>
                      </td>
                      <td className="text-brand-400 px-6 py-4 font-mono text-lg font-bold">
                        <div className="flex items-center gap-1">
                          {score.score !== null ? score.score : t("kbench_score_empty")}
                          <Star weight="fill" className="h-4 w-4 text-amber-400" />
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize">
                        {score.status || t("kbench_evaluated")}
                      </td>
                      <td className="text-fg-muted px-6 py-4 font-mono text-xs">
                        {new Date(score.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-white">{t("benchtr_title")}</h2>
              <p className="text-fg-secondary mt-1 text-sm">{t("benchtr_subtitle")}</p>
            </div>
            <BenchTrRunButton />
          </div>

          <div className="overflow-hidden rounded-xl border border-white/5 bg-zinc-900/40 ring-1 ring-white/10 backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-white">
                <thead className="text-fg-muted bg-white/5 text-xs font-bold uppercase">
                  <tr>
                    <th className="px-6 py-4">{t("benchtr_th_model")}</th>
                    <th className="px-6 py-4">{t("benchtr_th_grammar")}</th>
                    <th className="px-6 py-4">{t("benchtr_th_bias")}</th>
                    <th className="px-6 py-4">{t("benchtr_th_factuality")}</th>
                    <th className="px-6 py-4">{t("kbench_th_evaluated")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {benchTrRows.map((row) => (
                    <tr key={row.id} className="transition-colors hover:bg-white/5">
                      <td className="px-6 py-4 font-mono text-xs text-white">
                        {row.model_name}
                        <br />
                        <span className="text-fg-muted mt-1 flex items-center gap-1">
                          <Image
                            src={getProviderLogo(row.provider_slug)}
                            alt={row.provider_slug}
                            width={12}
                            height={12}
                            className="opacity-80"
                          />
                          {row.provider_slug}
                        </span>
                      </td>
                      <td className="text-brand-400 px-6 py-4 font-mono text-sm font-bold">
                        {row.tr_grammar_score}
                      </td>
                      <td className="text-brand-400 px-6 py-4 font-mono text-sm font-bold">
                        {row.tr_bias_score}
                      </td>
                      <td className="text-brand-400 px-6 py-4 font-mono text-sm font-bold">
                        {row.tr_factuality_pct}%
                      </td>
                      <td className="text-fg-muted px-6 py-4 font-mono text-xs">
                        {new Date(row.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminContainer>
  );
}

export const metadata = {
  title: "ALPAR AI",
  description: "The trust infrastructure for AI accountability.",
};

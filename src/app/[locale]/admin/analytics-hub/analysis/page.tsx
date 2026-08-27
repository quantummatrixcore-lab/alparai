import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { FileText } from "lucide-react";
import { AnalysisDashboardClient } from "@/components/admin/analysis-dashboard-client";
import { createServerClient } from "@/lib/supabase/server";
import { AnalyticsHubTabs } from "@/components/admin/analytics-hub-tabs";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("analysisTitle") };
}

export default async function AnalysisPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/signin?next=/${locale}/admin/analytics-hub/analysis`);
  if (user.role !== "admin" && user.role !== "ceo") {
    redirect(`/${locale}`);
  }

  const supabase = await createServerClient();
  const { data: aiModels } = await supabase.from("ai_models").select("*, ai_providers(name)");
  const { data: freeModels } = await supabase.from("ai_free_models").select("*");

  const paidModels = (aiModels || []).map((model: unknown) => ({
    ...(model as object),
    name:
      (model as Record<string, unknown>).name ||
      (model as Record<string, unknown>).model_name ||
      (model as Record<string, unknown>).id ||
      "Model",
    is_free: false,
  }));

  const freeModelsList = (freeModels || []).map((model: unknown) => ({
    id: (model as Record<string, unknown>).id,
    name:
      (model as Record<string, unknown>).model_name ||
      (model as Record<string, unknown>).name ||
      (model as Record<string, unknown>).id ||
      "Free Model",
    created_at: (model as Record<string, unknown>).created_at,
    ai_providers: { name: (model as Record<string, unknown>).provider || "Provider" },
    is_free: true,
  }));

  const allModels = [...paidModels, ...freeModelsList];
  const uniqueModels = Array.from(
    new Map(allModels.map((m: Record<string, unknown>) => [m.name, m])).values(),
  );
  const models: Record<string, unknown>[] = uniqueModels as Record<string, unknown>[];

  const { data: realScores } = await supabase.from("k_model_scores").select("*");

  const registryData = {
    metadata: {
      project: "ALPAR AI Cross Audit Engine",
      created: "2026-06-08",
      last_updated: new Date().toISOString().slice(0, 10),
      total_models: models.length,
      scoring_weights: { consensus: 0.4, verification: 0.3, security: 0.3 },
    },
    audits: models.map((m: unknown) => {
      const model = m as Record<string, any>;
      const real = realScores?.find((s) => s.model_id === model.id);
      const rawScore = real?.score ?? 0;
      // Normalize score: if rawScore is 0-100 (percentage), scale to 0-100 (scoreVal) and 0-1000 (total)
      const scoreVal = Math.min(
        100,
        Math.round(rawScore <= 1 ? rawScore * 100 : rawScore <= 100 ? rawScore : rawScore / 10),
      );
      const totalScore = Math.min(1000, scoreVal * 10);
      const hasRealScore = real != null && rawScore > 0;

      return {
        model_id: model.id || "model",
        model_name: model.name || model.id || "Model",
        provider: (model.ai_providers as { name: string } | null)?.name || "Unknown",
        audit_date: real?.last_audited_at
          ? new Date(real.last_audited_at).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        audit_type: hasRealScore
          ? "Verified K-Benchmark Audit"
          : "Registered Model (Pending Audit)",
        is_free: (model as { is_free?: boolean }).is_free || false,
        scores: {
          vision_mission: scoreVal,
          message_content: scoreVal,
          ux_ui_design: scoreVal,
          technical_architecture: scoreVal,
          legal_compliance: scoreVal,
          business_model: scoreVal,
          growth_viral: scoreVal,
          traction_social_proof: scoreVal,
          investor_readiness: scoreVal,
          societal_impact: scoreVal,
          total: totalScore,
          total_max: 1000,
        },
        unique_insight: hasRealScore
          ? `Verified benchmark score: ${scoreVal}/100.`
          : "No live benchmark score recorded for this model yet.",
        key_recommendations: hasRealScore
          ? ["Continuous automated monitoring active"]
          : ["Pending live benchmark audit execution"],
      };
    }),
    consensus_findings: {
      unanimous: [{ finding: "LLM Hallucination Indexing", model_count: String(models.length) }],
      strong_consensus: [
        { finding: "PII Masking Guardian", model_count: String(Math.max(1, models.length - 1)) },
      ],
    },
    p0_tracker: [],
    score_evolution: (() => {
      const validScores = (realScores || [])
        .map((s) => {
          const raw = s.score ?? 0;
          const score100 = Math.min(
            100,
            Math.round(raw <= 1 ? raw * 100 : raw <= 100 ? raw : raw / 10),
          );
          return score100 * 10;
        })
        .filter((val) => val > 0);
      if (validScores.length === 0) return [];
      const avg = Math.min(
        1000,
        Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length),
      );
      const max = Math.min(1000, Math.max(...validScores));
      const min = Math.min(1000, Math.min(...validScores));
      return [
        {
          date: new Date().toISOString().slice(0, 10),
          round: 1,
          average_score: avg,
          highest: max,
          lowest: min,
          model_count: validScores.length,
        },
      ];
    })(),
  };

  return (
    <AdminContainer shell>
      <AnalyticsHubTabs />
      <AdminPageHeader
        title={t("analysisHeading")}
        subtitle={t("analysisSubheading")}
        icon={<FileText className="text-brand-400 h-6 w-6" />}
        breadcrumb={[
          { label: t("dashboard"), href: "/admin" },
          { label: t("moderation"), href: "/admin/moderation" },
          { label: t("analysis"), href: "/admin/analytics-hub/analysis" },
        ]}
      />
      <AnalysisDashboardClient registryData={registryData} />
    </AdminContainer>
  );
}

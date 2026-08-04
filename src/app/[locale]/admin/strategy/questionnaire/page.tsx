import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireAdvisor } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { ClipboardList } from "lucide-react";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";
import { QuestionnaireClient } from "@/components/admin/questionnaire-client";
import { QUESTIONNAIRE_MODELS } from "@/lib/ai/openrouter-gateway";
import { QUESTIONS } from "@/lib/strategy/questions";
import type { GatewayModel } from "@/lib/ai/openrouter-gateway";

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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  await requireAdvisor();
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return {
    title: `${t("questionnaire_title")} | ALPAR AI Admin`,
  };
}

export default async function QuestionnairePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdvisor();
  const t = await getTranslations({ locale, namespace: "admin" });

  const supabase = createAdminClient();

  const { data: runs } = await supabase
    .from("strategic_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(20);

  const latestRunId = runs?.[0]?.id ?? null;

  let allAnswers: AnswerRow[] = [];
  if (latestRunId) {
    const { data: answersData } = await supabase
      .from("strategic_answers")
      .select("*")
      .eq("run_id", latestRunId)
      .order("question_index", { ascending: true });
    allAnswers = (answersData || []) as unknown as AnswerRow[];
  }

  const typedRuns = (runs || []) as unknown as RunRow[];
  const typedAnswers = allAnswers;

  const models = QUESTIONNAIRE_MODELS.map((m: GatewayModel) => ({
    id: m.id,
    label: m.id.replace(/:free$/, "").replace(/^.*\//, ""),
    tier: m.tier,
  }));

  return (
    <AdminContainer>
      <AdminPageHeader
        icon={<ClipboardList className="text-brand-400 h-6 w-6" />}
        title={t("questionnaire_title")}
        subtitle={t("questionnaire_subtitle")}
      />

      <QuestionnaireClient
        runs={typedRuns}
        answers={typedAnswers}
        latestRunId={latestRunId}
        models={models}
        locale={locale}
        i18n={{
          runButton: t("questionnaire_run_button"),
          runAgainButton: t("questionnaire_run_again_button"),
          running: t("questionnaire_running"),
          history: t("questionnaire_history"),
          tableQuestion: t("questionnaire_question"),
          tableModel: t("questionnaire_model"),
          tableAnswer: t("questionnaire_answer"),
          exportMd: t("questionnaire_export"),
          noRuns: t("questionnaire_no_runs"),
          noAnswers: t("questionnaire_no_answers"),
          statusCompleted: t("questionnaire_status_completed"),
          statusFailed: t("questionnaire_failed"),
          statusRunning: t("questionnaire_running_lower"),
          tokens: t("questionnaire_tokens"),
          latency: t("questionnaire_latency"),
          selectAll: t("questionnaire_select_all"),
          questionsCount: t("questionnaire_questions_count", { total: QUESTIONS.length }),
          modelsLabel: t("questionnaire_models"),
          close: t("questionnaire_close"),
          error: t("questionnaire_error"),
          totalRuns: t("questionnaire_total_runs"),
        }}
      />
    </AdminContainer>
  );
}

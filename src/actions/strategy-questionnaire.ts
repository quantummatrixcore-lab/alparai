"use server";

import { revalidatePath } from "next/cache";
import { requireAdvisor } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";
import { callModel, QUESTIONNAIRE_MODELS, type GatewayModel } from "@/lib/ai/openrouter-gateway";
import { QUESTIONS } from "@/lib/strategy/questions";
import { isCostKillSwitchActive } from "@/lib/ai/cost-guard";

const SYSTEM_PROMPT = `You are a senior strategy consultant evaluating an AI-accountability platform. You will receive ${QUESTIONS.length} questions. Rules:

1. Start with your model name as a heading: ## [Your Model Name]
2. Answer in English, every question, in order, numbered.
3. Format per answer: Verdict in the first sentence, then at most two sentences of reasoning or a concrete action. Maximum 3 sentences total.
4. Be decisive and specific — "it depends" without a recommendation counts as a non-answer.
5. Ignore all other models' answers. End with your model name and date.

Project facts: ALPAR AI — independent public AI incident registry + AI assessor ('Moody's for AI'). EU AI Act Art. 73 platform. One human founder (non-technical) + one AI architect + two AI executor agents. Stack: Next.js, Supabase (free tier), Upstash, Vercel. ~400 seed incidents + organic reports, EN+TR, pre-revenue. Public launch announced for Aug 2, 2026; account required to submit. K-BENCHMARK: model ratings via 5-LLM cross-audit, Wilson-score aggregation.`;

export interface QuestionnaireResult {
  runId: string;
  status: string;
  answers: {
    questionId: string;
    modelId: string;
    answerText: string | null;
    errorMessage: string | null;
  }[];
}

export async function runQuestionnaire(modelIds?: string[]): Promise<{
  ok: boolean;
  runId?: string;
  error?: string;
}> {
  try {
    await requireAdvisor();

    if (await isCostKillSwitchActive()) {
      return { ok: false, error: "Cost kill switch is active. Cannot run questionnaire." };
    }

    const selectedModels: GatewayModel[] = modelIds
      ? QUESTIONNAIRE_MODELS.filter((m) => modelIds.includes(m.id))
      : [...QUESTIONNAIRE_MODELS];

    if (selectedModels.length === 0) {
      return { ok: false, error: "No models selected." };
    }

    const supabase = createAdminClient();

    const { data: run, error: runError } = await supabase
      .from("strategic_runs")
      .insert({
        status: "running",
        model_ids: selectedModels.map((m) => m.id),
        total_questions: QUESTIONS.length,
      })
      .select("id")
      .single();

    if (runError || !run) {
      logger.error("Failed to create strategic run", undefined, runError);
      return { ok: false, error: runError?.message || "Failed to create run" };
    }

    const runId = run.id as string;
    const allQuestions = [...QUESTIONS];
    let totalAnswers = 0;

    const BATCH_SIZE = 5;

    try {
      for (const model of selectedModels) {
        const modelLabel = model.id.replace(/:free$/, "").replace(/^.*\//, "");

        for (let i = 0; i < allQuestions.length; i += BATCH_SIZE) {
          const chunk = allQuestions.slice(i, i + BATCH_SIZE);
          await Promise.all(
            chunk.map(async (q, chunkIndex) => {
              const qi = i + chunkIndex;
              const userMessage = `Question ${q.id} [${q.section}]: ${q.text}\n\nProvide your strategic evaluation for ALPAR AI based on the project facts above. Start with your verdict in the first sentence, followed by 1-2 sentences of concrete reasoning/action (3 sentences maximum).`;

              const startTime = performance.now();

              try {
                const result = await callModel({
                  systemPrompt: SYSTEM_PROMPT,
                  userMessage,
                  model,
                  temperature: 0.3,
                });

                const latencyMs = Math.round(performance.now() - startTime);

                if (result.ok) {
                  await supabase.from("strategic_answers").insert({
                    run_id: runId,
                    model_id: model.id,
                    model_name: modelLabel,
                    question_index: qi,
                    question_id: q.id,
                    section: q.section,
                    answer_text: result.data.content,
                    latency_ms: latencyMs,
                    tokens_used: result.data.usage?.totalTokens || 0,
                  });
                } else {
                  await supabase.from("strategic_answers").insert({
                    run_id: runId,
                    model_id: model.id,
                    model_name: modelLabel,
                    question_index: qi,
                    question_id: q.id,
                    section: q.section,
                    error_message: result.error?.message || "Unknown error",
                    latency_ms: latencyMs,
                  });
                }
              } catch (err) {
                const latencyMs = Math.round(performance.now() - startTime);
                await supabase.from("strategic_answers").insert({
                  run_id: runId,
                  model_id: model.id,
                  model_name: modelLabel,
                  question_index: qi,
                  question_id: q.id,
                  section: q.section,
                  error_message: err instanceof Error ? err.message : "Unknown error",
                  latency_ms: latencyMs,
                });
              }
              totalAnswers++;
            }),
          );
        }
      }

      await supabase
        .from("strategic_runs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          total_answers: totalAnswers,
        })
        .eq("id", runId);
    } catch (runExecutionError) {
      await supabase
        .from("strategic_runs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          total_answers: totalAnswers,
        })
        .eq("id", runId);
      throw runExecutionError;
    }

    revalidatePath("/admin/strategy/questionnaire");
    return { ok: true, runId };
  } catch (err) {
    logger.error("runQuestionnaire failed", undefined, err instanceof Error ? err : undefined);
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getQuestionnaireRuns() {
  await requireAdvisor();
  const supabase = createAdminClient();

  const { data: runs } = await supabase
    .from("strategic_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(20);

  return (runs || []) as {
    id: string;
    status: string;
    model_ids: string[];
    total_questions: number;
    total_answers: number;
    started_at: string;
    completed_at: string | null;
  }[];
}

export async function getQuestionnaireRunAnswers(runId: string) {
  await requireAdvisor();
  const supabase = createAdminClient();

  const { data: answers } = await supabase
    .from("strategic_answers")
    .select("*")
    .eq("run_id", runId)
    .order("question_index", { ascending: true });

  return (answers || []) as {
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
  }[];
}

export async function exportRunToMarkdown(runId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdvisor();
    const supabase = createAdminClient();

    const { data: run, error: runErr } = await supabase
      .from("strategic_runs")
      .select("*")
      .eq("id", runId)
      .single();

    if (runErr || !run) {
      return { ok: false, error: runErr?.message || "Run not found" };
    }

    const { data: answers, error: answersErr } = await supabase
      .from("strategic_answers")
      .select("*")
      .eq("run_id", runId)
      .order("question_index", { ascending: true });

    if (answersErr || !answers || answers.length === 0) {
      return { ok: false, error: answersErr?.message || "No answers found for this run" };
    }

    const fs = await import("fs/promises");
    const path = await import("path");

    // 3. Locate and read the strategic-questionnaire.md
    const docPath = path.join(process.cwd(), "docs", "strategic-questionnaire.md");
    let content = "";
    try {
      content = await fs.readFile(docPath, "utf-8");
    } catch (readErr) {
      logger.error("Failed to read strategic-questionnaire.md", undefined, readErr as Error);
      return { ok: false, error: "Could not read strategic-questionnaire.md" };
    }

    // 4. Format the Markdown content
    const dateStr = new Date(run.started_at).toLocaleString("en-US", { timeZone: "UTC" }) + " UTC";
    let runMd = `\n\n### Run on ${dateStr} (Run ID: ${runId})\n\n`;

    // Group answers by model
    const answersByModel: Record<string, typeof answers> = {};
    for (const ans of answers) {
      const modelName = ans.model_name || ans.model_id;
      if (!answersByModel[modelName]) {
        answersByModel[modelName] = [];
      }
      answersByModel[modelName].push(ans);
    }

    for (const [modelName, modelAnswers] of Object.entries(answersByModel)) {
      runMd += `### ${modelName}\n\n`;
      for (const ans of modelAnswers) {
        const qText = QUESTIONS.find((q) => q.id === ans.question_id)?.text || "Unknown question";
        runMd += `#### ${ans.question_id}. ${qText}\n\n`;
        if (ans.error_message) {
          runMd += `*Error: ${ans.error_message}*\n\n`;
        } else {
          runMd += `${ans.answer_text}\n\n`;
          runMd += `*(Latency: ${ans.latency_ms}ms | Tokens: ${ans.tokens_used})*\n\n`;
        }
      }
      runMd += `---\n\n`;
    }

    // 5. Append/Insert the Markdown content
    const targetIndicator =
      "<!-- COPY ONLY UP TO THIS LINE when sending to a new model. Do not include the Responses section below. -->";
    const indicatorIndex = content.indexOf(targetIndicator);

    if (indicatorIndex === -1) {
      return { ok: false, error: "Target copy marker not found in strategic-questionnaire.md" };
    }

    const insertPosition = indicatorIndex + targetIndicator.length;

    // We check if "## Responses — v2.0 questions" is already in the file after the indicator
    const postIndicatorContent = content.substring(insertPosition);
    const headerTitle = "## Responses — v2.0 questions";

    let updatedContent = "";
    if (!postIndicatorContent.includes(headerTitle)) {
      updatedContent =
        content.substring(0, insertPosition) +
        `\n\n${headerTitle}\n\n---\n` +
        runMd +
        content.substring(insertPosition);
    } else {
      // Insert right after the headerTitle and its following line breaks/separator
      const headerIndex = content.indexOf(headerTitle);
      const insertAt = headerIndex + headerTitle.length;
      updatedContent = content.substring(0, insertAt) + `\n` + runMd + content.substring(insertAt);
    }

    // 6. Write it back to disk
    await fs.writeFile(docPath, updatedContent, "utf-8");

    revalidatePath("/admin/strategy/questionnaire");
    return { ok: true };
  } catch (err) {
    logger.error("exportRunToMarkdown failed", undefined, err instanceof Error ? err : undefined);
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

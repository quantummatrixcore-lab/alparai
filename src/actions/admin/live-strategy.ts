"use server";

import { requireAdmin } from "@/lib/auth/session";
import { callWithFailover } from "@/lib/ai/openrouter-gateway";
import { selectModelByCapability } from "@/lib/audit/model-router";
import { logger } from "@/lib/utils/logger";

export async function runLiveStrategyAnalysis(context: {
  strengths: number;
  weaknesses: number;
  opportunities: number;
  threats: number;
  highRisks: number;
  activeRisks: number;
  doneMilestones: number;
  totalMilestones: number;
}) {
  await requireAdmin();
  try {
    const prompt = `
    You are an AI model acting as the 'Strategy Advisor' (Strategy AI) of the ALPAR AI platform.
    Current strategy metrics are as follows:
    - SWOT: Strengths: ${context.strengths}, Weaknesses: ${context.weaknesses}, Opportunities: ${context.opportunities}, Threats: ${context.threats}
    - Risks: High Risk: ${context.highRisks}, Active Risk: ${context.activeRisks}
    - Milestones: Completed: ${context.doneMilestones} / Total: ${context.totalMilestones}

    Please analyze these real data metrics in depth and generate a realistic, actionable professional strategic status report.
    
    Please return a JSON output containing these 4 main keys:
    - health_score (a number between 0-100)
    - executive_summary (short summary)
    - strategic_gaps (2-3 identified strategic gaps or weaknesses)
    - recommendations (2 recommended strategic moves)
    
    Your output MUST be valid JSON only. Do not write any other explanation text.
    `;

    const result = await callWithFailover(
      {
        systemPrompt:
          "You are an expert AI model acting as the Strategy Advisor of the ALPAR AI platform. Output valid JSON only.",
        userMessage: prompt,
        temperature: 0.7,
        responseFormat: "json",
      },
      await selectModelByCapability("math_logic"),
    );

    if (!result.ok) {
      logger.error("Live Strategy API key missing or gateway error", {
        error: result.error,
      });
      return {
        success: false,
        error:
          "Yapay zeka analizi gerçekleştirilemedi. Lütfen daha sonra tekrar deneyin veya API bağlantılarını kontrol edin.",
      };
    }

    const rawText = result.data.content.trim();
    const cleanText = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleanText);
    return { success: true, data: parsed };
  } catch (err: unknown) {
    logger.error("Live Strategy Error:", undefined, err instanceof Error ? err : undefined);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.",
    };
  }
}

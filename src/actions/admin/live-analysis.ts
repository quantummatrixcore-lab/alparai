"use server";

import { requireAdmin } from "@/lib/auth/session";
import { callWithFailover } from "@/lib/ai/openrouter-gateway";
import { selectModelByCapability } from "@/lib/audit/model-router";
import { logger } from "@/lib/utils/logger";

export async function runLiveSystemAnalysis(): Promise<{
  success: boolean;
  data?: {
    overall_score: number;
    [key: string]: unknown;
  };
  error?: string;
}> {
  await requireAdmin();
  try {
    // Fetch real context for the LLM
    const { createAdminClient } = await import("@/lib/dehost/admin");
    const dehost = createAdminClient();
    const { data: runs } = await dehost
      .from("cross_audit_runs")
      .select("model, latency_ms, score, verdict")
      .limit(5)
      .order("created_at", { ascending: false });
    const { data: costs } = await dehost
      .from("finance_monthly_costs")
      .select("service, budget_usd, amount_usd")
      .limit(5)
      .order("month", { ascending: false });

    const prompt = `
    You are an AI model acting as the 'Ruthless QA Architect' of the ALPAR AI platform.
    Analyze the current system metrics and generate a system inspection report.
    
    Current Performance (Last 5 Audits):
    ${JSON.stringify(runs, null, 2)}
    
    Current Cost (Last 5 Budget Records):
    ${JSON.stringify(costs, null, 2)}
    
    Please return a JSON output containing these 4 main keys:
    - overall_score (a number between 0-100)
    - executive_summary (short summary)
    - security_flaws (2-3 identified vulnerabilities or risks)
    - recommendations (2 recommended action items)
    
    Your output MUST be valid JSON only. Do not write any other explanation text.
    `;

    const result = await callWithFailover(
      {
        systemPrompt: "You are an expert AI QA Architect. Output valid JSON only.",
        userMessage: prompt,
        temperature: 0.7,
        responseFormat: "json",
      },
      await selectModelByCapability("risk_audit"),
    );

    if (!result.ok) {
      logger.warn(
        "Live System Analysis API key missing or gateway error, returning architecture fallback",
        { error: result.error },
      );
      return {
        success: false,
        error: "Live System Analysis API key missing or gateway error.",
      };
    }

    const rawText = result.data.content.trim();
    const cleanText = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    try {
      const parsed = JSON.parse(cleanText);
      return { success: true, data: parsed };
    } catch (_parseErr) {
      logger.warn("Live Analysis JSON parse warning, structuring text output", { rawText });
      return {
        success: false,
        error: "Live Analysis JSON parse failed.",
      };
    }
  } catch (err: unknown) {
    logger.error("Live Analysis Error:", undefined, err instanceof Error ? err : undefined);
    return {
      success: false,
      error: "Live Analysis Error: " + (err instanceof Error ? err.message : "Unknown error"),
    };
  }
}

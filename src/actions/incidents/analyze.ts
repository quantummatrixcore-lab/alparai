"use server";

import { callWithFailover, FAST_TRIAGE_CHAIN } from "@/lib/ai/openrouter-gateway";
import { selectModelByCapability } from "@/lib/audit/model-router";
import { logger } from "@/lib/utils/logger";
import { maskPII } from "@/lib/pii/guardian";
import { headers } from "next/headers";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";

export interface IncidentAnalysisResult {
  summary: string;
  tags: string[];
  severity: "critical" | "high" | "medium" | "low";
  category: "hallucination" | "data_leak" | "bias" | "security_flaw" | "other";
  confidence: number;
}

export interface AnalyzeIncidentState {
  ok: boolean;
  error?: string;
  data?: IncidentAnalysisResult;
}

/**
 * Platform 9 Arbitrage Model: Incident Analysis (Summary & Tagging)
 * Directs incident summary & tagging workloads to free/arbitrage models
 * via 9-adapter callWithFailover gateway chain instead of expensive Opus/Sonnet.
 */
export async function analyzeIncident(
  title: string,
  description: string,
): Promise<AnalyzeIncidentState> {
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.incident_analyze}:${ip}`);
    if (!rl.ok) {
      return {
        ok: false,
        error: `Rate limit exceeded. Try again in ${rl.retryAfter ?? 60}s.`,
      };
    }

    const maskedTitle = maskPII(title || "").masked;
    const maskedDesc = maskPII(description || "").masked;

    const systemPrompt = `You are an AI Incident Analysis & Tagging Specialist for ALPAR AI.
Analyze the provided AI incident report and return a JSON object with:
1. "summary": A clean, objective 1-2 sentence summary of the incident.
2. "tags": An array of 2-5 descriptive technical tags (e.g. ["prompt-injection", "llm-hallucination", "api-leak"]).
3. "severity": One of ["critical", "high", "medium", "low"].
4. "category": One of ["hallucination", "data_leak", "bias", "security_flaw", "other"].
5. "confidence": A confidence score between 0 and 100.

Output strictly valid JSON matching:
{
  "summary": "Summary of incident",
  "tags": ["tag1", "tag2"],
  "severity": "medium",
  "category": "hallucination",
  "confidence": 85
}`;

    const userMessage = `Title: ${maskedTitle}\n\nDescription: ${maskedDesc}`;

    let modelChain: typeof FAST_TRIAGE_CHAIN;
    try {
      const selected = await selectModelByCapability("fast_triage");
      modelChain = selected as typeof FAST_TRIAGE_CHAIN;
    } catch {
      modelChain = FAST_TRIAGE_CHAIN;
    }

    const result = await callWithFailover(
      {
        systemPrompt,
        userMessage,
        temperature: 0.2,
        responseFormat: "json",
      },
      modelChain,
    );

    if (!result.ok) {
      logger.warn("[Arbitrage AI] Incident analysis gateway call failed, using fallback", {
        error: result.error,
      });
      return {
        ok: true,
        data: {
          summary: maskedTitle,
          tags: ["ai-incident", "auto-tagged"],
          severity: "medium",
          category: "other",
          confidence: 50,
        },
      };
    }

    const rawText = result.data.content
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(rawText) as IncidentAnalysisResult;

    return {
      ok: true,
      data: {
        summary: parsed.summary || maskedTitle,
        tags: Array.isArray(parsed.tags) && parsed.tags.length > 0 ? parsed.tags : ["ai-incident"],
        severity: ["critical", "high", "medium", "low"].includes(parsed.severity)
          ? parsed.severity
          : "medium",
        category: ["hallucination", "data_leak", "bias", "security_flaw", "other"].includes(
          parsed.category,
        )
          ? parsed.category
          : "other",
        confidence:
          typeof parsed.confidence === "number" && !isNaN(parsed.confidence)
            ? Math.min(100, Math.max(0, parsed.confidence))
            : 75,
      },
    };
  } catch (err) {
    logger.error(
      "[Arbitrage AI] Error in analyzeIncident",
      undefined,
      err instanceof Error ? err : undefined,
    );
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Analysis failed",
    };
  }
}

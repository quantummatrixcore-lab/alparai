import "server-only";
import { maskPII } from "@/lib/pii/guardian";
import { selectModelTier } from "@/lib/audit/model-router";
import { callWithFailover } from "@/lib/ai/openrouter-gateway";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";
import type { Database } from "@/types/database";

const VERIFIER_PROMPT = `You are an AI incident screening analyst for ALPAR AI. Your job is to evaluate a potential AI incident report fetched from external sources (Reddit, HackerNews, RSS) and determine if it is a credible real-world AI failure.

Evaluate on three axes:
1. **plausibilityScore** (0-100): Is this a real AI failure (hallucination, bias, privacy, security, misinformation, etc.) or just noise/spam?
2. **adversarialRisk** (0-100): Is this bad-faith content designed to manipulate?
3. **severity**: What severity is this incident? One of: "low", "medium", "high", "critical"
4. **category**: Best matching category: "hallucination", "bias", "privacy", "security", "misinformation", "harassment", "manipulation", "inaccessibility", "copyright", "other"

If plausibilityScore >= 60, the incident is credible enough to publish. Below 60, it should remain pending for human review.

Return ONLY valid JSON (no markdown block, no explanation):
{
  "plausibilityScore": number,
  "adversarialRisk": number,
  "severity": "low" | "medium" | "high" | "critical",
  "category": string,
  "reasoning": "string"
}`;

function safeParseJSON<T>(raw: string): T | null {
  try {
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}

export interface VerificationResult {
  approved: boolean;
  plausibilityScore: number;
  adversarialRisk: number;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  reasoning: string;
}

export async function verifyExternalItem(title: string, body: string): Promise<VerificationResult> {
  const { masked: safeTitle } = maskPII(title);
  const { masked: safeBody } = maskPII(body);

  const routerResult = await selectModelTier({
    title: safeTitle,
    description: safeBody,
    severity: "low",
  });

  const chain = routerResult.slot1Chain;

  const userMessage = `## Potential AI Incident (External Source)
**Title:** ${safeTitle}
**Body:** ${safeBody}

Evaluate this item for credibility.`;

  const result = await callWithFailover(
    {
      systemPrompt: VERIFIER_PROMPT,
      userMessage,
      temperature: 0.2,
      responseFormat: "json",
    },
    chain,
  );

  if (!result.ok) {
    return {
      approved: false,
      plausibilityScore: 0,
      adversarialRisk: 50,
      severity: "low",
      category: "other",
      reasoning: "AI verification failed — model did not respond",
    };
  }

  const parsed = safeParseJSON<{
    plausibilityScore: number;
    adversarialRisk: number;
    severity: string;
    category: string;
    reasoning: string;
  }>(result.data.content);

  if (!parsed) {
    return {
      approved: false,
      plausibilityScore: 0,
      adversarialRisk: 50,
      severity: "low",
      category: "other",
      reasoning: "AI verification failed — could not parse response",
    };
  }

  const plausibilityScore = clamp(parsed.plausibilityScore ?? 0, 0, 100);
  const adversarialRisk = clamp(parsed.adversarialRisk ?? 50, 0, 100);
  const validSeverities = ["low", "medium", "high", "critical"] as const;
  const severity = validSeverities.includes(parsed.severity as (typeof validSeverities)[number])
    ? (parsed.severity as "low" | "medium" | "high" | "critical")
    : "low";
  const category = parsed.category || "other";

  const approved = plausibilityScore >= 60 && adversarialRisk < 50;

  return {
    approved,
    plausibilityScore,
    adversarialRisk,
    severity,
    category,
    reasoning: parsed.reasoning || "No reasoning provided",
  };
}

export async function publishVerifiedItem(params: {
  title: string;
  body: string;
  externalUrl: string;
  source: string;
  category: string;
  severity: string;
  plausibilityScore: number;
}): Promise<{ success: boolean; incidentId?: string }> {
  const admin = createAdminClient();

  const { masked: titleMasked, detections: titleDetections } = maskPII(params.title);
  const { masked: bodyMasked, detections: bodyDetections } = maskPII(params.body);
  const piiCats = Array.from(
    new Set([...titleDetections.map((d) => d.type), ...bodyDetections.map((d) => d.type)]),
  );
  const containsPii = piiCats.length > 0;

  const { data: incident, error: insertError } = await admin
    .from("incidents")
    .insert({
      title: titleMasked,
      title_masked: titleMasked,
      description: bodyMasked,
      description_masked: bodyMasked,
      category: params.category as Database["public"]["Enums"]["incident_category"],
      severity: params.severity as Database["public"]["Enums"]["incident_severity"],
      source_url: params.externalUrl,
      incident_source: params.source,
      import_attribution: "external-queue-ai-v1",
      incident_date: new Date().toISOString(),
      language: "en",
      is_anonymous: true,
      is_expert: false,
      contains_pii: containsPii,
      pii_categories: piiCats,
      status: "published",
      processing_stage: "pending",
      cross_audit_truth_score: params.plausibilityScore,
      cross_audit_reasoning: `Auto-published by external verifier with plausibility score: ${params.plausibilityScore}`,
    })
    .select("id")
    .single();

  if (insertError || !incident) {
    logger.error("[ExternalVerifier] Failed to insert verified incident", {
      error: insertError?.message,
      externalUrl: params.externalUrl,
    });
    return { success: false };
  }

  const { error: ecosystemError } = await admin.from("ecosystem_news").insert({
    title_en: titleMasked,
    title_tr: titleMasked,
    summary_en: bodyMasked,
    summary_tr: bodyMasked,
    category: params.category,
    severity: params.severity,
    source: params.source,
    url: params.externalUrl,
    status: "accepted",
    is_active: true,
    published_at: new Date().toISOString(),
  });

  if (ecosystemError) {
    logger.warn("[ExternalVerifier] ecosystem_news insert skipped (likely duplicate)", {
      externalUrl: params.externalUrl,
      error: ecosystemError.message,
    });
  }

  logger.info("[ExternalVerifier] AI-verified incident auto-published", {
    incidentId: incident.id,
    source: params.source,
    plausibilityScore: params.plausibilityScore,
  });

  return { success: true, incidentId: incident.id };
}

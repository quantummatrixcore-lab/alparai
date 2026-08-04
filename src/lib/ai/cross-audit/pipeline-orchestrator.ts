/**
 * ALPAR AI — Cross-Audit Pipeline Orchestrator
 *
 * Coordinates the full cross-audit lifecycle:
 * fetch incident → pre-triage COGS gate → J4a model routing →
 * Turn 1-4 debate → persist verdict → cache → retry logic.
 *
 * @module src/lib/ai/cross-audit/pipeline-orchestrator
 */

import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isGatewayConfigured } from "@/lib/ai/openrouter-gateway";
import { maskPII } from "@/lib/pii/guardian";
import { selectModelTier, type ModelTier } from "@/lib/audit/model-router";
import { logger } from "@/lib/utils/logger";
import type { Database } from "@/types/database";
import {
  runInitialEvaluation,
  runChallenge,
  runRebuttal,
  runSupremeCourtAdjudication,
} from "./debate-runner";
import { getRedis, buildCacheKey, computeCacheTtl, readCache, writeCache } from "./cache-manager";
import type { DebateTranscript, InitialEvaluation, TruthScoreResult } from "./debate-prompts";

export class NonRetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NonRetryableError";
  }
}

export function runPreTriageCogsGate(
  title: string,
  description: string,
): { ok: boolean; reason?: string } {
  const cleanTitle = title.trim();
  const cleanDesc = description.trim();

  if (cleanTitle.length < 5) {
    return { ok: false, reason: "Title too short (minimum 5 characters)" };
  }

  if (cleanDesc.length < 30) {
    return { ok: false, reason: "Description too short (minimum 30 characters)" };
  }

  if (/^(.)\1{4,}/.test(cleanTitle) || /^(.)\1{9,}/.test(cleanDesc)) {
    return { ok: false, reason: "Gibberish pattern detected (repeating characters)" };
  }

  const spamRegex = /\b(test123|asdfasdf|qwerty|foo\s*bar|spamspam|testing\s*incident)\b/i;
  if (spamRegex.test(cleanTitle) || spamRegex.test(cleanDesc)) {
    return { ok: false, reason: "Nonsense/Test content pattern detected" };
  }

  return { ok: true };
}

export function estimateDebateCogs(
  title: string,
  description: string,
): { inputTokens: number; outputTokens: number; costUsd: number } {
  const textLen = title.length + description.length;
  const inputCharCount = textLen * 7 + 25000;
  const outputCharCount = 6000;

  const inputTokens = Math.ceil(inputCharCount / 4);
  const outputTokens = Math.ceil(outputCharCount / 4);

  const costUsd = (inputTokens / 1_000_000) * 1.5 + (outputTokens / 1_000_000) * 6.0;

  return {
    inputTokens,
    outputTokens,
    costUsd: parseFloat(costUsd.toFixed(5)),
  };
}

async function runCrossAuditPipelineOnce(incidentId: string): Promise<TruthScoreResult | null> {
  const startTime = performance.now();
  const admin = createAdminClient();

  const { data: incident, error: fetchError } = await admin
    .from("incidents")
    .select(
      "id, title, description, title_masked, description_masked, category, severity, audit_tier",
    )
    .eq("id", incidentId)
    .single();

  if (fetchError || !incident) {
    logger.error("[CrossAudit] Incident not found", {
      incidentId,
      error: fetchError?.message,
    });
    throw new NonRetryableError(
      fetchError ? `Database error: ${fetchError.message}` : "Incident not found",
    );
  }

  const safeTitle = maskPII(incident.title_masked || incident.title).masked;
  const safeDescription = maskPII(incident.description_masked || incident.description).masked;

  const redis = getRedis();
  const cacheKey = buildCacheKey(safeTitle, safeDescription, incident.category, incident.severity);

  const cached = await readCache<TruthScoreResult>(redis, cacheKey);
  if (cached) {
    const totalLatencyMs = Math.round(performance.now() - startTime);
    logger.info("[CrossAudit] Cache hit — skipping LLM calls", { incidentId, cacheKey });

    try {
      await admin.from("cross_audit_runs").insert({
        incident_id: incidentId,
        model: cached.supremeCourtModel ?? "cache",
        tokens_in: 0,
        tokens_out: 0,
        cost_usd: 0,
        latency_ms: totalLatencyMs,
        cache_hit: true,
      });
    } catch (err) {
      logger.error(
        "[CrossAudit] Failed to log cache-hit telemetry",
        {},
        err instanceof Error ? err : undefined,
      );
    }

    return { ...cached, totalLatencyMs };
  }

  const gate = runPreTriageCogsGate(safeTitle, safeDescription);
  if (!gate.ok) {
    logger.info("[CrossAudit] Pre-triage COGS gate rejected incident", {
      incidentId,
      reason: gate.reason,
    });

    await admin
      .from("incidents")
      .update({
        cross_audit_truth_score: 0,
        cross_audit_confidence: 1.0,
        cross_audit_reasoning: `Filtered by pre-triage COGS gate: ${gate.reason}`,
        cross_audit_completed_at: new Date().toISOString(),
        cross_audit_model: "cogs-gate-v1",
      })
      .eq("id", incidentId);

    return {
      truthScore: 0,
      confidence: 1.0,
      reasoning: `Filtered by pre-triage COGS gate: ${gate.reason}`,
      supremeCourtModel: "cogs-gate-v1",
      triageModels: [],
      totalLatencyMs: 0,
    };
  }

  const costEst = estimateDebateCogs(safeTitle, safeDescription);
  logger.info("[CrossAudit] Starting Debate Pipeline with COGS cost estimation", {
    incidentId,
    category: incident.category,
    severity: incident.severity,
    estimatedCostUsd: costEst.costUsd,
    estimatedInputTokens: costEst.inputTokens,
    estimatedOutputTokens: costEst.outputTokens,
  });

  const routerResult = await selectModelTier({
    title: safeTitle,
    description: safeDescription,
    severity: incident.severity,
    auditTier: incident.audit_tier as ModelTier | undefined,
  });

  if (routerResult.tier === "none") {
    logger.info("[CrossAudit] J4a: Routing bypassed due to audit_tier = 'none'", { incidentId });
    await admin
      .from("incidents")
      .update({
        cross_audit_truth_score: 0,
        cross_audit_confidence: 1.0,
        cross_audit_reasoning: "Filtered by audit_tier setting: none",
        cross_audit_completed_at: new Date().toISOString(),
        cross_audit_model: "model-router-v1",
      })
      .eq("id", incidentId);

    return {
      truthScore: 0,
      confidence: 1.0,
      reasoning: "Filtered by audit_tier setting: none",
      supremeCourtModel: "model-router-v1",
      triageModels: [],
      totalLatencyMs: 0,
    };
  }

  logger.info(`[CrossAudit] J4a: Routing to ${routerResult.tier.toUpperCase()} models`, {
    tier: routerResult.tier,
  });

  const { slot1Chain, slot2Chain, slot3Chain, supremeChain } = routerResult;
  const MIN_QUORUM = 2;

  const initSettled = await Promise.allSettled([
    runInitialEvaluation(
      slot1Chain,
      safeTitle,
      safeDescription,
      incident.category,
      incident.severity,
    ),
    runInitialEvaluation(
      slot2Chain,
      safeTitle,
      safeDescription,
      incident.category,
      incident.severity,
    ),
    runInitialEvaluation(
      slot3Chain,
      safeTitle,
      safeDescription,
      incident.category,
      incident.severity,
    ),
  ]);

  const successfulInits = initSettled
    .filter(
      (r): r is PromiseFulfilledResult<InitialEvaluation> =>
        r.status === "fulfilled" && r.value !== null,
    )
    .map((r) => r.value);

  if (successfulInits.length < MIN_QUORUM) {
    throw new Error(`Failed to reach minimum quorum (${MIN_QUORUM}) for initial evaluations.`);
  }

  const [initA, initB] = successfulInits as [InitialEvaluation, InitialEvaluation];

  logger.info("[CrossAudit] Turn 1 Complete (Initial Evaluations)", {
    modelA: initA.model,
    modelB: initB.model,
    successfulCount: successfulInits.length,
  });

  const challengeSettled = await Promise.allSettled([
    runChallenge(
      slot1Chain,
      safeTitle,
      safeDescription,
      incident.category,
      incident.severity,
      initB,
    ),
    runChallenge(
      slot2Chain,
      safeTitle,
      safeDescription,
      incident.category,
      incident.severity,
      initA,
    ),
  ]);

  const challengeA =
    challengeSettled[0]!.status === "fulfilled" && challengeSettled[0]!.value
      ? challengeSettled[0]!.value
      : { critique: "Model timed out during challenge.", questions: [], model: initA.model };

  const challengeB =
    challengeSettled[1]!.status === "fulfilled" && challengeSettled[1]!.value
      ? challengeSettled[1]!.value
      : { critique: "Model timed out during challenge.", questions: [], model: initB.model };

  logger.info("[CrossAudit] Turn 2 Complete (Challenges Generated)");

  const rebuttalSettled = await Promise.allSettled([
    runRebuttal(
      slot1Chain,
      safeTitle,
      safeDescription,
      incident.category,
      incident.severity,
      initA,
      challengeB,
    ),
    runRebuttal(
      slot2Chain,
      safeTitle,
      safeDescription,
      incident.category,
      incident.severity,
      initB,
      challengeA,
    ),
  ]);

  const fallbackRebuttal = {
    answers: "Model timed out during rebuttal.",
    model: "",
    finalPlausibilityScore: 0,
    finalCategoryAccuracy: 0,
    finalAdversarialRisk: 0,
    finalReasoning: "",
  };

  const rebuttalA =
    rebuttalSettled[0]!.status === "fulfilled" && rebuttalSettled[0]!.value
      ? rebuttalSettled[0]!.value
      : {
          ...fallbackRebuttal,
          finalPlausibilityScore: initA.plausibilityScore,
          finalCategoryAccuracy: initA.categoryAccuracy,
          finalAdversarialRisk: initA.adversarialRisk,
          finalReasoning: initA.reasoning,
          model: initA.model,
        };

  const rebuttalB =
    rebuttalSettled[1]!.status === "fulfilled" && rebuttalSettled[1]!.value
      ? rebuttalSettled[1]!.value
      : {
          ...fallbackRebuttal,
          finalPlausibilityScore: initB.plausibilityScore,
          finalCategoryAccuracy: initB.categoryAccuracy,
          finalAdversarialRisk: initB.adversarialRisk,
          finalReasoning: initB.reasoning,
          model: initB.model,
        };

  logger.info("[CrossAudit] Turn 3 Complete (Rebuttals & Defenses Finalized)");

  const transcript: DebateTranscript = {
    modelA: {
      name: initA.model,
      initial: initA,
      challenge: challengeA,
      rebuttal: rebuttalA,
    },
    modelB: {
      name: initB.model,
      initial: initB,
      challenge: challengeB,
      rebuttal: rebuttalB,
    },
  };

  const supremeResult = await runSupremeCourtAdjudication(
    supremeChain,
    safeTitle,
    safeDescription,
    incident.category,
    incident.severity,
    transcript,
  );

  const totalLatencyMs = Math.round(performance.now() - startTime);

  if (!supremeResult) {
    throw new Error("Supreme Court adjudication returned null.");
  }

  const triageModels = [initA.model, initB.model];

  const isHighOrUnacceptableRisk = ["High-Risk", "Unacceptable-Risk"].includes(
    supremeResult.euActRiskCategory || "",
  );
  const updatePayload: Database["public"]["Tables"]["incidents"]["Update"] = {
    cross_audit_truth_score: supremeResult.truthScore,
    cross_audit_confidence: supremeResult.confidence,
    cross_audit_reasoning: supremeResult.reasoning,
    cross_audit_model: supremeResult.model,
    cross_audit_triage_models: triageModels,
    cross_audit_completed_at: new Date().toISOString(),
    eu_act_transparency_score: supremeResult.euActTransparencyScore,
    eu_act_non_discrimination_score: supremeResult.euActNonDiscriminationScore,
    eu_act_data_privacy_score: supremeResult.euActDataPrivacyScore,
    eu_act_risk_category: supremeResult.euActRiskCategory,
    processing_stage: "complete",
  };

  if (isHighOrUnacceptableRisk) {
    logger.info(
      `[CrossAudit] Incident classified as ${supremeResult.euActRiskCategory}. Enforcing human moderation gate.`,
      { incidentId },
    );
    updatePayload.status = "pending_review";
    updatePayload.published_at = null;
    updatePayload.moderator_notes = `Held/Reverted for human gate review due to High-Risk/Unacceptable-Risk classification (${supremeResult.euActRiskCategory}).`;
  }

  const { error: updateError } = await admin
    .from("incidents")
    .update(updatePayload)
    .eq("id", incidentId)
    .eq("processing_stage", "scoring");

  if (updateError) {
    throw new Error(`Failed to persist results: ${updateError.message}`);
  }

  try {
    await admin.from("cross_audit_runs").insert({
      incident_id: incidentId,
      model: supremeResult.model,
      tokens_in: costEst.inputTokens,
      tokens_out: costEst.outputTokens,
      cost_usd: costEst.costUsd,
      latency_ms: totalLatencyMs,
      cache_hit: false,
    });
  } catch (err) {
    logger.error(
      "[CrossAudit] Failed to log telemetry to cross_audit_runs",
      {},
      err instanceof Error ? err : undefined,
    );
  }

  const result: TruthScoreResult = {
    truthScore: supremeResult.truthScore,
    confidence: supremeResult.confidence,
    reasoning: supremeResult.reasoning,
    supremeCourtModel: supremeResult.model,
    triageModels,
    totalLatencyMs,
    euActTransparencyScore: supremeResult.euActTransparencyScore,
    euActNonDiscriminationScore: supremeResult.euActNonDiscriminationScore,
    euActDataPrivacyScore: supremeResult.euActDataPrivacyScore,
    euActRiskCategory: supremeResult.euActRiskCategory,
  };

  const ttl = computeCacheTtl(supremeResult.euActRiskCategory);
  await writeCache(redis, cacheKey, result, ttl);
  logger.info("[CrossAudit] Cached result in Redis", {
    incidentId,
    cacheKey,
    ttl,
    severity: supremeResult.euActRiskCategory,
  });

  logger.info("[CrossAudit] Debate Pipeline completed successfully", {
    incidentId,
    truthScore: result.truthScore,
    confidence: result.confidence,
    supremeCourtModel: result.supremeCourtModel,
    triageModels: result.triageModels,
    totalLatencyMs: result.totalLatencyMs,
  });

  return result;
}

export async function runCrossAudit(incidentId: string): Promise<TruthScoreResult | null> {
  if (!isGatewayConfigured()) {
    logger.warn("[CrossAudit] Skipping — OPENROUTER_API_KEY not configured.");
    return null;
  }

  const admin = createAdminClient();
  const { data: updated, error: stageError } = await admin
    .from("incidents")
    .update({ processing_stage: "scoring" })
    .eq("id", incidentId)
    .in("processing_stage", ["analyzing", "failed"])
    .select("id");

  if (stageError || !updated || updated.length === 0) {
    logger.warn(
      "[CrossAudit] Skipping — Incident already in scoring/complete stage, or update failed.",
    );
    return null;
  }

  const maxAttempts = 3;
  let attempt = 0;
  let delay = 1000;
  let lastError: unknown = null;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const result = await runCrossAuditPipelineOnce(incidentId);
      if (result) return result;
    } catch (err) {
      lastError = err;
      logger.warn(
        `[CrossAudit] Attempt ${attempt}/${maxAttempts} failed: ${err instanceof Error ? err.message : String(err)}`,
      );

      if (err instanceof NonRetryableError) {
        logger.error(
          `[CrossAudit] Fatal non-retryable error: ${err.message}. Aborting retry loop.`,
        );
        break;
      }
    }

    if (attempt < maxAttempts) {
      logger.info(`[CrossAudit] Retrying pipeline in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2.5;
    }
  }

  const errorMsg =
    lastError instanceof Error ? lastError.message : "Pipeline execution failed with no details";
  logger.error("[CrossAudit] DLQ Alert — All retries exhausted", {
    incidentId,
    attempts: attempt,
    error: errorMsg,
  });

  try {
    const admin2 = createAdminClient();
    const updateData: Database["public"]["Tables"]["incidents"]["Update"] = {
      processing_stage: "failed",
      moderator_notes: `[CrossAudit Failed] All audit retries failed. Last error: ${errorMsg}`,
    };
    if (!(lastError instanceof NonRetryableError)) {
      updateData.cross_audit_reasoning = `[DLQ ERROR] All audit retries failed. Last error: ${errorMsg}`;
      updateData.cross_audit_completed_at = new Date().toISOString();
    }
    await admin2
      .from("incidents")
      .update(updateData)
      .eq("id", incidentId)
      .eq("processing_stage", "scoring");
  } catch (dbErr) {
    logger.error(
      "[CrossAudit] Failed to write DLQ failure to database",
      undefined,
      dbErr instanceof Error ? dbErr : new Error(String(dbErr)),
    );
  }

  return null;
}

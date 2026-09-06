"use server";

import { selectModelTier } from "@/lib/audit/model-router";
import {
  runInitialEvaluation,
  runChallenge,
  runRebuttal,
  runSupremeCourtAdjudication,
} from "@/lib/ai/cross-audit/debate-runner";
import { isGatewayConfigured } from "@/lib/ai/openrouter-gateway";
import { maskPII } from "@/lib/pii/guardian";
import { logger } from "@/lib/utils/logger";
import { requireAdmin } from "@/lib/auth/session";

export async function runLiveCrossAuditTest(text: string) {
  try {
    await requireAdmin();

    if (!isGatewayConfigured()) {
      logger.error("Live Cross Audit OpenRouter API key missing");
      return {
        success: false,
        error: "OpenRouter API anahtarı yapılandırılmamış.",
      };
    }

    const masked = maskPII(text).masked;
    const safeTitle = masked.slice(0, 80);
    const safeDescription = masked;

    const routerResult = await selectModelTier({
      title: safeTitle,
      description: safeDescription,
      severity: "medium",
      auditTier: "basic",
    });

    if (routerResult.tier === "none") {
      return {
        success: false,
        error: "Debate routing tier is inactive.",
      };
    }

    const { slot1Chain, slot2Chain, supremeChain } = routerResult;

    // Turn 1: Initial Evaluations
    const [initA, initB] = await Promise.all([
      runInitialEvaluation(slot1Chain, safeTitle, safeDescription, "General", "Medium"),
      runInitialEvaluation(slot2Chain, safeTitle, safeDescription, "General", "Medium"),
    ]);

    if (!initA || !initB) {
      throw new Error("Triage models failed to generate initial assessments.");
    }

    // Turn 2: Challenges
    const [challengeA, challengeB] = await Promise.all([
      runChallenge(slot1Chain, safeTitle, safeDescription, "General", "Medium", initB),
      runChallenge(slot2Chain, safeTitle, safeDescription, "General", "Medium", initA),
    ]);

    const safeChallengeA = challengeA || {
      critique: "Model timed out during challenge.",
      questions: [],
      model: initA.model,
    };
    const safeChallengeB = challengeB || {
      critique: "Model timed out during challenge.",
      questions: [],
      model: initB.model,
    };

    // Turn 3: Rebuttals
    const [rebuttalA, rebuttalB] = await Promise.all([
      runRebuttal(
        slot1Chain,
        safeTitle,
        safeDescription,
        "General",
        "Medium",
        initA,
        safeChallengeB,
      ),
      runRebuttal(
        slot2Chain,
        safeTitle,
        safeDescription,
        "General",
        "Medium",
        initB,
        safeChallengeA,
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

    const safeRebuttalA = rebuttalA || {
      ...fallbackRebuttal,
      finalPlausibilityScore: initA.plausibilityScore,
      finalCategoryAccuracy: initA.categoryAccuracy,
      finalAdversarialRisk: initA.adversarialRisk,
      finalReasoning: initA.reasoning,
      model: initA.model,
    };

    const safeRebuttalB = rebuttalB || {
      ...fallbackRebuttal,
      finalPlausibilityScore: initB.plausibilityScore,
      finalCategoryAccuracy: initB.categoryAccuracy,
      finalAdversarialRisk: initB.adversarialRisk,
      finalReasoning: initB.reasoning,
      model: initB.model,
    };

    const transcript = {
      modelA: {
        name: initA.model,
        initial: initA,
        challenge: safeChallengeA,
        rebuttal: safeRebuttalA,
      },
      modelB: {
        name: initB.model,
        initial: initB,
        challenge: safeChallengeB,
        rebuttal: safeRebuttalB,
      },
    };

    // Turn 4: Supreme Court Adjudication
    const supremeResult = await runSupremeCourtAdjudication(
      supremeChain,
      safeTitle,
      safeDescription,
      "General",
      "Medium",
      transcript,
    );

    if (!supremeResult) {
      throw new Error("Supreme Court referee model returned no response.");
    }

    const stanceA = initA.plausibilityScore >= 70 ? "Plausible" : "Unlikely";
    const stanceB = initB.plausibilityScore >= 70 ? "Plausible" : "Unlikely";
    const stanceSupreme = supremeResult.truthScore >= 70 ? "Plausible" : "Unlikely";
    const refereeName = supremeResult.model
      ? supremeResult.model.split("/").pop() || supremeResult.model
      : "Supreme Referee";

    const formatted = {
      truth_score: supremeResult.truthScore,
      risk_level: supremeResult.euActRiskCategory || "Minimal",
      judge_verdict: supremeResult.reasoning,
      models: [
        {
          name: initA.model.split("/").pop() || initA.model,
          stance: stanceA,
          reason: `Initial plausibility: ${initA.plausibilityScore}%. Final: ${safeRebuttalA.finalReasoning}`,
        },
        {
          name: initB.model.split("/").pop() || initB.model,
          stance: stanceB,
          reason: `Initial plausibility: ${initB.plausibilityScore}%. Final: ${safeRebuttalB.finalReasoning}`,
        },
        {
          name: refereeName,
          stance: stanceSupreme,
          reason: `Supreme Court Adjudicator: Truth score ${supremeResult.truthScore}/100. ${supremeResult.reasoning}`,
        },
      ],
    };

    return { success: true, data: formatted };
  } catch (err: unknown) {
    logger.error("Live Cross Audit Error:", undefined, err instanceof Error ? err : undefined);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.",
    };
  }
}

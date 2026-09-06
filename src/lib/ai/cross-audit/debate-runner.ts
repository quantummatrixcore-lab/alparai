/**
 * ALPAR AI — Cross-Audit Debate Runner
 *
 * Executes the per-turn LLM calls of the multi-agent debate.
 * Turn 1: independent initial triage by two models.
 * Turn 2: cross-examination / challenge between the two models.
 * Turn 3: rebuttal & refined final scores.
 * Turn 4: Supreme Court adjudication by a separate referee model.
 *
 * @module src/lib/ai/cross-audit/debate-runner
 */

import { callWithFailover, type GatewayModel } from "@/lib/ai/openrouter-gateway";
import {
  DEBATE_CHALLENGE_PROMPT,
  DEBATE_INITIAL_PROMPT,
  DEBATE_REBUTTAL_PROMPT,
  DEBATE_SUPREME_COURT_PROMPT,
  type ChallengeResult,
  type DebateTranscript,
  type InitialEvaluation,
  type RebuttalResult,
} from "./debate-prompts";

export function safeParseJSON<T>(raw: string): T | null {
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

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}

export function clampFloat(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(val * 100) / 100));
}

export async function runInitialEvaluation(
  chain: readonly GatewayModel[],
  maskedTitle: string,
  maskedDescription: string,
  category: string,
  severity: string,
): Promise<InitialEvaluation | null> {
  const userMessage = `## Incident Report (PII-Masked)
**Title:** ${maskedTitle}
**Description:** ${maskedDescription}
**Category:** ${category}
**Severity:** ${severity}

Evaluate this incident and return your initial assessment.`;

  const result = await callWithFailover(
    {
      systemPrompt: DEBATE_INITIAL_PROMPT,
      userMessage,
      temperature: 0.2,
      responseFormat: "json",
    },
    chain,
  );

  if (!result.ok) return null;

  const parsed = safeParseJSON<{
    plausibilityScore: number;
    categoryAccuracy: number;
    adversarialRisk: number;
    reasoning: string;
    summary: string;
  }>(result.data.content);

  if (!parsed) return null;

  return {
    plausibilityScore: clamp(parsed.plausibilityScore ?? 50, 0, 100),
    categoryAccuracy: clamp(parsed.categoryAccuracy ?? 50, 0, 100),
    adversarialRisk: clamp(parsed.adversarialRisk ?? 50, 0, 100),
    reasoning: parsed.reasoning || "No initial reasoning.",
    summary: parsed.summary || "No initial summary.",
    model: result.data.model,
  };
}

export async function runChallenge(
  chain: readonly GatewayModel[],
  maskedTitle: string,
  maskedDescription: string,
  category: string,
  severity: string,
  opponentInitial: InitialEvaluation,
): Promise<ChallengeResult | null> {
  const userMessage = `## Original Incident Report (PII-Masked)
**Title:** ${maskedTitle}
**Description:** ${maskedDescription}
**Category:** ${category}
**Severity:** ${severity}

## Opponent Evaluation (${opponentInitial.model})
**Scores:** Plausibility: ${opponentInitial.plausibilityScore}, Category: ${opponentInitial.categoryAccuracy}, Adversarial Risk: ${opponentInitial.adversarialRisk}
**Reasoning:** ${opponentInitial.reasoning}
**Summary:** ${opponentInitial.summary}

Critique the opponent's evaluation and pose 1-2 challenging questions.`;

  const result = await callWithFailover(
    {
      systemPrompt: DEBATE_CHALLENGE_PROMPT,
      userMessage,
      temperature: 0.2,
      responseFormat: "json",
    },
    chain,
  );

  if (!result.ok) return null;

  const parsed = safeParseJSON<{
    critique: string;
    questions: string[];
  }>(result.data.content);

  if (!parsed) return null;

  return {
    critique: parsed.critique || "No critique.",
    questions: parsed.questions || [],
    model: result.data.model,
  };
}

export async function runRebuttal(
  chain: readonly GatewayModel[],
  maskedTitle: string,
  maskedDescription: string,
  category: string,
  severity: string,
  myInitial: InitialEvaluation,
  opponentChallenge: ChallengeResult,
): Promise<RebuttalResult | null> {
  const qList = opponentChallenge.questions.map((q, i) => `${i + 1}. ${q}`).join("\n");
  const userMessage = `## Original Incident Report (PII-Masked)
**Title:** ${maskedTitle}
**Description:** ${maskedDescription}
**Category:** ${category}
**Severity:** ${severity}

## Your Initial Evaluation
**Your Scores:** Plausibility: ${myInitial.plausibilityScore}, Category: ${myInitial.categoryAccuracy}, Adversarial: ${myInitial.adversarialRisk}
**Your Reasoning:** ${myInitial.reasoning}

## Opponent Critique & Questions
**Opponent Critique:** ${opponentChallenge.critique}
**Questions:**
${qList}

Respond to these critiques and questions, and output your final refined/adjusted scores.`;

  const result = await callWithFailover(
    {
      systemPrompt: DEBATE_REBUTTAL_PROMPT,
      userMessage,
      temperature: 0.1,
      responseFormat: "json",
    },
    chain,
  );

  if (!result.ok) return null;

  const parsed = safeParseJSON<{
    answers: string;
    finalPlausibilityScore: number;
    finalCategoryAccuracy: number;
    finalAdversarialRisk: number;
    finalReasoning: string;
  }>(result.data.content);

  if (!parsed) return null;

  return {
    answers: parsed.answers || "No response provided.",
    finalPlausibilityScore: clamp(
      parsed.finalPlausibilityScore ?? myInitial.plausibilityScore,
      0,
      100,
    ),
    finalCategoryAccuracy: clamp(
      parsed.finalCategoryAccuracy ?? myInitial.categoryAccuracy,
      0,
      100,
    ),
    finalAdversarialRisk: clamp(parsed.finalAdversarialRisk ?? myInitial.adversarialRisk, 0, 100),
    finalReasoning: parsed.finalReasoning || myInitial.reasoning,
    model: result.data.model,
  };
}

export async function runSupremeCourtAdjudication(
  chain: readonly GatewayModel[],
  maskedTitle: string,
  maskedDescription: string,
  category: string,
  severity: string,
  transcript: DebateTranscript,
): Promise<{
  truthScore: number;
  confidence: number;
  reasoning: string;
  model: string;
  euActTransparencyScore: number;
  euActNonDiscriminationScore: number;
  euActDataPrivacyScore: number;
  euActRiskCategory: string;
} | null> {
  const qAList = transcript.modelA.challenge.questions.map((q, i) => `${i + 1}. ${q}`).join("\n");
  const qBList = transcript.modelB.challenge.questions.map((q, i) => `${i + 1}. ${q}`).join("\n");

  const userMessage = `## Original Incident Report (PII-Masked)
**Title:** ${maskedTitle}
**Description:** ${maskedDescription}
**Category:** ${category}
**Severity:** ${severity}

## Debate Transcript

### 1. Model A (${transcript.modelA.name})
- **Initial Scores:** Plausibility: ${transcript.modelA.initial.plausibilityScore}, Category: ${transcript.modelA.initial.categoryAccuracy}, Adversarial: ${transcript.modelA.initial.adversarialRisk}
- **Initial Reasoning:** ${transcript.modelA.initial.reasoning}
- **Critique of Model B:** ${transcript.modelA.challenge.critique}
- **Questions to Model B:**
${qAList}
- **Response to Model B's Questions:** ${transcript.modelA.rebuttal.answers}
- **Final Scores after Debate:** Plausibility: ${transcript.modelA.rebuttal.finalPlausibilityScore}, Category: ${transcript.modelA.rebuttal.finalCategoryAccuracy}, Adversarial: ${transcript.modelA.rebuttal.finalAdversarialRisk}
- **Final Reasoning:** ${transcript.modelA.rebuttal.finalReasoning}

---

### 2. Model B (${transcript.modelB.name})
- **Initial Scores:** Plausibility: ${transcript.modelB.initial.plausibilityScore}, Category: ${transcript.modelB.initial.categoryAccuracy}, Adversarial: ${transcript.modelB.initial.adversarialRisk}
- **Initial Reasoning:** ${transcript.modelB.initial.reasoning}
- **Critique of Model A:** ${transcript.modelB.challenge.critique}
- **Questions to Model A:**
${qBList}
- **Response to Model A's Questions:** ${transcript.modelB.rebuttal.answers}
- **Final Scores after Debate:** Plausibility: ${transcript.modelB.rebuttal.finalPlausibilityScore}, Category: ${transcript.modelB.rebuttal.finalCategoryAccuracy}, Adversarial: ${transcript.modelB.rebuttal.finalAdversarialRisk}
- **Final Reasoning:** ${transcript.modelB.rebuttal.finalReasoning}

Act as the referee, synthesize the debate, and output your final TruthScore, Confidence, and referee reasoning.`;

  const result = await callWithFailover(
    {
      systemPrompt: DEBATE_SUPREME_COURT_PROMPT,
      userMessage,
      temperature: 0.1,
      responseFormat: "json",
    },
    chain,
  );

  if (!result.ok) return null;

  const parsed = safeParseJSON<{
    truthScore: number;
    confidence: number;
    reasoning: string;
    euActTransparencyScore?: number;
    euActNonDiscriminationScore?: number;
    euActDataPrivacyScore?: number;
    euActRiskCategory?: string;
  }>(result.data.content);

  if (!parsed) return null;

  return {
    truthScore: clamp(parsed.truthScore ?? 50, 0, 100),
    confidence: clampFloat(parsed.confidence ?? 0.5, 0.0, 1.0),
    reasoning: parsed.reasoning || "No reasoning provided.",
    model: result.data.model,
    euActTransparencyScore: clamp(parsed.euActTransparencyScore ?? 80, 0, 100),
    euActNonDiscriminationScore: clamp(parsed.euActNonDiscriminationScore ?? 80, 0, 100),
    euActDataPrivacyScore: clamp(parsed.euActDataPrivacyScore ?? 80, 0, 100),
    euActRiskCategory: parsed.euActRiskCategory || "Minimal",
  };
}

/**
 * LLM Council Deliberation Engine.
 *
 * Implements Andrej Karpathy's 3-Stage Multi-Model Deliberation Architecture:
 *   - Stage 1: First Opinions — Prompt is sent in parallel to multiple LLM chains.
 *   - Stage 2: Anonymous Peer Review — Models review anonymized responses ("Response A", "Response B")
 *              to prevent provider bias and evaluate pure content quality.
 *   - Stage 3: Chairman Synthesis — A chairman model (e.g. Gemini 1.5 Pro / Supreme Court chain)
 *              synthesizes the initial opinions and peer reviews into a unified consensus answer.
 *
 * KVKK/GDPR: All user-submitted text MUST be sanitized through PII Guardian before processing.
 */

import "server-only";
import { maskPII } from "@/lib/pii/guardian";
import { logger } from "@/lib/utils/logger";
import {
  callWithFailover,
  SUPREME_COURT_CHAIN,
  TRIAGE_SLOT_1_CHAIN,
  TRIAGE_SLOT_2_CHAIN,
  TRIAGE_SLOT_3_CHAIN,
  type GatewayModel,
} from "./openrouter-gateway";

export interface CouncilMemberOpinion {
  memberId: string; // Anonymous label (e.g., "Response A", "Response B")
  modelId: string;
  response: string;
  latencyMs: number;
}

export interface PeerReviewEvaluation {
  reviewerMemberId: string;
  reviewText: string;
}

export interface CouncilSynthesisResult {
  ok: boolean;
  opinions: CouncilMemberOpinion[];
  peerReviews: PeerReviewEvaluation[];
  synthesis: {
    finalAnswer: string;
    consensusScore: number; // 0-100
    summaryReasoning: string;
  };
  attemptedChains: string[][];
  error?: string;
}

export interface CouncilRunOptions {
  prompt: string;
  systemPrompt?: string;
  memberChains?: readonly (readonly GatewayModel[])[];
  chairmanChain?: readonly GatewayModel[];
  anonymizeLabels?: string[];
}

const DEFAULT_LABELS = ["Response A", "Response B", "Response C", "Response D", "Response E"];

/**
 * Executes a 3-Stage LLM Council Deliberation process on a given prompt.
 */
export async function runLLMCouncil(options: CouncilRunOptions): Promise<CouncilSynthesisResult> {
  const sanitizedPrompt = maskPII(options.prompt).masked;
  const systemPrompt = options.systemPrompt
    ? maskPII(options.systemPrompt).masked
    : "You are an expert AI council member analyzing a critical problem with high rigor, objectivity, and precision.";

  const memberChains = options.memberChains ?? [
    TRIAGE_SLOT_1_CHAIN,
    TRIAGE_SLOT_2_CHAIN,
    TRIAGE_SLOT_3_CHAIN,
  ];
  const chairmanChain = options.chairmanChain ?? SUPREME_COURT_CHAIN;
  const labels = options.anonymizeLabels ?? DEFAULT_LABELS;

  const opinions: CouncilMemberOpinion[] = [];
  const attemptedChains: string[][] = [];

  logger.info("[LLMCouncil] Stage 1: Gathering First Opinions in parallel...", {
    membersCount: memberChains.length,
  });

  // Stage 1: Gather First Opinions in parallel
  const stage1Results = await Promise.all(
    memberChains.map((chain) =>
      callWithFailover(
        {
          systemPrompt,
          userMessage: sanitizedPrompt,
          temperature: 0.3,
        },
        chain,
      ),
    ),
  );

  stage1Results.forEach((res, index) => {
    attemptedChains.push(res.attemptedModels);
    const label = labels[index] ?? `Response ${index + 1}`;

    if (res.ok && res.data.content) {
      opinions.push({
        memberId: label,
        modelId: res.attemptedModels[res.attemptedModels.length - 1] ?? "unknown",
        response: res.data.content.trim(),
        latencyMs: res.data.latencyMs,
      });
    }
  });

  if (opinions.length === 0) {
    logger.error("[LLMCouncil] Stage 1 failed: No models returned a valid opinion.");
    return {
      ok: false,
      opinions: [],
      peerReviews: [],
      synthesis: {
        finalAnswer: "",
        consensusScore: 0,
        summaryReasoning: "All model chains failed during Stage 1.",
      },
      attemptedChains,
      error: "Stage 1 failed: No models available.",
    };
  }

  logger.info("[LLMCouncil] Stage 1 complete. Gathering Stage 2 Anonymous Peer Reviews...", {
    validOpinionsCount: opinions.length,
  });

  // Stage 2: Anonymous Peer Review
  const anonymizedResponsesText = opinions
    .map((op) => `=== ${op.memberId} ===\n${op.response}`)
    .join("\n\n");

  const peerReviewPrompt = `Below are several anonymous responses to the following user query:
<USER_QUERY>
${sanitizedPrompt}
</USER_QUERY>

<ANONYMOUS_RESPONSES>
${anonymizedResponsesText}
</ANONYMOUS_RESPONSES>

As an impartial peer reviewer:
1. Evaluate each anonymous response for accuracy, logical soundness, completeness, and safety.
2. Point out specific strengths or errors in each response.
3. Provide a clear recommendation on which response is best and why.`;

  const peerReviews: PeerReviewEvaluation[] = [];

  const stage2Results = await Promise.all(
    memberChains.slice(0, opinions.length).map((chain) =>
      callWithFailover(
        {
          systemPrompt:
            "You are an anonymous, objective peer reviewer in an LLM council. Judge purely based on evidence and logic.",
          userMessage: peerReviewPrompt,
          temperature: 0.2,
        },
        chain,
      ),
    ),
  );

  stage2Results.forEach((res, index) => {
    const reviewerLabel = opinions[index]?.memberId ?? `Reviewer ${index + 1}`;
    if (res.ok && res.data.content) {
      peerReviews.push({
        reviewerMemberId: reviewerLabel,
        reviewText: res.data.content.trim(),
      });
    }
  });

  logger.info("[LLMCouncil] Stage 2 complete. Stage 3: Chairman Synthesis...", {
    reviewsCount: peerReviews.length,
  });

  // Stage 3: Chairman Synthesis
  const reviewsText = peerReviews
    .map((pr) => `=== Review by ${pr.reviewerMemberId} ===\n${pr.reviewText}`)
    .join("\n\n");

  const chairmanPrompt = `You are the Chairman of the LLM Council. You are given the original query, the initial anonymous responses, and the peer reviews from all council members.

<ORIGINAL_QUERY>
${sanitizedPrompt}
</ORIGINAL_QUERY>

<INITIAL_OPINIONS>
${anonymizedResponsesText}
</INITIAL_OPINIONS>

<PEER_REVIEWS>
${reviewsText}
</PEER_REVIEWS>

Synthesize a final, authoritative, high-precision answer based on the best insights from all council members.
Respond in JSON format with the following structure:
{
  "consensusScore": <number between 0 and 100 indicating overall agreement and confidence>,
  "summaryReasoning": "<brief synthesis rationale>",
  "finalAnswer": "<complete, definitive response to the original query>"
}`;

  const chairmanResult = await callWithFailover(
    {
      systemPrompt:
        "You are the Chairman of an LLM deliberation council. Synthesize consensus into JSON format.",
      userMessage: chairmanPrompt,
      temperature: 0.1,
      responseFormat: "json",
    },
    chairmanChain,
  );

  attemptedChains.push(chairmanResult.attemptedModels);

  if (!chairmanResult.ok || !chairmanResult.data.content) {
    logger.warn(
      "[LLMCouncil] Stage 3 Chairman primary response failed, falling back to best Stage 1 opinion.",
    );
    const topOpinion = opinions[0]!;
    return {
      ok: true,
      opinions,
      peerReviews,
      synthesis: {
        finalAnswer: topOpinion.response,
        consensusScore: 50,
        summaryReasoning: "Chairman synthesis timed out; fallback to primary Stage 1 opinion.",
      },
      attemptedChains,
    };
  }

  try {
    const rawContent = chairmanResult.data.content.trim();
    // Strip markdown code block if present
    const jsonStr = rawContent.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(jsonStr) as {
      consensusScore?: number;
      summaryReasoning?: string;
      finalAnswer?: string;
    };

    return {
      ok: true,
      opinions,
      peerReviews,
      synthesis: {
        finalAnswer: parsed.finalAnswer ?? rawContent,
        consensusScore: typeof parsed.consensusScore === "number" ? parsed.consensusScore : 85,
        summaryReasoning: parsed.summaryReasoning ?? "Consensus achieved across council members.",
      },
      attemptedChains,
    };
  } catch (e) {
    logger.warn("[LLMCouncil] Failed to parse Chairman JSON output, returning raw text.", {
      error: String(e),
    });
    return {
      ok: true,
      opinions,
      peerReviews,
      synthesis: {
        finalAnswer: chairmanResult.data.content.trim(),
        consensusScore: 75,
        summaryReasoning: "Raw chairman synthesis output parsed as plain text.",
      },
      attemptedChains,
    };
  }
}

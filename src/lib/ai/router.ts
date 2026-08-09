import "server-only";
import { logger } from "@/lib/utils/logger";
import { callWithFailover } from "./openrouter-gateway";
import type { GatewayRequest, GatewayResult, GatewayModel } from "./types";

// Local/Edge 1.5B Models representing the 8GB RAM Sovereign Scale constraint
export const LOCAL_GHOST_CHAIN: readonly GatewayModel[] = [
  { id: "qwen/qwen2.5-1.5b-instruct", provider: "openrouter", tier: "free", maxTokens: 2048 },
  { id: "google/gemma-2-2b-it", provider: "openrouter", tier: "free", maxTokens: 2048 },
] as const;

// Cloud Omni 70B+ Models for complex reasoning
export const CLOUD_OMNI_CHAIN: readonly GatewayModel[] = [
  { id: "qwen/qwen2.5-72b-instruct", provider: "nvidia", tier: "free", maxTokens: 4096 },
  { id: "meta/llama-3.3-70b-instruct", provider: "nvidia", tier: "free", maxTokens: 4096 },
  { id: "deepseek/deepseek-chat", provider: "openrouter", tier: "free", maxTokens: 4096 },
] as const;

/**
 * Heuristic analyzer to determine prompt complexity.
 * @returns 'local' if it fits within 8GB Sovereign Scale limits, 'cloud' otherwise.
 */
function analyzeComplexity(systemPrompt: string, userMessage: string): "local" | "cloud" {
  const combinedText = systemPrompt + " " + userMessage;

  // 1. Length constraint (local models struggle with very long contexts)
  if (combinedText.length > 3000) return "cloud";

  // 2. Keyword constraint (complex logic requires 70B+)
  const complexKeywords = [
    "analyze",
    "synthesize",
    "evaluate",
    "compare",
    "architect",
    "calculate",
    "predict",
    "json",
    "regex",
    "extract",
  ];

  const lowerText = combinedText.toLowerCase();
  const complexityScore = complexKeywords.filter((kw) => lowerText.includes(kw)).length;

  if (complexityScore >= 2) return "cloud";

  return "local";
}

/**
 * Ghost Inference Router (BLOK #B101)
 * Routes the request dynamically between Local (1.5B) and Cloud (70B) based on complexity.
 */
export async function ghostInferenceRoute(
  request: Omit<GatewayRequest, "model">,
): Promise<GatewayResult & { execution_mode: "local" | "cloud"; attemptedModels: string[] }> {
  const mode = analyzeComplexity(request.systemPrompt, request.userMessage);

  const chain = mode === "local" ? LOCAL_GHOST_CHAIN : CLOUD_OMNI_CHAIN;

  logger.info(`[GhostInference] Routing request to ${mode.toUpperCase()} tier (${chain[0]?.id})`);

  const start = performance.now();
  const result = await callWithFailover(request, chain);
  const end = performance.now();

  logger.info(`[GhostInference] Execution finished in ${(end - start).toFixed(2)}ms`);

  return {
    ...result,
    execution_mode: mode,
  };
}

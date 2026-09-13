import { callWithFailover } from "@/lib/ai/openrouter-gateway";
import type { GatewayModel, GatewayRequest, GatewayResult } from "@/lib/ai/types";
import { logger } from "@/lib/utils/logger";
import type { AttributionInput, AttributionResult } from "./provider-alias-map";

/**
 * Sovereign & Cheap tier model chain for provider attribution classification.
 * Tries internal Sovereign (Ollama/ErcuOS) first, falls back to free open-weight models.
 */
export const ATTRIBUTION_JUDGE_CHAIN: readonly GatewayModel[] = [
  { id: "qwen2.5:1.5b", provider: "sovereign", tier: "free", maxTokens: 256 },
  { id: "qwen/qwen2.5-1.5b-instruct", provider: "openrouter", tier: "free", maxTokens: 256 },
  { id: "google/gemma-2-2b-it", provider: "openrouter", tier: "free", maxTokens: 256 },
] as const;

export interface ModelJudgeOutput {
  provider: string;
  confidence: number;
}

export function parseJudgeResponse(rawText: string): ModelJudgeOutput | null {
  if (!rawText) return null;

  // Try direct JSON parsing first
  try {
    const clean = rawText.replace(/```json\s*|\s*```/g, "").trim();
    const parsed = JSON.parse(clean);
    if (typeof parsed.provider === "string" && typeof parsed.confidence === "number") {
      return {
        provider: parsed.provider.trim().toLowerCase(),
        confidence: Math.max(0, Math.min(1, parsed.confidence)),
      };
    }
  } catch {
    // Fall through to regex parsing
  }

  const providerMatch =
    rawText.match(/"?provider"?\s*(?::|is|=)\s*"?([a-z0-9\-]+)"?/i) ||
    rawText.match(/provider\s+(?:is|was|to be)\s+"?([a-z0-9\-]+)"?/i);

  const confidenceMatch =
    rawText.match(/"?confidence"?\s*(?::|is|=)\s*([0-9.]+)/i) ||
    rawText.match(/confidence\s*(?::|is|=)?\s*([0-9.]+)/i);

  if (providerMatch?.[1]) {
    const provider = providerMatch[1].trim().toLowerCase();
    const conf = confidenceMatch ? parseFloat(confidenceMatch[1] ?? "0.5") : 0.5;
    return {
      provider,
      confidence: isNaN(conf) ? 0.5 : Math.max(0, Math.min(1, conf)),
    };
  }

  return null;
}

export type GatewayCaller = (
  request: Omit<GatewayRequest, "model">,
  models: readonly GatewayModel[]
) => Promise<GatewayResult & { attemptedModels?: string[] }>;

/**
 * Non-blocking model-judge fallback for incident provider attribution.
 *
 * Rules:
 * - Asking ONLY: "which known AI provider does this incident concern? answer slug or UNKNOWN" + confidence.
 * - Confidence >= 0.8: auto-assigns (attribution_method='model', stores confidence).
 * - Confidence < 0.8 or UNKNOWN: needs_provider_review=true, provider stays null (honest, flaggable).
 */
export async function judgeProviderAttribution(
  incident: AttributionInput,
  knownSlugs: string[],
  providerMap?: Map<string, { id: string; slug: string; name?: string }>,
  modelChain: readonly GatewayModel[] = ATTRIBUTION_JUDGE_CHAIN,
  gatewayCall: GatewayCaller = callWithFailover
): Promise<AttributionResult> {
  const allowedSlugsStr = knownSlugs.slice(0, 50).join(", ");

  const systemPrompt = `You are a strict, objective AI incident attribution judge.
Your single job is to identify which known AI provider this incident concerns.
Allowed provider slugs: [${allowedSlugsStr}, UNKNOWN]
Answer ONLY in JSON format: {"provider": "<slug or UNKNOWN>", "confidence": <0.0 to 1.0>}`;

  const userMessage = `Title: ${incident.title}
Description: ${incident.description}
Affected: ${incident.affectedProvider || "N/A"}
Source: ${incident.sourceUrl || "N/A"}

Which known AI provider does this incident concern? answer slug or UNKNOWN with confidence.`;

  try {
    const result = await gatewayCall(
      {
        systemPrompt,
        userMessage,
        temperature: 0.1,
        responseFormat: "json",
      },
      modelChain
    );

    if (!result.ok) {
      logger.warn("[AttributionJudge] Model call failed or timed out", {
        error: result.error.message,
      });
      return {
        matched: false,
        providerSlug: null,
        providerId: null,
        attributionMethod: null,
        attributionKeyword: null,
        attributionConfidence: null,
        needsProviderReview: true,
      };
    }

    const parsed = parseJudgeResponse(result.data.content);

    if (!parsed) {
      logger.warn("[AttributionJudge] Failed to parse model response", {
        content: result.data.content,
      });
      return {
        matched: false,
        providerSlug: null,
        providerId: null,
        attributionMethod: null,
        attributionKeyword: null,
        attributionConfidence: null,
        needsProviderReview: true,
      };
    }

    const { provider, confidence } = parsed;

    // Threshold check: >= 0.8 auto-assigns; otherwise flags for human review
    if (confidence >= 0.8 && provider !== "unknown" && knownSlugs.includes(provider)) {
      const dbProvider = providerMap?.get(provider);
      return {
        matched: true,
        providerSlug: provider,
        providerId: dbProvider?.id ?? null,
        attributionMethod: "model",
        attributionKeyword: null,
        attributionConfidence: confidence,
        needsProviderReview: false,
      };
    }

    // Below threshold or unknown
    return {
      matched: false,
      providerSlug: null,
      providerId: null,
      attributionMethod: null,
      attributionKeyword: null,
      attributionConfidence: confidence,
      needsProviderReview: true,
    };
  } catch (err) {
    logger.error("[AttributionJudge] Unexpected error during model attribution", undefined, err as Error);
    return {
      matched: false,
      providerSlug: null,
      providerId: null,
      attributionMethod: null,
      attributionKeyword: null,
      attributionConfidence: null,
      needsProviderReview: true,
    };
  }
}
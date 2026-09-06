/**
 * Provider-Agnostic AI Gateway.
 *
 * Implements a unified abstraction layer over multiple LLM providers:
 *   - OpenRouter (OpenAI SDK wrapper)
 *   - HuggingFace (Serverless Inference HTTP)
 *   - Cohere (Cohere REST chat completions)
 *   - Google Gemini (Native Google AI REST)
 *
 * Dynamically routes requests based on the `provider` field of the model definition.
 * Implements circuit-breaker failover across any model chain.
 *
 * KVKK/GDPR: All text MUST be pre-masked through PII Guardian before
 * reaching this module.
 */

import "server-only";
import { logger } from "@/lib/utils/logger";
import type {
  GatewayModel,
  GatewayRequest,
  GatewayResult,
  GatewayError,
  ProviderAdapter,
} from "./types";
import { OpenRouterAdapter } from "./adapters/openrouter";
import { CohereAdapter } from "./adapters/cohere";
import { HuggingFaceAdapter } from "./adapters/huggingface";
import { GoogleAdapter } from "./adapters/google";
import { GroqAdapter } from "./adapters/groq";
import { BlackboxAdapter } from "./adapters/blackbox";
import { NvidiaNgcAdapter } from "./adapters/nvidia-ngc";
import { SovereignAdapter } from "./adapters/sovereign";
import { isCostKillSwitchActive, getDailyCost } from "./cost-guard";

// Export the type interfaces from the common types file to keep backward compatibility
export type {
  GatewayModel,
  GatewayRequest,
  GatewayResponse,
  GatewayError,
  GatewayResult,
} from "./types";

// Default model setup for the Cross-Audit Engine (kept for backwards compatibility)
export const FREE_TRIAGE_MODELS: readonly GatewayModel[] = [
  {
    id: "opencode/deepseek-v4-flash-free",
    provider: "openrouter",
    tier: "free",
    maxTokens: 4096,
    modelClass: "flash",
    capability: "medium",
    specialties: ["math_logic", "code_generation", "fast_triage"],
  },
  {
    id: "opencode/nemotron-3-ultra-free",
    provider: "openrouter",
    tier: "free",
    maxTokens: 4096,
    modelClass: "pro",
    capability: "high",
    specialties: ["code_generation", "risk_audit", "ethics_audit"],
  },
  {
    id: "gemini-2.0-flash",
    provider: "google",
    tier: "free",
    maxTokens: 4096,
    modelClass: "flash",
    capability: "medium",
    specialties: ["math_logic", "fast_triage", "creative_copy"],
  },
  {
    id: "meta-llama/Llama-3.3-70B-Instruct",
    provider: "huggingface",
    tier: "free",
    maxTokens: 4096,
    modelClass: "pro",
    capability: "high",
    specialties: ["creative_copy", "fast_triage", "ethics_audit"],
  },
] as const;

export const SUPREME_COURT_MODEL: GatewayModel = {
  id: "gemini-2.0-pro",
  provider: "google",
  tier: "premium",
  maxTokens: 4096,
  modelClass: "pro",
  capability: "high",
  specialties: ["math_logic", "risk_audit"],
} as const;

// Dedicated multi-provider failover chains for each parallel slot
export const TRIAGE_SLOT_1_CHAIN: readonly GatewayModel[] = [
  {
    id: "gemini-2.0-flash",
    provider: "google",
    tier: "free",
    maxTokens: 2048,
    modelClass: "flash",
    capability: "medium",
    specialties: ["math_logic", "fast_triage", "creative_copy"],
  },
  {
    id: "opencode/deepseek-v4-flash-free",
    provider: "openrouter",
    tier: "free",
    maxTokens: 2048,
    modelClass: "flash",
    capability: "medium",
    specialties: ["math_logic", "code_generation", "fast_triage"],
  },
] as const;

export const TRIAGE_SLOT_2_CHAIN: readonly GatewayModel[] = [
  {
    id: "opencode/deepseek-v4-flash-free",
    provider: "openrouter",
    tier: "free",
    maxTokens: 2048,
    modelClass: "flash",
    capability: "medium",
    specialties: ["math_logic", "code_generation", "fast_triage"],
  },
  {
    id: "meta-llama/Llama-3.3-70B-Instruct",
    provider: "huggingface",
    tier: "free",
    maxTokens: 2048,
    modelClass: "pro",
    capability: "high",
    specialties: ["creative_copy", "fast_triage", "ethics_audit"],
  },
] as const;

export const TRIAGE_SLOT_3_CHAIN: readonly GatewayModel[] = [
  {
    id: "gemini-2.0-flash",
    provider: "google",
    tier: "free",
    maxTokens: 2048,
    modelClass: "flash",
    capability: "medium",
    specialties: ["math_logic", "fast_triage", "creative_copy"],
  },
  {
    id: "opencode/nemotron-3-ultra-free",
    provider: "openrouter",
    tier: "free",
    maxTokens: 2048,
    modelClass: "pro",
    capability: "high",
    specialties: ["code_generation", "risk_audit", "ethics_audit"],
  },
] as const;

// Strategic Questionnaire models — free OpenRouter models + MiMo V2.5 (paid)
export const QUESTIONNAIRE_MODELS: readonly GatewayModel[] = [
  {
    id: "gemini-2.0-flash",
    provider: "google",
    tier: "free",
    maxTokens: 4096,
    modelClass: "flash",
    capability: "medium",
    specialties: ["math_logic", "fast_triage", "creative_copy"],
  },
  {
    id: "opencode/deepseek-v4-flash-free",
    provider: "openrouter",
    tier: "free",
    maxTokens: 4096,
    modelClass: "flash",
    capability: "medium",
    specialties: ["math_logic", "code_generation", "fast_triage"],
  },
] as const;

export const SUPREME_COURT_CHAIN: readonly GatewayModel[] = [
  {
    id: "gemini-2.0-pro",
    provider: "google",
    tier: "premium",
    maxTokens: 4096,
    modelClass: "pro",
    capability: "high",
    specialties: ["math_logic", "risk_audit"],
  },
  {
    id: "anthropic/claude-3.7-sonnet",
    provider: "openrouter",
    tier: "premium",
    maxTokens: 4096,
    modelClass: "pro",
    capability: "high",
    specialties: ["creative_copy", "risk_audit", "ethics_audit"],
  },
  {
    id: "openai/gpt-4o",
    provider: "openrouter",
    tier: "premium",
    maxTokens: 4096,
    modelClass: "pro",
    capability: "high",
    specialties: ["creative_copy", "risk_audit"],
  },
] as const;

// -----------------------------------------------------------------------------
// Capability-Based Routing Chains (Yetenek Bazlı Yönlendirme Zincirleri)
// -----------------------------------------------------------------------------

// 1. Math, Logic, Data Analysis (DeepSeek Optimized)
export const MATH_LOGIC_CHAIN: readonly GatewayModel[] = [
  {
    id: "opencode/deepseek-v4-flash-free",
    provider: "openrouter",
    tier: "free",
    maxTokens: 4096,
    modelClass: "flash",
    capability: "medium",
    specialties: ["math_logic", "code_generation", "fast_triage"],
  },
  {
    id: "gemini-2.0-flash",
    provider: "google",
    tier: "free",
    maxTokens: 4096,
    modelClass: "flash",
    capability: "medium",
    specialties: ["math_logic", "fast_triage", "creative_copy"],
  },
] as const;

// 2. Creative, Marketing, Social Media Copy (Claude / Llama Optimized)
export const CREATIVE_COPY_CHAIN: readonly GatewayModel[] = [
  {
    id: "meta-llama/Llama-3.3-70B-Instruct",
    provider: "huggingface",
    tier: "free",
    maxTokens: 4096,
    modelClass: "pro",
    capability: "high",
    specialties: ["creative_copy", "fast_triage", "ethics_audit"],
  },
  {
    id: "gemini-2.0-flash",
    provider: "google",
    tier: "free",
    maxTokens: 4096,
    modelClass: "flash",
    capability: "medium",
    specialties: ["math_logic", "fast_triage", "creative_copy"],
  },
] as const;

// 3. High-Risk Audit, Legal, Complex Reasoning (GPT-4o / Claude 3.5 Sonnet)
// Directly uses SUPREME_COURT_CHAIN logic but named for capability domain
export const RISK_AUDIT_CHAIN: readonly GatewayModel[] = [
  {
    id: "opencode/nemotron-3-ultra-free",
    provider: "openrouter",
    tier: "free",
    maxTokens: 4096,
    modelClass: "pro",
    capability: "high",
    specialties: ["code_generation", "risk_audit", "ethics_audit"],
  },
  {
    id: "gemini-2.0-pro",
    provider: "google",
    tier: "premium",
    maxTokens: 4096,
    modelClass: "pro",
    capability: "high",
    specialties: ["math_logic", "risk_audit"],
  },
] as const;

// 4. Fast Triage, Summarization, Classification (Qwen / Llama / OpenCode Free Optimized)
export const FAST_TRIAGE_CHAIN: readonly GatewayModel[] = [
  {
    id: "llama3.1:8b",
    provider: "sovereign",
    tier: "free",
    maxTokens: 2048,
    modelClass: "flash",
    capability: "medium",
    specialties: ["fast_triage", "creative_copy"],
  },
  {
    id: "qwen2.5-coder:7b",
    provider: "sovereign",
    tier: "free",
    maxTokens: 2048,
    modelClass: "flash",
    capability: "medium",
    specialties: ["code_generation", "fast_triage"],
  },
  {
    id: "opencode/deepseek-v4-flash-free",
    provider: "openrouter",
    tier: "free",
    maxTokens: 4096,
    modelClass: "flash",
    capability: "medium",
    specialties: ["math_logic", "code_generation", "fast_triage"],
  },
  {
    id: "gemini-2.0-flash",
    provider: "google",
    tier: "free",
    maxTokens: 4096,
    modelClass: "flash",
    capability: "medium",
    specialties: ["math_logic", "fast_triage", "creative_copy"],
  },
] as const;

// Doktrin #044: OpenCode Zen Free & Nvidia NIM Model Pools
export const OPENCODE_FREE_MODELS: readonly GatewayModel[] = [
  {
    id: "opencode/deepseek-v4-flash-free",
    provider: "openrouter",
    tier: "free",
    maxTokens: 4096,
    modelClass: "flash",
    capability: "medium",
    specialties: ["math_logic", "code_generation", "fast_triage"],
  },
  {
    id: "opencode/nemotron-3-ultra-free",
    provider: "openrouter",
    tier: "free",
    maxTokens: 4096,
    modelClass: "pro",
    capability: "high",
    specialties: ["code_generation", "risk_audit", "ethics_audit"],
  },
  {
    id: "gemini-2.0-flash",
    provider: "google",
    tier: "free",
    maxTokens: 4096,
    modelClass: "flash",
    capability: "medium",
    specialties: ["math_logic", "fast_triage", "creative_copy"],
  },
  {
    id: "meta-llama/Llama-3.3-70B-Instruct",
    provider: "huggingface",
    tier: "free",
    maxTokens: 4096,
    modelClass: "pro",
    capability: "high",
    specialties: ["creative_copy", "fast_triage", "ethics_audit"],
  },
] as const;

export const NVIDIA_NIM_MODELS: readonly GatewayModel[] = [
  {
    id: "nvidia/deepseek-ai/deepseek-v4-pro",
    provider: "nvidia",
    tier: "free",
    maxTokens: 4096,
    modelClass: "pro",
    capability: "high",
    specialties: ["math_logic", "code_generation", "risk_audit"],
  },
  {
    id: "nvidia/z-ai/glm-5.2",
    provider: "nvidia",
    tier: "free",
    maxTokens: 4096,
    modelClass: "pro",
    capability: "high",
    specialties: ["risk_audit", "fast_triage", "ethics_audit"],
  },
  {
    id: "nvidia/openai/gpt-oss-120b",
    provider: "nvidia",
    tier: "free",
    maxTokens: 4096,
    modelClass: "pro",
    capability: "high",
    specialties: ["creative_copy", "risk_audit"],
  },
  {
    id: "nvidia/google/gemma-4-31b-it",
    provider: "nvidia",
    tier: "free",
    maxTokens: 4096,
    modelClass: "flash",
    capability: "medium",
    specialties: ["creative_copy", "fast_triage"],
  },
] as const;

// Instantiate adapters lazily or cache them
const adapters: Record<string, ProviderAdapter> = {
  openrouter: new OpenRouterAdapter(),
  cohere: new CohereAdapter(),
  huggingface: new HuggingFaceAdapter(),
  google: new GoogleAdapter(),
  groq: new GroqAdapter(),
  blackbox: new BlackboxAdapter(),
  nvidia: new NvidiaNgcAdapter(),
  sovereign: new SovereignAdapter(),
};

/**
 * Route request to the appropriate adapter based on model.provider.
 */
export async function callModel(request: GatewayRequest): Promise<GatewayResult> {
  if (await isCostKillSwitchActive()) {
    logger.warn(`[Gateway] Call blocked — COST_KILL_SWITCH is active.`);
    return {
      ok: false,
      error: {
        code: "cost_kill_switch_active",
        message:
          "API calls are temporarily suspended because the project cost ceiling was exceeded.",
        model: request.model.id,
      },
    };
  }

  // Cost Router fallback routing
  const dailyCost = await getDailyCost();
  let modelToCall = request.model;

  if (dailyCost > 45) {
    // daily cost > $45: Free-tier / local models (T0)
    if (modelToCall.tier !== "free") {
      modelToCall = FREE_TRIAGE_MODELS[0]!;
    }
  } else if (dailyCost > 30) {
    // daily cost > $30: Flash models (T2/T1)
    if (modelToCall.tier === "premium") {
      modelToCall = TRIAGE_SLOT_1_CHAIN[0]!;
    }
  }

  const provider = modelToCall.provider || "openrouter";
  if (provider === "blackbox" && process.env.ENABLE_BLACKBOX_PROVIDER !== "true") {
    return {
      ok: false,
      error: {
        code: "unsupported_provider",
        message: `Provider '${provider}' is disabled by feature flag.`,
        model: modelToCall.id,
      },
    };
  }

  const adapter = adapters[provider];

  if (!adapter) {
    logger.error(`[Gateway] Unsupported provider requested: ${provider}`, {
      model: modelToCall.id,
    });
    return {
      ok: false,
      error: {
        code: "unsupported_provider",
        message: `Provider '${provider}' is not supported or not implemented.`,
        model: modelToCall.id,
      },
    };
  }

  const isConfigured = await adapter.isConfigured();
  if (!isConfigured) {
    return {
      ok: false,
      error: {
        code: "no_api_key",
        message: `API Key for provider '${provider}' is not configured in environment variables or database.`,
        model: modelToCall.id,
      },
    };
  }

  return adapter.call({ ...request, model: modelToCall });
}

/**
 * Circuit-breaker failover: Try each model in the array sequentially.
 * If a model returns rate_limit (429/503) or times out, try the next one.
 * Works seamlessly across different providers (e.g. OpenRouter -> Cohere -> HuggingFace).
 */
export async function callWithFailover(
  request: Omit<GatewayRequest, "model">,
  models: readonly GatewayModel[],
): Promise<GatewayResult & { attemptedModels: string[] }> {
  const dailyCost = await getDailyCost();
  let activeModels = models;

  if (dailyCost > 45) {
    if (activeModels.some((m) => m.tier !== "free")) {
      const { selectModelWithEscalation } = await import("@/lib/audit/model-router");
      const escalation = await selectModelWithEscalation();
      activeModels = escalation.chain as unknown as readonly GatewayModel[];
    }
  } else if (dailyCost > 30) {
    if (activeModels.some((m) => m.tier === "premium")) {
      activeModels = TRIAGE_SLOT_1_CHAIN;
    }
  }

  const attemptedModels: string[] = [];
  let lastError: GatewayError | null = null;

  for (const model of activeModels) {
    const modelKey = `${model.provider}:${model.id}`;
    attemptedModels.push(modelKey);

    let result: GatewayResult;
    try {
      result = await callModel({ ...request, model });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error("[Gateway] Unhandled exception in adapter call, cycling to next model", {
        failedModel: modelKey,
        error: errorMessage,
      });
      lastError = {
        code: "api_error",
        message: `Unhandled exception: ${errorMessage}`,
        model: modelKey,
      };
      continue;
    }

    if (result.ok) {
      logger.info("[Gateway] Failover success", {
        model: modelKey,
        attemptedModels,
        latencyMs: result.data.latencyMs,
      });
      return { ...result, attemptedModels };
    }

    lastError = result.error;

    if (
      result.error.code === "rate_limit" ||
      result.error.code === "timeout" ||
      result.error.code === "api_error"
    ) {
      logger.warn("[Gateway] Failover cycling to next model", {
        failedModel: modelKey,
        reason: result.error.code,
        attemptedModels,
      });
      continue;
    }

    if (result.error.code === "no_api_key") {
      logger.warn("[Gateway] Failover cycling due to missing credentials", {
        failedModel: modelKey,
        reason: "no_api_key",
        attemptedModels,
      });
      continue; // Skip models where API keys are missing and proceed to fallback
    }

    logger.warn("[Gateway] Non-retryable error, breaking failover chain", {
      failedModel: modelKey,
      reason: result.error.code,
      attemptedModels,
    });
    break;
  }

  logger.error("[Gateway] All failover models exhausted across all providers", {
    attemptedModels,
    lastError: lastError?.message,
  });

  return {
    ok: false,
    error: lastError ?? {
      code: "api_error",
      message: "All models in failover chain failed.",
      model: "failover",
    },
    attemptedModels,
  };
}

/**
 * Hedged Requests: Execute requests across multiple models concurrently.
 * Returns the first successful response (arbitrage for free tier TTFT).
 */
export async function callWithHedge(
  request: Omit<GatewayRequest, "model">,
  models: readonly GatewayModel[],
): Promise<GatewayResult & { attemptedModels: string[] }> {
  // Limit to 2 free models maximum to optimize concurrent connections
  const activeModels = models.slice(0, 2);
  const attemptedModels = activeModels.map((m) => `${m.provider}:${m.id}`);

  if (activeModels.length === 0) {
    return {
      ok: false,
      error: { code: "api_error", message: "No models provided for hedging.", model: "hedge" },
      attemptedModels,
    };
  }

  try {
    const firstSuccess = await Promise.any(
      activeModels.map(async (model) => {
        const result = await callModel({ ...request, model });
        if (!result.ok) {
          throw result.error;
        }
        logger.info("[Gateway] Hedge success", { model: `${model.provider}:${model.id}` });
        return result;
      }),
    );

    return { ...firstSuccess, attemptedModels };
  } catch (err: unknown) {
    let errorMessage = String(err);
    if (err instanceof AggregateError) {
      errorMessage = err.errors.map((e) => e?.message || String(e)).join(" | ");
    }
    return {
      ok: false,
      error: {
        code: "api_error",
        message: `All hedged models failed: ${errorMessage}`,
        model: "hedge",
      },
      attemptedModels,
    };
  }
}

export async function isGatewayConfigured(): Promise<boolean> {
  const checks = await Promise.all(
    Object.values(adapters).map((adapter) => adapter.isConfigured()),
  );
  return checks.some(Boolean);
}

export interface HybridMultimodalModelSelection {
  primary: string;
  fallback: string;
  selected: string;
}

/**
 * Task #190: 50/50 Hybrid Multimodal Model Router (Qwen3.5-Omni / Gemini Flash).
 * Randomly selects between "qwen/qwen3.5-omni-7b:free" (50%) and "google/gemini-2.0-flash" (50%).
 * Provides primary and secondary fallback model IDs for cost guard and rate-limit resilience.
 */
export function getHybridMultimodalModel(isFallback = false): HybridMultimodalModelSelection {
  const isQwenPrimary = Math.random() < 0.5;
  const primary = isQwenPrimary ? "qwen/qwen3.5-omni-7b:free" : "google/gemini-2.0-flash";
  const fallback = isQwenPrimary ? "google/gemini-2.0-flash" : "qwen/qwen3.5-omni-7b:free";
  const selected = isFallback ? fallback : primary;

  return {
    primary,
    fallback,
    selected,
  };
}

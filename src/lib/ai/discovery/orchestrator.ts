import { createAdminClient } from "@/lib/supabase/admin";
import type { FreeModelRecord } from "./fetch-models";
import { FALLBACK_FREE_MODELS } from "./fetch-models";
import type { GatewayModel } from "../types";
import { logger } from "@/lib/utils/logger";

export async function runOrchestrator() {
  try {
    const supabase = createAdminClient();

    const { data: models, error } = await supabase
      .from("ai_free_models")
      .select("*")
      .eq("is_active", true)
      .neq("status", "DEGRADED");

    let availableModels = (models as unknown as FreeModelRecord[]) || [];

    if (error || availableModels.length === 0) {
      logger.warn("[Orchestrator] Failed to fetch active models or empty. Using fallback.", {
        error,
      });
      availableModels = FALLBACK_FREE_MODELS;
    }

    // Convert FreeModelRecord to GatewayModel structure for chains
    const mapToGateway = (m: FreeModelRecord): GatewayModel => ({
      id: m.id,
      provider: m.provider.toLowerCase(), // Normalize provider name for Gateway adapter lookup
      tier: "free",
      maxTokens: m.context_length > 0 ? Math.min(m.context_length, 8192) : 4096,
    });

    // Strategy for mapping models to domains
    // math_logic: Deepseek models are preferred, otherwise large context models.
    const mathLogic = availableModels
      .filter((m) => m.id.toLowerCase().includes("deepseek") || m.context_length >= 64000)
      .map(mapToGateway);

    // creative_copy: Llama, Claude, Gemini preferred
    const creativeCopy = availableModels
      .filter(
        (m) =>
          m.id.toLowerCase().includes("llama") ||
          m.id.toLowerCase().includes("gemini") ||
          m.id.toLowerCase().includes("claude"),
      )
      .map(mapToGateway);

    // risk_audit: Same as math logic, but prioritize strict/premium models if available. Here all are free tier.
    const riskAudit = availableModels
      .filter(
        (m) => m.id.toLowerCase().includes("qwen") || m.id.toLowerCase().includes("llama-3.3"),
      )
      .map(mapToGateway);

    // fast_triage: Fast models, smaller models, Qwen, Flash
    const fastTriage = availableModels
      .filter(
        (m) =>
          m.id.toLowerCase().includes("flash") ||
          m.id.toLowerCase().includes("qwen") ||
          m.id.toLowerCase().includes("8b"),
      )
      .map(mapToGateway);

    // Ensure chains are never empty by falling back to all available models if specific filters yield 0
    const finalizeChain = (chain: GatewayModel[]) =>
      chain.length > 0 ? chain : availableModels.map(mapToGateway).slice(0, 3);

    const chains = [
      { domain_name: "math_logic", models: finalizeChain(mathLogic) },
      { domain_name: "creative_copy", models: finalizeChain(creativeCopy) },
      { domain_name: "risk_audit", models: finalizeChain(riskAudit) },
      { domain_name: "fast_triage", models: finalizeChain(fastTriage) },
    ];

    for (const chain of chains) {
      await supabase.from("ai_routing_chains").upsert(chain, { onConflict: "domain_name" });
    }

    logger.info("[Orchestrator] Successfully updated capability routing chains.");
    return true;
  } catch (err) {
    logger.error("[Orchestrator] Error running orchestrator", { error: err });
    return false;
  }
}

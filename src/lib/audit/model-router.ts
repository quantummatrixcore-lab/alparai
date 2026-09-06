import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";
import {
  MATH_LOGIC_CHAIN as FALLBACK_MATH_LOGIC,
  CREATIVE_COPY_CHAIN as FALLBACK_CREATIVE_COPY,
  RISK_AUDIT_CHAIN as FALLBACK_RISK_AUDIT,
  FAST_TRIAGE_CHAIN as FALLBACK_FAST_TRIAGE,
} from "../ai/openrouter-gateway";

export type ModelTier = "basic" | "deep" | "none";
export type TaskDomain =
  | "math_logic"
  | "creative_copy"
  | "risk_audit"
  | "fast_triage"
  | "code_generation"
  | "ethics_audit";

export interface ModelChainItem {
  id: string;
  provider: string;
  tier: "free" | "premium";
  maxTokens: number;
}

export interface ModelRouterResult {
  tier: ModelTier;
  slot1Chain: ModelChainItem[];
  slot2Chain: ModelChainItem[];
  slot3Chain: ModelChainItem[];
  supremeChain: ModelChainItem[];
}

function getEscalationFreeTier(): ModelChainItem[] {
  return [
    {
      id: "opencode/deepseek-v4-flash-free",
      provider: "openrouter",
      tier: "free",
      maxTokens: 4096,
    },
    { id: "opencode/nemotron-3-ultra-free", provider: "openrouter", tier: "free", maxTokens: 4096 },
    { id: "gemini-2.0-flash", provider: "google", tier: "free", maxTokens: 8192 },
    {
      id: "meta-llama/Llama-3.3-70B-Instruct",
      provider: "huggingface",
      tier: "free",
      maxTokens: 8192,
    },
  ];
}

function getEscalationPaidTier(): ModelChainItem[] {
  return [
    {
      id: "nvidia/deepseek-ai/deepseek-v4-pro",
      provider: "nvidia",
      tier: "premium",
      maxTokens: 4096,
    },
    { id: "gemini-2.0-pro", provider: "google", tier: "premium", maxTokens: 4096 },
    { id: "nvidia/openai/gpt-oss-120b", provider: "nvidia", tier: "premium", maxTokens: 4096 },
    { id: "nvidia/z-ai/glm-5.2", provider: "nvidia", tier: "premium", maxTokens: 4096 },
    { id: "nvidia/google/gemma-4-31b-it", provider: "nvidia", tier: "premium", maxTokens: 4096 },
  ];
}

export interface EscalationResult {
  chain: ModelChainItem[];
  escalated: boolean;
}

function getKnownModelIds(): Set<string> {
  return new Set([...getEscalationFreeTier(), ...getEscalationPaidTier()].map((m) => m.id));
}

async function fetchDegradedModelIds(): Promise<Set<string>> {
  try {
    const supabase = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: degradedData } = await (supabase as any)
      .from("ai_free_models")
      .select("id")
      .eq("is_active", false);
    if (degradedData) {
      return new Set((degradedData as { id: string }[]).map((m) => m.id));
    }
  } catch {
    // Non-blocking if table query fails
  }
  return new Set<string>();
}

/**
 * Capability-based single chain selector for specific tasks (Now Dynamic from DB)
 */
export async function selectModelByCapability(domain: TaskDomain): Promise<ModelChainItem[]> {
  try {
    const supabase = createAdminClient();
    const degradedIds = await fetchDegradedModelIds();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("ai_routing_chains")
      .select("models")
      .eq("domain_name", domain)
      .single();

    if (
      error ||
      !data ||
      typeof data !== "object" ||
      !("models" in data) ||
      !Array.isArray(data.models) ||
      data.models.length === 0
    ) {
      return getFallbackChain(domain).filter((m) => !degradedIds.has(m.id));
    }

    const knownIds = getKnownModelIds();
    const unknown = (data.models as ModelChainItem[]).filter((m) => !knownIds.has(m.id));
    if (unknown.length > 0) {
      logger.warn("[ModelRouter] Routing chain references models this build does not know", {
        domain,
        unknownModelIds: unknown.map((m) => m.id),
      });
    }

    const activeChain = (data.models as ModelChainItem[]).filter(
      (m) => !degradedIds.has(m.id) && knownIds.has(m.id),
    );
    if (activeChain.length === 0) {
      return getFallbackChain(domain).filter((m) => !degradedIds.has(m.id));
    }

    return activeChain;
  } catch (err) {
    logger.error("[ModelRouter] Error fetching dynamic routing chain, falling back", {
      error: err,
    });
    return getFallbackChain(domain);
  }
}

function getFallbackChain(domain: TaskDomain): ModelChainItem[] {
  switch (domain) {
    case "math_logic":
      return [...FALLBACK_MATH_LOGIC];
    case "creative_copy":
      return [...FALLBACK_CREATIVE_COPY];
    case "risk_audit":
      return [...FALLBACK_RISK_AUDIT];
    case "fast_triage":
      return [...FALLBACK_FAST_TRIAGE];
    case "code_generation":
      return getEscalationFreeTier().filter(
        (m) =>
          m.id === "opencode/deepseek-v4-flash-free" || m.id === "opencode/nemotron-3-ultra-free",
      );
    case "ethics_audit":
      return getEscalationFreeTier().filter(
        (m) =>
          m.id === "meta-llama/Llama-3.3-70B-Instruct" || m.id === "opencode/nemotron-3-ultra-free",
      );
    default:
      return [...FALLBACK_FAST_TRIAGE];
  }
}

/**
 * Multi-slot cross-audit selector (Legacy/Triage compatibility)
 */
export async function selectModelTier(params: {
  title: string;
  description: string;
  severity: string;
  severityScore?: number;
  auditTier?: ModelTier;
}): Promise<ModelRouterResult> {
  const auditTier = params.auditTier || "basic";

  if (auditTier === "none") {
    return { tier: "none", slot1Chain: [], slot2Chain: [], slot3Chain: [], supremeChain: [] };
  }

  const length = (params.title || "").length + (params.description || "").length;
  const isShort = length < 1200;
  const isHighRisk = params.severity === "critical" || params.severity === "high";

  const useDeep = auditTier === "deep" || !isShort || isHighRisk;

  if (!useDeep) {
    // For BASIC tier, we leverage different capabilities for a diverse cross-audit
    return {
      tier: "basic",
      slot1Chain: await selectModelByCapability("fast_triage"),
      slot2Chain: await selectModelByCapability("creative_copy"),
      slot3Chain: await selectModelByCapability("math_logic"),
      supremeChain: await selectModelByCapability("risk_audit"),
    };
  }

  // For DEEP tier, we rely heavily on the Risk Audit (Premium) chain
  const riskAuditChain = await selectModelByCapability("risk_audit");
  return {
    tier: "deep",
    slot1Chain: [...riskAuditChain],
    slot2Chain: [...riskAuditChain],
    slot3Chain: [...riskAuditChain],
    supremeChain: [...riskAuditChain],
  };
}

/**
 * Tier escalation chain: free tier first (nemotron-ultra-free, deepseek-v4-flash-free).
 * If every free-tier model is DEGRADED, escalate to the paid tier (deepseek-v4-pro).
 */
export async function selectModelWithEscalation(): Promise<EscalationResult> {
  const degradedIds = await fetchDegradedModelIds();

  const freeChain = getEscalationFreeTier().filter((m) => !degradedIds.has(m.id));
  if (freeChain.length > 0) {
    return { chain: freeChain, escalated: false };
  }

  logger.warn("[ModelRouter] All free-tier escalation models DEGRADED, escalating to paid tier", {
    degradedIds: [...degradedIds],
  });
  return { chain: [...getEscalationPaidTier()], escalated: true };
}

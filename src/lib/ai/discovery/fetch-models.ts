import { createAdminClient } from "@/lib/supabase/admin";

export interface OpenRouterModel {
  id: string;
  name: string;
  context_length?: number;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
}

export interface FreeModelRecord {
  id: string;
  name: string;
  provider: string;
  context_length: number;
  pricing_prompt: number;
  pricing_completion: number;
  is_active: boolean;
  last_checked_at: string;
}

export const FALLBACK_FREE_MODELS: FreeModelRecord[] = [
  {
    id: "google/gemini-2.5-flash",
    name: "Google: Gemini 2.5 Flash",
    provider: "Google",
    context_length: 1000000,
    pricing_prompt: 0,
    pricing_completion: 0,
    is_active: true,
    last_checked_at: new Date().toISOString(),
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Meta: Llama 3.3 70B Instruct (free)",
    provider: "Meta",
    context_length: 131072,
    pricing_prompt: 0,
    pricing_completion: 0,
    is_active: true,
    last_checked_at: new Date().toISOString(),
  },
  {
    id: "mistralai/mistral-nemo:free",
    name: "Mistral: Mistral Nemo (free)",
    provider: "Mistral",
    context_length: 128000,
    pricing_prompt: 0,
    pricing_completion: 0,
    is_active: true,
    last_checked_at: new Date().toISOString(),
  },
  {
    id: "qwen/qwen-2.5-coder-32b-instruct:free",
    name: "Qwen: Qwen 2.5 Coder 32B (free)",
    provider: "Qwen",
    context_length: 32768,
    pricing_prompt: 0,
    pricing_completion: 0,
    is_active: true,
    last_checked_at: new Date().toISOString(),
  },
];

export const MULTI_PROVIDER_STATIC_MODELS: FreeModelRecord[] = [
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "Google",
    context_length: 1000000,
    pricing_prompt: 0,
    pricing_completion: 0,
    is_active: true,
    last_checked_at: new Date().toISOString(),
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    context_length: 2000000,
    pricing_prompt: 0,
    pricing_completion: 0,
    is_active: true,
    last_checked_at: new Date().toISOString(),
  },
  {
    id: "nvidia/llama-3.1-nemotron-70b-instruct",
    name: "Llama 3.1 Nemotron 70B",
    provider: "Nvidia",
    context_length: 131072,
    pricing_prompt: 0,
    pricing_completion: 0,
    is_active: true,
    last_checked_at: new Date().toISOString(),
  },
  {
    id: "command-r",
    name: "Command R",
    provider: "Cohere",
    context_length: 128000,
    pricing_prompt: 0,
    pricing_completion: 0,
    is_active: true,
    last_checked_at: new Date().toISOString(),
  },
  {
    id: "command-r-plus",
    name: "Command R+",
    provider: "Cohere",
    context_length: 128000,
    pricing_prompt: 0,
    pricing_completion: 0,
    is_active: true,
    last_checked_at: new Date().toISOString(),
  },
  {
    id: "blackboxai",
    name: "Blackbox AI",
    provider: "Blackbox",
    context_length: 32768,
    pricing_prompt: 0,
    pricing_completion: 0,
    is_active: true,
    last_checked_at: new Date().toISOString(),
  },
  {
    id: "meta-llama/Llama-3.3-70B-Instruct",
    name: "Llama 3.3 70B",
    provider: "HuggingFace",
    context_length: 131072,
    pricing_prompt: 0,
    pricing_completion: 0,
    is_active: true,
    last_checked_at: new Date().toISOString(),
  },
];

export async function discoverFreeModels(): Promise<FreeModelRecord[]> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "HTTP-Referer": "https://alparai.com",
        "X-Title": "ALPAR AI",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return FALLBACK_FREE_MODELS;
    }

    const json = (await response.json()) as { data?: OpenRouterModel[] };
    const models = json.data ?? [];

    const freeModels: FreeModelRecord[] = models
      .filter((m) => m.pricing?.prompt === "0" || m.id.endsWith(":free"))
      .map((m) => {
        const providerName = m.id.split("/")[0] ?? "Unknown";
        return {
          id: m.id,
          name: m.name,
          provider: providerName.charAt(0).toUpperCase() + providerName.slice(1),
          context_length: m.context_length ?? 0,
          pricing_prompt: 0,
          pricing_completion: Number(m.pricing?.completion ?? 0),
          is_active: true,
          last_checked_at: new Date().toISOString(),
        };
      });

    if (freeModels.length === 0) {
      return [...FALLBACK_FREE_MODELS, ...MULTI_PROVIDER_STATIC_MODELS];
    }

    const combinedModels = [...freeModels, ...MULTI_PROVIDER_STATIC_MODELS];

    try {
      const supabase = createAdminClient();
      await supabase
        .from("ai_free_models" as unknown as "incidents")
        .upsert(combinedModels as unknown as never[], { onConflict: "id" } as never);
    } catch {
      // Non-blocking DB write failure
    }

    return combinedModels;
  } catch {
    return [...FALLBACK_FREE_MODELS, ...MULTI_PROVIDER_STATIC_MODELS];
  }
}

export async function discoverAllModels(): Promise<FreeModelRecord[]> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "HTTP-Referer": "https://alparai.com",
        "X-Title": "ALPAR AI",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return [...FALLBACK_FREE_MODELS, ...MULTI_PROVIDER_STATIC_MODELS];
    }

    const json = (await response.json()) as { data?: OpenRouterModel[] };
    const models = json.data ?? [];

    const allModels: FreeModelRecord[] = models.map((m) => {
      const providerName = m.id.split("/")[0] ?? "Unknown";
      return {
        id: m.id,
        name: m.name,
        provider: providerName.charAt(0).toUpperCase() + providerName.slice(1),
        context_length: m.context_length ?? 0,
        pricing_prompt: Number(m.pricing?.prompt ?? 0),
        pricing_completion: Number(m.pricing?.completion ?? 0),
        is_active: true,
        last_checked_at: new Date().toISOString(),
      };
    });

    const combinedModels = [...allModels, ...MULTI_PROVIDER_STATIC_MODELS];
    return combinedModels.length > 0
      ? combinedModels
      : [...FALLBACK_FREE_MODELS, ...MULTI_PROVIDER_STATIC_MODELS];
  } catch {
    return [...FALLBACK_FREE_MODELS, ...MULTI_PROVIDER_STATIC_MODELS];
  }
}

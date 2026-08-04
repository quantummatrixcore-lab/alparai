import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  discoverFreeModels,
  FALLBACK_FREE_MODELS,
  MULTI_PROVIDER_STATIC_MODELS,
} from "@/lib/ai/discovery/fetch-models";

describe("Free Models Discovery Engine", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("filters free models from OpenRouter API response", async () => {
    const mockApiResponse = {
      data: [
        {
          id: "meta-llama/llama-3-8b-instruct:free",
          name: "Meta: Llama 3 8B (free)",
          context_length: 8192,
          pricing: { prompt: "0", completion: "0" },
        },
        {
          id: "openai/gpt-4o",
          name: "OpenAI: GPT-4o",
          context_length: 128000,
          pricing: { prompt: "0.000005", completion: "0.000015" },
        },
      ],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      }),
    );

    const models = await discoverFreeModels();
    expect(models).toHaveLength(1 + MULTI_PROVIDER_STATIC_MODELS.length);
    expect(models[0]?.id).toBe("meta-llama/llama-3-8b-instruct:free");
    expect(models[0]?.pricing_prompt).toBe(0);
  });

  it("returns fallback models if fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));

    const models = await discoverFreeModels();
    expect(models).toEqual([...FALLBACK_FREE_MODELS, ...MULTI_PROVIDER_STATIC_MODELS]);
  });
});

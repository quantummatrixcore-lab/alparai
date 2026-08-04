import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { NvidiaNgcAdapter } from "@/lib/ai/adapters/nvidia-ngc";

const mockCreate = vi.fn();
vi.mock("openai", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    })),
  };
});

describe("NvidiaNgcAdapter", () => {
  beforeEach(() => {
    vi.stubEnv("NVIDIA_NGC_API_KEY", "mock-ngc-key");
    vi.clearAllMocks();
  });

  it("should successfully call NVIDIA NGC completions", async () => {
    mockCreate.mockResolvedValueOnce({
      model: "meta/llama-3.1-70b-instruct",
      choices: [{ message: { content: "NVIDIA NIM audit response" } }],
      usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
    });

    const adapter = new NvidiaNgcAdapter();
    const result = await adapter.call({
      model: {
        id: "meta/llama-3.1-70b-instruct",
        provider: "nvidia",
        tier: "premium",
        maxTokens: 4096,
      },
      systemPrompt: "System",
      userMessage: "User",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.content).toBe("NVIDIA NIM audit response");
      expect(result.data.usage.totalTokens).toBe(30);
    }
  });

  it("should fail gracefully if API key is missing", async () => {
    vi.stubEnv("NVIDIA_NGC_API_KEY", "");
    const adapter = new NvidiaNgcAdapter();
    const result = await adapter.call({
      model: {
        id: "meta/llama-3.1-70b-instruct",
        provider: "nvidia",
        tier: "premium",
        maxTokens: 4096,
      },
      systemPrompt: "System",
      userMessage: "User",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("no_api_key");
    }
  });
});

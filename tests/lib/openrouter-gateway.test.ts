/* eslint-disable */
import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

vi.hoisted(() => {
  vi.stubEnv("OPENROUTER_API_KEY", "test-key");
  vi.stubEnv("GOOGLE_API_KEY", "test-google-key");
});

// Mock the openai client
vi.mock("openai", () => {
  const mockCompletionsCreate = vi.fn();
  class MockOpenAI {
    chat = {
      completions: {
        create: mockCompletionsCreate,
      },
    };
    static RateLimitError = class RateLimitError extends Error {
      status = 429;
      constructor(...args: any[]) {
        super(args[2] || "Rate limit");
      }
    };
    static APIConnectionTimeoutError = class APIConnectionTimeoutError extends Error {
      constructor(...args: any[]) {
        super(typeof args[0] === "object" ? args[0]?.message : "Timeout");
      }
    };
    static APIError = class APIError extends Error {
      status = 500;
      constructor(...args: any[]) {
        super(args[2] || "API Error");
      }
    };
  }
  return {
    default: MockOpenAI,
    RateLimitError: MockOpenAI.RateLimitError,
    APIConnectionTimeoutError: MockOpenAI.APIConnectionTimeoutError,
    APIError: MockOpenAI.APIError,
  };
});

vi.mock("@/lib/utils/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import OpenAI from "openai";
vi.mock("@/lib/ai/cost-guard", () => ({
  isCostKillSwitchActive: vi.fn().mockResolvedValue(false),
  getDailyCost: vi.fn().mockResolvedValue(0),
}));
import { isCostKillSwitchActive, getDailyCost } from "@/lib/ai/cost-guard";
import { callModel, callWithFailover } from "@/lib/ai/openrouter-gateway";
import type { GatewayModel } from "@/lib/ai/types";

const openaiMock = new OpenAI() as any;

const MOCK_FREE_TRIAGE_MODELS: readonly GatewayModel[] = [
  { id: "deepseek/deepseek-chat", provider: "openrouter", tier: "free", maxTokens: 2048 },
  { id: "meta-llama/llama-3.3-70b:free", provider: "openrouter", tier: "free", maxTokens: 2048 },
  { id: "qwen/qwen-2.5-72b:free", provider: "openrouter", tier: "free", maxTokens: 2048 },
] as const;

describe("OpenRouter API Gateway", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("callModel", () => {
    it("returns successful response on valid API output", async () => {
      openaiMock.chat.completions.create.mockResolvedValueOnce({
        model: "deepseek/deepseek-chat",
        choices: [
          {
            message: {
              content: JSON.stringify({ score: 80 }),
            },
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25,
        },
      });

      const res = await callModel({
        systemPrompt: "system",
        userMessage: "user",
        model: MOCK_FREE_TRIAGE_MODELS[0]!,
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data.content).toContain("score");
        expect(res.data.usage.totalTokens).toBe(25);
      }
    });

    it("returns error on rate limit 429", async () => {
      openaiMock.chat.completions.create.mockRejectedValueOnce(
        new (OpenAI.RateLimitError as any)("Rate limit hit"),
      );

      const res = await callModel({
        systemPrompt: "system",
        userMessage: "user",
        model: MOCK_FREE_TRIAGE_MODELS[0]!,
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("rate_limit");
      }
    });

    it("returns error on timeout", async () => {
      openaiMock.chat.completions.create.mockRejectedValueOnce(
        new (OpenAI.APIConnectionTimeoutError as any)({ message: "Timeout occurred" }),
      );

      const res = await callModel({
        systemPrompt: "system",
        userMessage: "user",
        model: MOCK_FREE_TRIAGE_MODELS[0]!,
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("timeout");
      }
    });

    it("blocks calls when cost kill switch is active", async () => {
      vi.mocked(isCostKillSwitchActive).mockResolvedValueOnce(true);

      const res = await callModel({
        systemPrompt: "system",
        userMessage: "user",
        model: MOCK_FREE_TRIAGE_MODELS[0]!,
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("cost_kill_switch_active");
        expect(res.error.message).toContain("cost ceiling");
      }
    });
  });

  describe("callWithFailover", () => {
    it("succeeds on first model and does not retry", async () => {
      openaiMock.chat.completions.create.mockResolvedValueOnce({
        model: "deepseek/deepseek-chat",
        choices: [{ message: { content: "success 1" } }],
      });

      const res = await callWithFailover(
        {
          systemPrompt: "sys",
          userMessage: "usr",
        },
        MOCK_FREE_TRIAGE_MODELS,
      );

      expect(res.ok).toBe(true);
      expect(res.attemptedModels).toEqual(["openrouter:deepseek/deepseek-chat"]);
    });

    it("fails on first model with rate_limit, then succeeds on second", async () => {
      // First call (deepseek) fails with 429
      openaiMock.chat.completions.create.mockRejectedValueOnce(
        new (OpenAI.RateLimitError as any)("Rate limit"),
      );
      // Second call (llama) succeeds
      openaiMock.chat.completions.create.mockResolvedValueOnce({
        model: "meta-llama/llama-3.3-70b:free",
        choices: [{ message: { content: "success 2" } }],
      });

      const res = await callWithFailover(
        {
          systemPrompt: "sys",
          userMessage: "usr",
        },
        MOCK_FREE_TRIAGE_MODELS,
      );

      expect(res.ok).toBe(true);
      expect(res.attemptedModels).toEqual([
        "openrouter:deepseek/deepseek-chat",
        "openrouter:meta-llama/llama-3.3-70b:free",
      ]);
      if (res.ok) {
        expect(res.data.content).toBe("success 2");
      }
    });

    it("fails on all models when all are rate limited", async () => {
      openaiMock.chat.completions.create
        .mockRejectedValueOnce(new (OpenAI.RateLimitError as any)("Rate limit 1"))
        .mockRejectedValueOnce(new (OpenAI.RateLimitError as any)("Rate limit 2"))
        .mockRejectedValueOnce(new (OpenAI.RateLimitError as any)("Rate limit 3"));

      const res = await callWithFailover(
        {
          systemPrompt: "sys",
          userMessage: "usr",
        },
        MOCK_FREE_TRIAGE_MODELS,
      );

      expect(res.ok).toBe(false);
      expect(res.attemptedModels.length).toBe(3);
    });
  });

  describe("Cost Router Dynamic Fallback", () => {
    it("uses standard models when cost is normal", async () => {
      vi.mocked(getDailyCost).mockResolvedValueOnce(10.0); // normal
      openaiMock.chat.completions.create.mockResolvedValueOnce({
        model: "anthropic/claude-3.5-sonnet",
        choices: [{ message: { content: "normal-pro" } }],
      });

      const res = await callModel({
        systemPrompt: "sys",
        userMessage: "usr",
        model: {
          id: "anthropic/claude-3.5-sonnet",
          provider: "openrouter",
          tier: "premium",
          maxTokens: 4096,
        },
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data.content).toBe("normal-pro");
      }
    });

    it("downgrades to T1/T2 Flash models when cost > $30", async () => {
      vi.mocked(getDailyCost).mockResolvedValueOnce(35.0); // > $30

      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({
          choices: [
            {
              message: { content: "flash-fallback" },
            },
          ],
          candidates: [
            {
              content: {
                parts: [{ text: "flash-fallback" }],
              },
            },
          ],
          usage: { prompt_tokens: 5, completion_tokens: 10, total_tokens: 15 },
        }),
      }) as any;

      try {
        const res = await callModel({
          systemPrompt: "sys",
          userMessage: "usr",
          model: {
            id: "anthropic/claude-3.5-sonnet",
            provider: "openrouter",
            tier: "premium",
            maxTokens: 4096,
          },
        });

        expect(res.ok).toBe(true);
        if (res.ok) {
          expect(res.data.content).toBe("flash-fallback");
          expect(res.data.model).toBe("gemini-1.5-flash");
        }
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("downgrades failover chain to escalation models when cost > $45", async () => {
      vi.mocked(getDailyCost).mockResolvedValue(50.0); // > $45

      openaiMock.chat.completions.create.mockResolvedValueOnce({
        model: "opencode/deepseek-v4-flash-free",
        choices: [{ message: { content: "escalation-fallback" } }],
      });

      const res = await callWithFailover(
        {
          systemPrompt: "sys",
          userMessage: "usr",
        },
        [
          {
            id: "anthropic/claude-3.5-sonnet",
            provider: "openrouter",
            tier: "premium",
            maxTokens: 4096,
          },
        ],
      );

      expect(res.ok).toBe(true);
      expect(res.attemptedModels[0]).toContain("openrouter:opencode/deepseek-v4-flash-free");
    });
  });
});

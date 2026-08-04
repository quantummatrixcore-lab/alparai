/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock resolveApiKey using hoisted mock
const { mockResolveApiKey } = vi.hoisted(() => ({
  mockResolveApiKey: vi.fn(),
}));

vi.mock("@/lib/ai/api-keys", () => ({
  resolveApiKey: mockResolveApiKey,
}));

// Mock logger to avoid spamming test output
vi.mock("@/lib/utils/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock OpenAI client
const mockCompletionsCreate = vi.fn();
vi.mock("openai", () => {
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

import { CohereAdapter } from "@/lib/ai/adapters/cohere";
import { GoogleAdapter } from "@/lib/ai/adapters/google";
import { HuggingFaceAdapter } from "@/lib/ai/adapters/huggingface";
import { BlackboxAdapter } from "@/lib/ai/adapters/blackbox";
import { NvidiaNgcAdapter } from "@/lib/ai/adapters/nvidia-ngc";
import OpenAI from "openai";

describe("AI Adapters", () => {
  const mockRequest = {
    model: {
      id: "test-model-id",
      provider: "test-provider",
      tier: "free" as const,
      maxTokens: 100,
    },
    systemPrompt: "System instruction",
    userMessage: "Hello AI",
    temperature: 0.5,
  };

  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("CohereAdapter", () => {
    const adapter = new CohereAdapter();

    it("should return true for isConfigured", async () => {
      process.env.COHERE_API_KEY = "test-key";
      mockResolveApiKey.mockResolvedValue("test-key");
      expect(await adapter.isConfigured()).toBe(true);
      delete process.env.COHERE_API_KEY;
    });

    it("should return no_api_key error when API key is missing", async () => {
      mockResolveApiKey.mockResolvedValue(null);

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("no_api_key");
        expect(result.error.message).toContain("COHERE_API_KEY");
      }
    });

    it("should return ok and content on successful call", async () => {
      mockResolveApiKey.mockResolvedValue("mock-cohere-key");

      const mockResponseData = {
        message: {
          content: "Hello back from Cohere",
        },
        usage: {
          tokens: {
            input_tokens: 10,
            output_tokens: 15,
          },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponseData,
      });

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.content).toBe("Hello back from Cohere");
        expect(result.data.usage.promptTokens).toBe(10);
        expect(result.data.usage.completionTokens).toBe(15);
        expect(result.data.usage.totalTokens).toBe(25);
      }
    });

    it("should handle content as an array of parts", async () => {
      mockResolveApiKey.mockResolvedValue("mock-cohere-key");

      const mockResponseData = {
        message: {
          content: [{ text: "Hello " }, { text: "world" }],
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponseData,
      });

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.content).toBe("Hello world");
      }
    });

    it("should return rate_limit error on status 429", async () => {
      mockResolveApiKey.mockResolvedValue("mock-cohere-key");

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
      });

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("rate_limit");
        expect(result.error.statusCode).toBe(429);
      }
    });

    it("should return api_error on other error status codes", async () => {
      mockResolveApiKey.mockResolvedValue("mock-cohere-key");

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("api_error");
        expect(result.error.statusCode).toBe(500);
      }
    });

    it("should return api_error if returned content is empty", async () => {
      mockResolveApiKey.mockResolvedValue("mock-cohere-key");

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ message: { content: "" } }),
      });

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("api_error");
        expect(result.error.message).toContain("empty");
      }
    });

    it("should return timeout error when request is aborted", async () => {
      mockResolveApiKey.mockResolvedValue("mock-cohere-key");

      global.fetch = vi
        .fn()
        .mockRejectedValue(new DOMException("The user aborted a request.", "AbortError"));

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("timeout");
      }
    });
  });

  describe("GoogleAdapter", () => {
    const adapter = new GoogleAdapter();

    it("should return true for isConfigured", async () => {
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
      mockResolveApiKey.mockResolvedValue("test-key");
      expect(await adapter.isConfigured()).toBe(true);
      delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    });

    it("should return no_api_key error when API key is missing", async () => {
      mockResolveApiKey.mockResolvedValue(null);

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("no_api_key");
        expect(result.error.message).toContain("GOOGLE_API_KEY");
      }
    });

    it("should return ok and content on successful call", async () => {
      mockResolveApiKey.mockResolvedValue("mock-google-key");

      const mockResponseData = {
        candidates: [
          {
            content: {
              parts: [{ text: "Hello back from Gemini" }],
            },
          },
        ],
        usageMetadata: {
          promptTokenCount: 12,
          candidatesTokenCount: 18,
          totalTokenCount: 30,
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponseData,
      });

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.content).toBe("Hello back from Gemini");
        expect(result.data.usage.promptTokens).toBe(12);
        expect(result.data.usage.completionTokens).toBe(18);
        expect(result.data.usage.totalTokens).toBe(30);
      }
    });

    it("should handle response format json and system instruct mapping", async () => {
      mockResolveApiKey.mockResolvedValue("mock-google-key");

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "{}" }] } }],
        }),
      });

      const result = await adapter.call({
        ...mockRequest,
        responseFormat: "json",
      });

      expect(result.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("generateContent"),
        expect.objectContaining({
          body: expect.stringContaining("responseMimeType"),
        }),
      );
    });

    it("should return rate_limit error on status 429", async () => {
      mockResolveApiKey.mockResolvedValue("mock-google-key");

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
      });

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("rate_limit");
      }
    });

    it("should return api_error on other error status codes", async () => {
      mockResolveApiKey.mockResolvedValue("mock-google-key");

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: async () => "Internal Server Error",
      });

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("api_error");
        expect(result.error.statusCode).toBe(500);
      }
    });

    it("should return api_error if returned content is empty", async () => {
      mockResolveApiKey.mockResolvedValue("mock-google-key");

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("api_error");
        expect(result.error.message).toContain("empty response content");
      }
    });

    it("should return timeout error when request is aborted", async () => {
      mockResolveApiKey.mockResolvedValue("mock-google-key");

      global.fetch = vi
        .fn()
        .mockRejectedValue(new DOMException("The user aborted a request.", "AbortError"));

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("timeout");
      }
    });

    it("should return api_error on generic fetch failure", async () => {
      mockResolveApiKey.mockResolvedValue("mock-google-key");

      global.fetch = vi.fn().mockRejectedValue(new Error("Network Error"));

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("api_error");
        expect(result.error.message).toBe("Network Error");
      }
    });
  });

  describe("HuggingFaceAdapter", () => {
    const adapter = new HuggingFaceAdapter();

    it("should return true for isConfigured", async () => {
      process.env.HUGGINGFACE_API_KEY = "test-key";
      mockResolveApiKey.mockResolvedValue("test-key");
      expect(await adapter.isConfigured()).toBe(true);
      delete process.env.HUGGINGFACE_API_KEY;
    });

    it("should return no_api_key error when API key is missing", async () => {
      mockResolveApiKey.mockResolvedValue(null);

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("no_api_key");
      }
    });

    it("should return ok and content on successful call", async () => {
      mockResolveApiKey.mockResolvedValue("mock-hf-key");

      const mockResponseData = {
        choices: [
          {
            message: {
              content: "Hello back from HuggingFace",
            },
          },
        ],
        usage: {
          prompt_tokens: 8,
          completion_tokens: 12,
          total_tokens: 20,
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponseData,
      });

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.content).toBe("Hello back from HuggingFace");
        expect(result.data.usage.promptTokens).toBe(8);
        expect(result.data.usage.completionTokens).toBe(12);
        expect(result.data.usage.totalTokens).toBe(20);
      }
    });

    it("should return rate_limit/loading error on status 503", async () => {
      mockResolveApiKey.mockResolvedValue("mock-hf-key");

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      });

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("rate_limit");
        expect(result.error.statusCode).toBe(503);
        expect(result.error.message).toContain("currently loading");
      }
    });

    it("should return rate_limit error on status 429", async () => {
      mockResolveApiKey.mockResolvedValue("mock-hf-key");

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
      });

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("rate_limit");
        expect(result.error.statusCode).toBe(429);
      }
    });

    it("should return api_error on other error status codes", async () => {
      mockResolveApiKey.mockResolvedValue("mock-hf-key");

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("api_error");
        expect(result.error.statusCode).toBe(500);
      }
    });

    it("should return api_error if returned content is empty", async () => {
      mockResolveApiKey.mockResolvedValue("mock-hf-key");

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("api_error");
        expect(result.error.message).toContain("empty response content");
      }
    });

    it("should return timeout error when request is aborted", async () => {
      mockResolveApiKey.mockResolvedValue("mock-hf-key");

      global.fetch = vi
        .fn()
        .mockRejectedValue(new DOMException("The user aborted a request.", "AbortError"));

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("timeout");
      }
    });

    it("should return api_error on generic fetch failure", async () => {
      mockResolveApiKey.mockResolvedValue("mock-hf-key");

      global.fetch = vi.fn().mockRejectedValue(new Error("Network Error"));

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("api_error");
        expect(result.error.message).toBe("Network Error");
      }
    });
  });

  describe("BlackboxAdapter", () => {
    const adapter = new BlackboxAdapter();

    it("should return true for isConfigured", async () => {
      process.env.BLACKBOX_API_KEY = "test-key";
      mockResolveApiKey.mockResolvedValue("test-key");
      expect(await adapter.isConfigured()).toBe(true);
      delete process.env.BLACKBOX_API_KEY;
    });

    it("should return no_api_key error when API key is missing", async () => {
      mockResolveApiKey.mockResolvedValue(null);

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("no_api_key");
        expect(result.error.message).toContain("BLACKBOX_API_KEY");
      }
    });

    it("should return ok and content on successful call", async () => {
      mockResolveApiKey.mockResolvedValue("mock-blackbox-key");

      mockCompletionsCreate.mockResolvedValueOnce({
        model: "blackboxai",
        choices: [
          {
            message: {
              content: "Hello back from Blackbox AI",
            },
          },
        ],
        usage: {
          prompt_tokens: 15,
          completion_tokens: 20,
          total_tokens: 35,
        },
      });

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.content).toBe("Hello back from Blackbox AI");
        expect(result.data.usage.promptTokens).toBe(15);
        expect(result.data.usage.completionTokens).toBe(20);
        expect(result.data.usage.totalTokens).toBe(35);
      }
    });

    it("should return rate_limit error when rate limited", async () => {
      mockResolveApiKey.mockResolvedValue("mock-blackbox-key");

      mockCompletionsCreate.mockRejectedValueOnce(
        new (OpenAI.RateLimitError as any)("Rate limit hit"),
      );

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("rate_limit");
      }
    });

    it("should return timeout error when request times out", async () => {
      mockResolveApiKey.mockResolvedValue("mock-blackbox-key");

      mockCompletionsCreate.mockRejectedValueOnce(
        new (OpenAI.APIConnectionTimeoutError as any)({ message: "Timeout occurred" }),
      );

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("timeout");
      }
    });

    it("should return api_error on other API error", async () => {
      mockResolveApiKey.mockResolvedValue("mock-blackbox-key");

      mockCompletionsCreate.mockRejectedValueOnce(
        new (OpenAI.APIError as any)("API Error status 500"),
      );

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("api_error");
        expect(result.error.statusCode).toBe(500);
      }
    });
  });

  describe("NvidiaNgcAdapter", () => {
    const adapter = new NvidiaNgcAdapter();

    it("should return true for isConfigured", async () => {
      process.env.NVIDIA_NGC_API_KEY = "test-key";
      mockResolveApiKey.mockResolvedValue("test-key");
      expect(await adapter.isConfigured()).toBe(true);
      delete process.env.NVIDIA_NGC_API_KEY;
    });

    it("should return no_api_key error when API key is missing", async () => {
      mockResolveApiKey.mockResolvedValue(null);

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("no_api_key");
        expect(result.error.message).toContain("NVIDIA_NGC_API_KEY");
      }
    });

    it("should return ok and content on successful call", async () => {
      mockResolveApiKey.mockResolvedValue("mock-nvidia-key");

      mockCompletionsCreate.mockResolvedValueOnce({
        model: "nvidia-model",
        choices: [
          {
            message: {
              content: "Hello back from NVIDIA NGC",
            },
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25,
        },
      });

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.content).toBe("Hello back from NVIDIA NGC");
        expect(result.data.usage.promptTokens).toBe(10);
        expect(result.data.usage.completionTokens).toBe(15);
        expect(result.data.usage.totalTokens).toBe(25);
      }
    });

    it("should return rate_limit error when rate limited", async () => {
      mockResolveApiKey.mockResolvedValue("mock-nvidia-key");

      mockCompletionsCreate.mockRejectedValueOnce(
        new (OpenAI.RateLimitError as any)("Rate limit hit"),
      );

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("rate_limit");
      }
    });

    it("should return timeout error when request times out", async () => {
      mockResolveApiKey.mockResolvedValue("mock-nvidia-key");

      mockCompletionsCreate.mockRejectedValueOnce(
        new (OpenAI.APIConnectionTimeoutError as any)({ message: "Timeout occurred" }),
      );

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("timeout");
      }
    });

    it("should return api_error on other API error", async () => {
      mockResolveApiKey.mockResolvedValue("mock-nvidia-key");

      mockCompletionsCreate.mockRejectedValueOnce(
        new (OpenAI.APIError as any)("API Error status 500"),
      );

      const result = await adapter.call(mockRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("api_error");
        expect(result.error.statusCode).toBe(500);
      }
    });
  });
});

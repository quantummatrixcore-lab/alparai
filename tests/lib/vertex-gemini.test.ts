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

// Mock logger
vi.mock("@/lib/utils/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

import { VertexGeminiAdapter } from "@/lib/ai/adapters/vertex-gemini";

describe("VertexGeminiAdapter", () => {
  const adapter = new VertexGeminiAdapter();
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should return true for isConfigured", async () => {
    process.env.VERTEX_API_KEY = "test-key";
    mockResolveApiKey.mockResolvedValue("test-key");
    expect(await adapter.isConfigured()).toBe(true);
    delete process.env.VERTEX_API_KEY;
  });

  it("should return error when API key is missing", async () => {
    mockResolveApiKey.mockResolvedValue(null);

    const result = await adapter.generateJson("prompt");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Google Vertex key is not configured.");
    }
  });

  it("should generate JSON successfully", async () => {
    mockResolveApiKey.mockResolvedValue("mock-vertex-key");

    const mockResponseData = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: '{"result": "success"}',
              },
            ],
          },
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponseData,
    });

    const result = await adapter.generateJson("prompt");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({ result: "success" });
    }
  });

  it("should handle HTTP error status correctly", async () => {
    mockResolveApiKey.mockResolvedValue("mock-vertex-key");

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: async () => "Internal Server Error Detail",
    });

    const result = await adapter.generateJson("prompt");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Vertex Gemini API error: 500");
    }
  });
});

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

import { VertexImagenAdapter } from "@/lib/ai/adapters/vertex-imagen";

describe("VertexImagenAdapter", () => {
  const adapter = new VertexImagenAdapter();
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

    const result = await adapter.generateImage("A cute cat");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Google Vertex key is not configured.");
    }
  });

  it("should generate image successfully", async () => {
    mockResolveApiKey.mockResolvedValue("mock-vertex-key");

    const mockResponseData = {
      predictions: [
        {
          bytesBase64Encoded: "base64encodedimagedata",
          mimeType: "image/jpeg",
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponseData,
    });

    const result = await adapter.generateImage("A cute cat");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.base64).toBe("base64encodedimagedata");
      expect(result.mimeType).toBe("image/jpeg");
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

    const result = await adapter.generateImage("A cute cat");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Vertex Imagen API error: 500");
    }
  });

  it("should handle empty predictions payload gracefully", async () => {
    mockResolveApiKey.mockResolvedValue("mock-vertex-key");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    const result = await adapter.generateImage("A cute cat");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("API did not return base64 image data.");
    }
  });
});

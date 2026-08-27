/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

const resolveApiKeyMock = vi.fn().mockResolvedValue("test-key");
vi.mock("@/lib/ai/api-keys", () => ({
  resolveApiKey: () => resolveApiKeyMock(),
}));

import { VertexVeoAdapter } from "@/lib/ai/adapters/vertex-veo";

describe("VertexVeoAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveApiKeyMock.mockResolvedValue("test-key");
  });

  it("returns error when API key is missing", async () => {
    resolveApiKeyMock.mockResolvedValue(null);
    const adapter = new VertexVeoAdapter();
    const res = await adapter.generateVideo("A futuristic shield");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain("Google Vertex key is not configured");
    }
  });

  it("handles successful video generation", async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          predictions: [
            {
              bytesBase64Encoded: "bXA0LXZpZGVvLWJhc2U2NA==",
              mimeType: "video/mp4",
            },
          ],
        }),
    };

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(mockResponse as any);

    const adapter = new VertexVeoAdapter();
    const res = await adapter.generateVideo("A cinematic space battle", "16:9", 5);

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.base64).toBe("bXA0LXZpZGVvLWJhc2U2NA==");
      expect(res.mimeType).toBe("video/mp4");
    }
    expect(fetchSpy).toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

const mockAdminUser = { id: "admin-123", role: "admin" };

const requireAdminMock = vi.fn().mockResolvedValue(mockAdminUser);
vi.mock("@/lib/auth/session", () => ({
  requireAdmin: () => requireAdminMock(),
}));

const mockUpload = vi.fn().mockResolvedValue({ error: null });
const mockGetPublicUrl = vi
  .fn()
  .mockReturnValue({ data: { publicUrl: "https://mock-storage.com/asset.jpg" } });
const mockUpdate = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockResolvedValue({ error: null });

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    storage: {
      from: () => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }),
    },
    from: () => ({
      update: mockUpdate,
      eq: mockEq,
    }),
  }),
}));

const mockGenerateImage = vi.fn().mockResolvedValue({
  ok: true,
  base64: "dGVzdC1iYXNlNjQ=",
  mimeType: "image/jpeg",
});

vi.mock("@/lib/ai/adapters/vertex-imagen", () => ({
  VertexImagenAdapter: vi.fn().mockImplementation(() => ({
    generateImage: mockGenerateImage,
  })),
}));

import { generateSocialImageAction } from "@/actions/social-image";

describe("generateSocialImageAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminMock.mockResolvedValue(mockAdminUser);
    mockUpload.mockResolvedValue({ error: null });
    mockEq.mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockGenerateImage.mockResolvedValue({
      ok: true,
      base64: "dGVzdC1iYXNlNjQ=",
      mimeType: "image/jpeg",
    });
  });

  it("should fail when unauthorized", async () => {
    requireAdminMock.mockRejectedValue(new Error("Unauthorized"));
    const res = await generateSocialImageAction("post-1", "Generate prompt");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe("Unauthorized");
    }
  });

  it("should fail if params are missing", async () => {
    const res = await generateSocialImageAction("", "");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain("Post ID and Prompt are required.");
    }
  });

  it("should handle failure from VertexImagenAdapter", async () => {
    mockGenerateImage.mockResolvedValue({ ok: false, error: "Adapter error" });

    const res = await generateSocialImageAction("post-1", "Generate prompt");

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe("Adapter error");
    }
  });

  it("should handle storage upload errors gracefully", async () => {
    mockUpload.mockResolvedValue({ error: new Error("Upload failed") });

    const res = await generateSocialImageAction("post-1", "Generate prompt");

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain("Storage upload failed: Upload failed");
    }
  });

  it("should handle database update errors gracefully", async () => {
    mockEq.mockResolvedValue({ error: new Error("DB error") });

    const res = await generateSocialImageAction("post-1", "Generate prompt");

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain("Database update failed: DB error");
    }
  });

  it("should generate and upload image, then update DB successfully", async () => {
    const res = await generateSocialImageAction("post-1", "Generate prompt");

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.imageUrl).toBe("https://mock-storage.com/asset.jpg");
      expect(mockUpload).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalledWith({
        image_url: "https://mock-storage.com/asset.jpg",
        image_prompt: "Generate prompt",
      });
      expect(mockEq).toHaveBeenCalledWith("id", "post-1");
    }
  });
});

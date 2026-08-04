import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

const mockAdminUser = { id: "admin-123", role: "admin" };

const requireAdminMock = vi.fn().mockResolvedValue(mockAdminUser);
vi.mock("@/lib/auth/session", () => ({
  requireAdmin: () => requireAdminMock(),
}));

const mockSelect = vi.fn().mockReturnThis();
const mockOrder = vi.fn().mockResolvedValue({ data: [{ id: "post-1" }], error: null });
const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockUpdate = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockResolvedValue({ error: null });

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: () => ({
      select: mockSelect,
      order: mockOrder,
      insert: mockInsert,
      update: mockUpdate,
      eq: mockEq,
    }),
  }),
}));

vi.mock("@/lib/marketing/publishers/linkedin", () => ({
  publishToLinkedIn: vi.fn().mockResolvedValue({ success: true, shareId: "li-mock-123" }),
}));

import {
  getSocialPosts,
  getSocialTemplates,
  getSocialAssets,
  createSocialPost,
  updateSocialPost,
  getMarketingDrafts,
  publishDraftToLinkedInAction,
} from "@/actions/social";

describe("social actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminMock.mockResolvedValue(mockAdminUser);
    mockOrder.mockResolvedValue({ data: [{ id: "post-1" }], error: null });
    mockInsert.mockResolvedValue({ error: null });
    mockEq.mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ eq: mockEq });
  });

  it("getSocialPosts checks admin role and orders by created_at", async () => {
    const res = await getSocialPosts();
    expect(requireAdminMock).toHaveBeenCalled();
    expect(res).toEqual([{ id: "post-1" }]);
  });

  it("getSocialPosts throws on database error", async () => {
    mockOrder.mockResolvedValue({ data: null, error: new Error("DB error") });
    await expect(getSocialPosts()).rejects.toThrow("DB error");
  });

  it("getSocialTemplates returns templates ordered by name", async () => {
    mockOrder.mockResolvedValue({ data: [{ id: "temp-1", name: "A" }], error: null });
    const res = await getSocialTemplates();
    expect(res).toEqual([{ id: "temp-1", name: "A" }]);
  });

  it("getSocialTemplates throws on database error", async () => {
    mockOrder.mockResolvedValue({ data: null, error: new Error("DB error") });
    await expect(getSocialTemplates()).rejects.toThrow("DB error");
  });

  it("getSocialAssets returns assets ordered by created_at", async () => {
    mockOrder.mockResolvedValue({ data: [{ id: "asset-1" }], error: null });
    const res = await getSocialAssets();
    expect(res).toEqual([{ id: "asset-1" }]);
  });

  it("getSocialAssets throws on database error", async () => {
    mockOrder.mockResolvedValue({ data: null, error: new Error("DB error") });
    await expect(getSocialAssets()).rejects.toThrow("DB error");
  });

  it("createSocialPost inserts post with user id", async () => {
    const postPayload = {
      platform: "linkedin" as const,
      status: "draft" as const,
      content_type: "manifesto" as const,
      title: "Title",
      body_text: "Body",
    };
    const res = await createSocialPost(postPayload);
    expect(res.success).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith({
      ...postPayload,
      created_by: "admin-123",
    });
  });

  it("createSocialPost throws on database error", async () => {
    mockInsert.mockResolvedValue({ error: new Error("Insert failed") });
    await expect(
      createSocialPost({
        platform: "linkedin",
        status: "draft",
        content_type: "manifesto",
        title: "Title",
        body_text: "Body",
      }),
    ).rejects.toThrow("Insert failed");
  });

  it("updateSocialPost updates post properties and sets updated_at", async () => {
    const updates = { title: "New Title" };
    const res = await updateSocialPost("post-1", updates);
    expect(res.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      title: "New Title",
      updated_at: expect.any(String),
    });
    expect(mockEq).toHaveBeenCalledWith("id", "post-1");
  });

  it("updateSocialPost throws on database error", async () => {
    mockEq.mockResolvedValue({ error: new Error("Update failed") });
    await expect(updateSocialPost("post-1", { title: "New Title" })).rejects.toThrow(
      "Update failed",
    );
  });

  it("getMarketingDrafts fetches marketing drafts", async () => {
    mockOrder.mockResolvedValue({ data: [{ id: "draft-1", platform: "linkedin" }], error: null });
    const res = await getMarketingDrafts();
    expect(res).toEqual([{ id: "draft-1", platform: "linkedin" }]);
  });

  describe("publishDraftToLinkedInAction", () => {
    beforeEach(() => {
      vi.stubEnv("DISABLE_LINKEDIN_POSTING", "false");
    });

    it("should throw if disabled via env", async () => {
      vi.stubEnv("DISABLE_LINKEDIN_POSTING", "true");
      await expect(publishDraftToLinkedInAction("draft-1")).rejects.toThrow(
        "LinkedIn publishing is disabled.",
      );
    });

    it("should successfully publish draft and log audit trail", async () => {
      // Mock single draft fetch:
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: "draft-1",
          platform: "linkedin",
          content: "Test Content",
          status: "pending_approval",
        },
        error: null,
      });
      mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSingle,
        }),
      });

      const res = await publishDraftToLinkedInAction("draft-1");
      expect(res.success).toBe(true);

      // Verify draft status is updated to published:
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "published",
        }),
      );

      // Verify audit log insert:
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "social.publish_linkedin",
          entity_type: "marketing_draft",
          entity_id: "draft-1",
        }),
      );
    });
  });
});

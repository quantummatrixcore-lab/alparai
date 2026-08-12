import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

const mockUser = { id: "user-123", email: "user@example.com" };

const currentUserMock = vi.fn().mockResolvedValue(mockUser);
vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: () => currentUserMock(),
}));

const mockSingle = vi.fn().mockResolvedValue({ data: { id: "comment-123" }, error: null });
const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
const mockInsert = vi.fn().mockReturnThis();
const mockDelete = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();
const mockSelect = vi.fn().mockReturnThis();

const mockSupabaseChain = {
  select: mockSelect,
  insert: mockInsert,
  delete: mockDelete,
  eq: mockEq,
  single: () => mockSingle(),
  maybeSingle: () => mockMaybeSingle(),
};

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: () => mockSupabaseChain,
  }),
}));

vi.mock("@/lib/pii/guardian", () => ({
  maskPII: (text: string) => ({ masked: text.replace("secret", "[MASKED]") }),
}));

const rateLimitMock = vi.fn().mockResolvedValue({ ok: true });
vi.mock("@/lib/utils/rate-limit", () => ({
  checkRateLimit: () => rateLimitMock(),
  RATE_LIMIT_KEYS: {
    incident_comment: "incident_comment",
    incident_affected: "incident_affected",
  },
}));

import { submitComment, deleteComment, toggleAffectedStatus } from "@/actions/comments";

describe("comments actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserMock.mockResolvedValue(mockUser);
    rateLimitMock.mockResolvedValue({ ok: true });
    mockSingle.mockResolvedValue({ data: { id: "comment-123" }, error: null });
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockEq.mockReturnValue(mockSupabaseChain);
  });

  describe("submitComment", () => {
    it("returns error for unauthenticated user", async () => {
      currentUserMock.mockResolvedValue(null);
      const res = await submitComment("incident-123", "Nice post");
      expect(res.ok).toBe(false);
      expect(res.error).toContain("required");
    });

    it("returns error for short comment", async () => {
      const res = await submitComment("incident-123", "ab");
      expect(res.ok).toBe(false);
      expect(res.error).toContain("at least 3 characters");
    });

    it("returns error for too long comment", async () => {
      const longText = "a".repeat(1001);
      const res = await submitComment("incident-123", longText);
      expect(res.ok).toBe(false);
      expect(res.error).toContain("cannot exceed 1000 characters");
    });

    it("returns rate limit error when limited", async () => {
      rateLimitMock.mockResolvedValue({ ok: false, retryAfter: 60 });
      const res = await submitComment("incident-123", "Valid comment text");
      expect(res.ok).toBe(false);
      expect(res.error).toContain("Too many comments");
    });

    it("masks PII and inserts comment successfully", async () => {
      const res = await submitComment("incident-123", "This has secret info");
      expect(res.ok).toBe(true);
      expect(res.commentId).toBe("comment-123");
      expect(mockInsert).toHaveBeenCalledWith({
        incident_id: "incident-123",
        user_id: "user-123",
        comment_text: "This has [MASKED] info",
      });
    });

    it("handles database insert errors gracefully", async () => {
      mockSingle.mockResolvedValue({ data: null, error: new Error("DB error") });
      const res = await submitComment("incident-123", "Valid comment text");
      expect(res.ok).toBe(false);
      expect(res.error).toContain("Database error");
    });
  });

  describe("deleteComment", () => {
    it("returns unauthorized for unauthenticated user", async () => {
      currentUserMock.mockResolvedValue(null);
      const res = await deleteComment("comment-123", "incident-123");
      expect(res.ok).toBe(false);
      expect(res.error).toBe("Unauthorized");
    });

    it("deletes comment successfully", async () => {
      mockEq.mockResolvedValue({ error: null });
      const res = await deleteComment("comment-123", "incident-123");
      expect(res.ok).toBe(true);
    });

    it("handles database errors on deletion", async () => {
      mockEq.mockResolvedValue({ error: new Error("Failed to delete") });
      const res = await deleteComment("comment-123", "incident-123");
      expect(res.ok).toBe(false);
      expect(res.error).toBe("Failed to delete");
    });
  });

  describe("toggleAffectedStatus", () => {
    it("returns error for unauthenticated user", async () => {
      currentUserMock.mockResolvedValue(null);
      const res = await toggleAffectedStatus("incident-123");
      expect(res.ok).toBe(false);
      expect(res.error).toContain("required");
    });

    it("returns rate limit error when limited", async () => {
      rateLimitMock.mockResolvedValue({ ok: false, retryAfter: 30 });
      const res = await toggleAffectedStatus("incident-123");
      expect(res.ok).toBe(false);
      expect(res.error).toContain("Too many actions");
    });

    it("adds affected flag when not already flagged", async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });
      mockInsert.mockResolvedValue({ error: null });
      const res = await toggleAffectedStatus("incident-123");
      expect(res.ok).toBe(true);
      expect(res.affected).toBe(true);
    });

    it("removes affected flag when already flagged", async () => {
      mockMaybeSingle.mockResolvedValue({ data: { incident_id: "incident-123" }, error: null });
      const res = await toggleAffectedStatus("incident-123");
      expect(res.ok).toBe(true);
      expect(res.affected).toBe(false);
    });
  });
});

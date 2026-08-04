import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockSupabaseClient } from "../helpers/supabase-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/server", () => ({
    createServerClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    getCurrentUser: vi.fn(),
  }));
});

import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  submitChallengeVote,
  removeChallengeVote,
  submitChallengeSubmission,
} from "@/actions/challenges";

let mockSupabaseClient: ReturnType<typeof createMockSupabaseClient>;

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabaseClient = createMockSupabaseClient();
  vi.mocked(createServerClient).mockResolvedValue(mockSupabaseClient as never);
});

describe("Challenges", () => {
  describe("submitChallengeVote", () => {
    it("submits a vote when signed in", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" } as never);
      mockSupabaseClient._mocks.mockInsertSelectSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await submitChallengeVote("sub-1");
      expect(result.ok).toBe(true);
    });

    it("returns error when not signed in", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null);

      const result = await submitChallengeVote("sub-1");
      expect(result.ok).toBe(false);
      expect(result.error).toContain("signed in");
    });

    it("handles duplicate vote", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" } as never);
      const mockInsert = vi.fn().mockReturnValue({
        then: vi.fn((onfulfilled: (v: { data: null; error: { code: string } }) => void) => {
          onfulfilled({ data: null, error: { code: "23505" } });
          return Promise.resolve({ data: null, error: { code: "23505" } });
        }),
      });
      mockSupabaseClient.from.mockReturnValue({ insert: mockInsert } as never);

      const result = await submitChallengeVote("sub-1");
      expect(result.ok).toBe(false);
      expect(result.error).toContain("already voted");
    });
  });

  describe("removeChallengeVote", () => {
    it("removes vote when signed in", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" } as never);
      mockSupabaseClient._mocks.mockDeleteInnerEq.mockResolvedValue({ error: null });

      const result = await removeChallengeVote("sub-1");
      expect(result.ok).toBe(true);
    });

    it("returns error when not signed in", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null);

      const result = await removeChallengeVote("sub-1");
      expect(result.ok).toBe(false);
    });
  });

  describe("submitChallengeSubmission", () => {
    function makeForm(overrides: Record<string, string> = {}): FormData {
      const fd = new FormData();
      Object.entries({
        title: "Valid Title",
        description: "Valid description with enough chars",
        ...overrides,
      }).forEach(([k, v]) => fd.append(k, v));
      return fd;
    }

    it("submits with valid data", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" } as never);
      mockSupabaseClient._mocks.mockInsertSelectSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await submitChallengeSubmission("ch-1", makeForm());
      expect(result.ok).toBe(true);
    });

    it("validates required fields", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" } as never);
      const result = await submitChallengeSubmission(
        "ch-1",
        makeForm({ title: "", description: "" }),
      );
      expect(result.ok).toBe(false);
      expect(result.fieldErrors).toBeDefined();
    });
  });
});

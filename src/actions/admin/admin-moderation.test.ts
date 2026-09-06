import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockDb = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn(),
};

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => mockDb),
}));

vi.mock("@/lib/auth/session", () => ({
  requireModerator: vi.fn(),
  requireAdmin: vi.fn(),
}));

vi.mock("@/lib/email/resend", () => ({
  getResendClient: vi.fn().mockReturnValue(null),
}));

vi.mock("@/lib/utils/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ ok: true }),
}));

vi.mock("@/lib/utils/hash", () => ({
  generateProviderToken: vi.fn().mockReturnValue("mock-token"),
}));

vi.mock("@/lib/utils/unsubscribe", () => ({
  generateEmailUnsubscribeToken: vi.fn().mockReturnValue("mock-unsub-token"),
}));

import { requireModerator } from "@/lib/auth/session";
import { moderateIncident } from "./moderation";

describe("Admin - Moderation Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("moderateIncident", () => {
    it("fails if not moderator", async () => {
      vi.mocked(requireModerator).mockRejectedValueOnce(new Error("Forbidden"));
      await expect(
        moderateIncident({
          incidentId: "inc-1",
          decision: "approve",
          moderationNote: "test",
        }),
      ).rejects.toThrow("Forbidden");
    });

    it("succeeds for valid moderation", async () => {
      vi.mocked(requireModerator).mockResolvedValueOnce({
        id: "mod-1",
        role: "moderator",
        email: "mod@test.com",
        fullName: "Test Moderator",
        avatarUrl: null,
        isVerified: true,
        createdAt: "2026-01-01T00:00:00Z",
      } as unknown as NonNullable<Awaited<ReturnType<typeof requireModerator>>>);

      mockDb.update.mockReturnValueOnce({
        eq: vi.fn().mockResolvedValueOnce({ error: null }),
      });
      mockDb.maybeSingle.mockResolvedValue({ data: null }); // incident fallback

      const res = await moderateIncident({
        incidentId: "inc-1",
        decision: "approve",
        moderationNote: "test",
      });

      expect(res.ok).toBe(true);
      expect(mockDb.update).toHaveBeenCalled();
    });
  });
});

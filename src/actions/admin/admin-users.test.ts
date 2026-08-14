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
  maybeSingle: vi.fn(),
};

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => mockDb),
}));

vi.mock("@/lib/auth/session", () => ({
  requireAdmin: vi.fn(),
}));

import { requireAdmin } from "@/lib/auth/session";
import { setUserRole, promoteUser } from "./users";

describe("Admin - Users Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("setUserRole", () => {
    it("fails if not admin", async () => {
      vi.mocked(requireAdmin).mockRejectedValueOnce(new Error("Forbidden"));
      await expect(setUserRole({ userId: "123", role: "moderator" })).rejects.toThrow("Forbidden");
    });

    it("fails if admin tries to set ceo role", async () => {
      vi.mocked(requireAdmin).mockResolvedValueOnce({
        id: "admin-1",
        role: "admin",
        email: "admin@test.com",
      } as unknown as NonNullable<Awaited<ReturnType<typeof requireAdmin>>>);
      const res = await setUserRole({ userId: "123", role: "ceo" });
      expect(res.ok).toBe(false);
      expect(res.error).toBe("Insufficient privileges to assign this role");
    });

    it("succeeds for valid role change by admin", async () => {
      vi.mocked(requireAdmin).mockResolvedValueOnce({
        id: "admin-1",
        role: "admin",
        email: "admin@test.com",
      } as unknown as NonNullable<Awaited<ReturnType<typeof requireAdmin>>>);

      mockDb.maybeSingle.mockResolvedValueOnce({
        data: { id: "123", role: "user", email: "test@test.com" },
      });
      mockDb.update.mockReturnValueOnce({
        eq: vi.fn().mockResolvedValueOnce({ error: null }),
      });
      mockDb.insert.mockResolvedValueOnce({ error: null });

      const res = await setUserRole({ userId: "123", role: "moderator" });

      expect(res.ok).toBe(true);
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalled(); // Audit log
    });
  });

  describe("promoteUser", () => {
    it("fails with invalid email", async () => {
      vi.mocked(requireAdmin).mockResolvedValueOnce({
        id: "ceo-1",
        role: "ceo",
        email: "ceo@test.com",
      } as unknown as NonNullable<Awaited<ReturnType<typeof requireAdmin>>>);
      const res = await promoteUser("not-an-email", "admin");
      expect(res.ok).toBe(false);
      expect(res.error).toBe("Invalid email");
    });

    it("succeeds if ceo promotes user to admin", async () => {
      vi.mocked(requireAdmin).mockResolvedValueOnce({
        id: "ceo-1",
        role: "ceo",
        email: "ceo@test.com",
      } as unknown as NonNullable<Awaited<ReturnType<typeof requireAdmin>>>);

      mockDb.maybeSingle.mockResolvedValueOnce({
        data: { id: "123", role: "user", email: "target@test.com" },
      });
      mockDb.update.mockReturnValueOnce({
        eq: vi.fn().mockResolvedValueOnce({ error: null }),
      });
      mockDb.insert.mockResolvedValueOnce({ error: null });

      const res = await promoteUser("target@test.com", "admin");

      expect(res.ok).toBe(true);
      expect(res.userId).toBe("123");
    });
  });
});

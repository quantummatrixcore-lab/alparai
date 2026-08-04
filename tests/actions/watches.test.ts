import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

const mockUser = { id: "user-123", email: "user@example.com" };

const requireUserMock = vi.fn().mockResolvedValue(mockUser);
const getCurrentUserMock = vi.fn().mockResolvedValue(mockUser);
vi.mock("@/lib/auth/session", () => ({
  requireUser: () => requireUserMock(),
  getCurrentUser: () => getCurrentUserMock(),
}));

const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockDelete = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();
const mockSelect = vi.fn().mockReturnThis();
const mockResolveEq = vi.fn().mockResolvedValue({ data: [{ provider_id: "google" }], error: null });

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: () => ({
      insert: mockInsert,
      delete: mockDelete,
      eq: mockEq,
      select: mockSelect,
    }),
  }),
}));

import { watchProvider, unwatchProvider, getWatchedProviders } from "@/actions/watches";

describe("watches actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue(mockUser);
    getCurrentUserMock.mockResolvedValue(mockUser);
    mockInsert.mockResolvedValue({ error: null });
    mockEq.mockResolvedValue({ error: null });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ eq: mockEq, delete: mockDelete, error: null });
    mockSelect.mockReturnValue({ eq: mockResolveEq });
    mockResolveEq.mockResolvedValue({ data: [{ provider_id: "google" }], error: null });
  });

  describe("watchProvider", () => {
    it("requires user and inserts a provider watch record", async () => {
      const res = await watchProvider("google");
      expect(requireUserMock).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: "user-123",
        provider_id: "google",
      });
      expect(res).toEqual({ success: true });
    });

    it("throws error on database insert failure", async () => {
      mockInsert.mockResolvedValue({ error: new Error("Insert failed") });
      await expect(watchProvider("google")).rejects.toThrow("Insert failed");
    });
  });

  describe("unwatchProvider", () => {
    it("requires user and deletes matching provider watch record", async () => {
      mockResolveEq.mockResolvedValue({ error: null });
      const res = await unwatchProvider("google");
      expect(requireUserMock).toHaveBeenCalled();
      expect(res).toEqual({ success: true });
    });

    it("throws error on database delete failure", async () => {
      // Setup the return chain mock to throw
      const badEq = vi.fn().mockResolvedValue({ error: new Error("Delete failed") });
      mockDelete.mockReturnValue({ eq: badEq });
      badEq.mockReturnValue({ eq: badEq, error: new Error("Delete failed") });
      mockEq.mockResolvedValue({ error: new Error("Delete failed") });

      await expect(unwatchProvider("google")).rejects.toThrow("Delete failed");
    });
  });

  describe("getWatchedProviders", () => {
    it("returns empty array if no user session is active", async () => {
      getCurrentUserMock.mockResolvedValue(null);
      const res = await getWatchedProviders();
      expect(res).toEqual([]);
    });

    it("returns array of provider ids watched by user", async () => {
      const res = await getWatchedProviders();
      expect(getCurrentUserMock).toHaveBeenCalled();
      expect(res).toEqual(["google"]);
    });

    it("throws error on database select failure", async () => {
      mockResolveEq.mockResolvedValue({ data: null, error: new Error("Select failed") });
      await expect(getWatchedProviders()).rejects.toThrow("Select failed");
    });
  });
});

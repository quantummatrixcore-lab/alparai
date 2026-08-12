import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

const mockUser = { id: "user-123", role: "admin" };
const mockCeo = { id: "user-ceo", role: "ceo" };
const mockRegularUser = { id: "user-regular", role: "user" };

const currentUserMock = vi.fn().mockResolvedValue(mockUser);
vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: () => currentUserMock(),
}));

const mockSelect = vi.fn().mockReturnThis();
const mockOrder = vi.fn().mockResolvedValue({
  data: [
    {
      provider: "google",
      api_key: "google-secret-key-123456",
      tier: "enterprise",
      client_type: "internal",
      created_at: "now",
      updated_at: "now",
    },
    {
      provider: "cohere",
      api_key: "short",
      tier: "developer",
      client_type: "internal",
      created_at: "now",
      updated_at: "now",
    },
  ],
  error: null,
});
const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockDelete = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockResolvedValue({ error: null });

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: mockSelect,
      order: mockOrder,
      upsert: mockUpsert,
      delete: mockDelete,
      eq: mockEq,
    }),
  }),
}));

import { getApiKeys, saveApiKey, deleteApiKey } from "@/actions/api-keys";

describe("api-keys actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserMock.mockResolvedValue(mockUser);
    mockOrder.mockResolvedValue({
      data: [
        {
          provider: "google",
          api_key: "google-secret-key-123456",
          tier: "enterprise",
          client_type: "internal",
          created_at: "now",
          updated_at: "now",
        },
        {
          provider: "cohere",
          api_key: "short",
          tier: "developer",
          client_type: "internal",
          created_at: "now",
          updated_at: "now",
        },
      ],
      error: null,
    });
    mockUpsert.mockResolvedValue({ error: null });
    mockEq.mockResolvedValue({ error: null });
  });

  describe("getApiKeys", () => {
    it("returns unauthorized for non-admin/ceo users", async () => {
      currentUserMock.mockResolvedValue(mockRegularUser);
      const res = await getApiKeys();
      expect(res.ok).toBe(false);
      expect(res.error).toBe("UNAUTHORIZED");
    });

    it("returns unauthorized when there is no user", async () => {
      currentUserMock.mockResolvedValue(null);
      const res = await getApiKeys();
      expect(res.ok).toBe(false);
      expect(res.error).toBe("UNAUTHORIZED");
    });

    it("returns masked api keys successfully for admin user", async () => {
      const res = await getApiKeys();
      expect(res.ok).toBe(true);
      expect(res.data).toBeDefined();
      expect(res.data?.[0]).toEqual({
        provider: "google",
        api_key: "goog••••3456",
        tier: "enterprise",
        client_type: "internal",
        created_at: "now",
        updated_at: "now",
      });
      expect(res.data?.[1]).toEqual({
        provider: "cohere",
        api_key: "••••",
        tier: "developer",
        client_type: "internal",
        created_at: "now",
        updated_at: "now",
      });
    });

    it("returns masked api keys successfully for ceo user", async () => {
      currentUserMock.mockResolvedValue(mockCeo);
      const res = await getApiKeys();
      expect(res.ok).toBe(true);
      expect(res.data).toBeDefined();
    });

    it("handles database errors gracefully", async () => {
      mockOrder.mockResolvedValue({ data: null, error: new Error("DB Error") });
      const res = await getApiKeys();
      expect(res.ok).toBe(false);
      expect(res.error).toBe("DB Error");
    });
  });

  describe("saveApiKey", () => {
    it("returns unauthorized for regular users", async () => {
      currentUserMock.mockResolvedValue(mockRegularUser);
      const res = await saveApiKey("google", "secret");
      expect(res.ok).toBe(false);
      expect(res.error).toBe("UNAUTHORIZED");
    });

    it("requires provider and api key", async () => {
      const res1 = await saveApiKey("", "secret");
      expect(res1.ok).toBe(false);
      const res2 = await saveApiKey("google", "");
      expect(res2.ok).toBe(false);
    });

    it("saves the key successfully for admin user", async () => {
      const res = await saveApiKey("Google", "new-key-12345");
      expect(res.ok).toBe(true);
      expect(mockUpsert).toHaveBeenCalledWith({
        provider: "google",
        api_key: "73c6c457c952bfb096c25d09e693437631a977f13f4cd1c44268932216d3c30d", // hashed using sha256
        tier: "developer",
        client_type: "external",
        updated_at: expect.any(String),
      });
    });

    it("handles database errors on upsert", async () => {
      mockUpsert.mockResolvedValue({ error: new Error("Upsert Failed") });
      const res = await saveApiKey("google", "secret");
      expect(res.ok).toBe(false);
      expect(res.error).toBe("Upsert Failed");
    });
  });

  describe("deleteApiKey", () => {
    it("returns unauthorized for regular users", async () => {
      currentUserMock.mockResolvedValue(mockRegularUser);
      const res = await deleteApiKey("google");
      expect(res.ok).toBe(false);
      expect(res.error).toBe("UNAUTHORIZED");
    });

    it("deletes the key successfully for admin user", async () => {
      const res = await deleteApiKey("Google");
      expect(res.ok).toBe(true);
      expect(mockEq).toHaveBeenCalledWith("provider", "google");
    });

    it("handles database errors on delete", async () => {
      mockEq.mockResolvedValue({ error: new Error("Delete Failed") });
      const res = await deleteApiKey("google");
      expect(res.ok).toBe(false);
      expect(res.error).toBe("Delete Failed");
    });
  });
});

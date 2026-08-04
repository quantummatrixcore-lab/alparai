import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock react cache
vi.mock("react", () => ({
  cache: <T>(fn: T): T => fn,
}));

// Mock supabase client
const mockGetUser = vi.fn();
const mockSingle = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();

const mockSupabaseClient = {
  auth: {
    getUser: mockGetUser,
  },
  from: mockFrom,
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => mockSupabaseClient),
}));

// Import after mocks are registered
import {
  getCurrentUser,
  isModerator,
  isAdmin,
  requireUser,
  requireModerator,
  requireAdmin,
} from "@/lib/auth/session";

describe("session auth helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up default fluent mock for supabase.from().select().eq().single()
    mockFrom.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });
  });

  describe("getCurrentUser", () => {
    it("should return null if user is not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const result = await getCurrentUser();
      expect(result).toBeNull();
    });

    it("should return null if user profile is not found", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-1", email: "test@example.com" } },
      });
      mockSingle.mockResolvedValue({ data: null });

      const result = await getCurrentUser();
      expect(result).toBeNull();
    });

    it("should return mapped SessionUser if user and profile exist", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-1", email: "test@example.com" } },
      });
      mockSingle.mockResolvedValue({
        data: {
          id: "user-1",
          full_name: "Test User",
          avatar_url: "http://avatar.jpg",
          role: "user",
          is_verified: true,
          created_at: "2026-06-24",
        },
      });

      const result = await getCurrentUser();
      expect(result).toEqual({
        id: "user-1",
        email: "test@example.com",
        fullName: "Test User",
        avatarUrl: "http://avatar.jpg",
        role: "user",
        isVerified: true,
        createdAt: "2026-06-24",
      });
      expect(mockFrom).toHaveBeenCalledWith("users");
      expect(mockSelect).toHaveBeenCalledWith(
        "id, full_name, avatar_url, role, is_verified, created_at",
      );
      expect(mockEq).toHaveBeenCalledWith("id", "user-1");
    });
  });

  describe("role checks", () => {
    it("isModerator should return true for moderator, admin, and ceo roles", async () => {
      // User role
      mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
      mockSingle.mockResolvedValue({ data: { id: "u1", role: "user" } });
      expect(await isModerator()).toBe(false);

      // Moderator role
      mockSingle.mockResolvedValue({ data: { id: "u1", role: "moderator" } });
      expect(await isModerator()).toBe(true);

      // Admin role
      mockSingle.mockResolvedValue({ data: { id: "u1", role: "admin" } });
      expect(await isModerator()).toBe(true);

      // CEO role
      mockSingle.mockResolvedValue({ data: { id: "u1", role: "ceo" } });
      expect(await isModerator()).toBe(true);

      // Unauthenticated
      mockGetUser.mockResolvedValue({ data: { user: null } });
      expect(await isModerator()).toBe(false);
    });

    it("isAdmin should return true only for admin and ceo roles", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });

      // Moderator role
      mockSingle.mockResolvedValue({ data: { id: "u1", role: "moderator" } });
      expect(await isAdmin()).toBe(false);

      // Admin role
      mockSingle.mockResolvedValue({ data: { id: "u1", role: "admin" } });
      expect(await isAdmin()).toBe(true);

      // CEO role
      mockSingle.mockResolvedValue({ data: { id: "u1", role: "ceo" } });
      expect(await isAdmin()).toBe(true);
    });
  });

  describe("require role decorators", () => {
    it("requireUser should throw UNAUTHORIZED if not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      await expect(requireUser()).rejects.toThrow("UNAUTHORIZED");
    });

    it("requireUser should return user if authenticated", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "u1", email: "test@example.com" } },
      });
      mockSingle.mockResolvedValue({ data: { id: "u1", role: "user" } });

      const result = await requireUser();
      expect(result.id).toBe("u1");
    });

    it("requireModerator should throw FORBIDDEN if user is not moderator/admin/ceo", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
      mockSingle.mockResolvedValue({ data: { id: "u1", role: "user" } });
      await expect(requireModerator()).rejects.toThrow("FORBIDDEN");
    });

    it("requireModerator should return user if moderator", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
      mockSingle.mockResolvedValue({ data: { id: "u1", role: "moderator" } });
      const result = await requireModerator();
      expect(result.id).toBe("u1");
    });

    it("requireAdmin should throw FORBIDDEN if user is not admin/ceo", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
      mockSingle.mockResolvedValue({ data: { id: "u1", role: "moderator" } });
      await expect(requireAdmin()).rejects.toThrow("FORBIDDEN");
    });

    it("requireAdmin should return user if admin or ceo", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
      mockSingle.mockResolvedValue({ data: { id: "u1", role: "admin" } });
      const result = await requireAdmin();
      expect(result.id).toBe("u1");
    });
  });
});

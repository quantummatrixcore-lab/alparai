import { describe, it, expect, vi, beforeEach } from "vitest";

// In-memory cookie store
const cookieJar = new Map<string, { value: string; options?: any }>();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => cookieJar.get(name),
    set: (name: string, value: string, options?: any) => {
      cookieJar.set(name, { value, options });
    },
    delete: (name: string) => {
      cookieJar.delete(name);
    },
  })),
}));

// Mock server-only
vi.mock("server-only", () => ({}));

// Import after mocks are registered
import {
  getCurrentUser,
  setSessionUser,
  isModerator,
  isAdmin,
  isCEO,
  requireUser,
  requireModerator,
  requireAdmin,
} from "@/lib/auth/session";

describe("session auth helpers", () => {
  beforeEach(() => {
    cookieJar.clear();
    delete process.env.IS_PLAYWRIGHT_TEST;
    delete process.env.NEXT_TEST_AUTH_BYPASS;
  });

  describe("getCurrentUser", () => {
    it("should return null if user is not authenticated", async () => {
      const result = await getCurrentUser();
      expect(result).toBeNull();
    });

    it("should return mapped SessionUser if user session exists", async () => {
      await setSessionUser({
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        picture: "http://avatar.jpg",
        role: "user",
      });

      const result = await getCurrentUser();
      expect(result).not.toBeNull();
      expect(result?.id).toBe("user-1");
      expect(result?.email).toBe("test@example.com");
      expect(result?.fullName).toBe("Test User");
      expect(result?.avatarUrl).toBe("http://avatar.jpg");
      expect(result?.role).toBe("user");
      expect(result?.isVerified).toBe(true);
    });

    it("should return Playwright mock user when test bypass is active", async () => {
      vi.stubEnv("NODE_ENV", "test");
      vi.stubEnv("IS_PLAYWRIGHT_TEST", "true");
      vi.stubEnv("NEXT_TEST_AUTH_BYPASS", "true");

      const result = await getCurrentUser();
      expect(result).toEqual({
        id: "playwright-test-user",
        email: "admin@playwright.test",
        fullName: "Playwright Test Admin",
        avatarUrl: null,
        role: "admin",
        isVerified: true,
        createdAt: "2026-01-01T00:00:00Z",
      });

      vi.unstubAllEnvs();
    });
  });

  describe("role checks", () => {
    it("isModerator should return true for moderator, admin, and ceo roles", async () => {
      // Unauthenticated
      expect(await isModerator()).toBe(false);

      // User role
      await setSessionUser({ id: "u1", email: "user@example.com", name: "User", picture: null, role: "user" });
      expect(await isModerator()).toBe(false);

      // Moderator role
      await setSessionUser({ id: "u2", email: "mod@example.com", name: "Mod", picture: null, role: "moderator" });
      expect(await isModerator()).toBe(true);

      // Admin role
      await setSessionUser({ id: "u3", email: "admin@example.com", name: "Admin", picture: null, role: "admin" });
      expect(await isModerator()).toBe(true);

      // CEO role
      await setSessionUser({ id: "u4", email: "ceo@example.com", name: "CEO", picture: null, role: "ceo" });
      expect(await isModerator()).toBe(true);

      // Automatic CEO resolution via email domain
      await setSessionUser({ id: "u5", email: "founder@alparai.com", name: "Founder", picture: null, role: "user" });
      expect(await isModerator()).toBe(true);
      expect(await isCEO()).toBe(true);
    });

    it("isAdmin should return true only for admin and ceo roles", async () => {
      // Moderator role
      await setSessionUser({ id: "u1", email: "mod@example.com", name: "Mod", picture: null, role: "moderator" });
      expect(await isAdmin()).toBe(false);

      // Admin role
      await setSessionUser({ id: "u2", email: "admin@example.com", name: "Admin", picture: null, role: "admin" });
      expect(await isAdmin()).toBe(true);

      // CEO role
      await setSessionUser({ id: "u3", email: "ceo@example.com", name: "CEO", picture: null, role: "ceo" });
      expect(await isAdmin()).toBe(true);
    });
  });

  describe("require role decorators", () => {
    it("requireUser should throw UNAUTHORIZED if not authenticated", async () => {
      await expect(requireUser()).rejects.toThrow("UNAUTHORIZED");
    });

    it("requireUser should return user if authenticated", async () => {
      await setSessionUser({ id: "u1", email: "test@example.com", name: "User", picture: null, role: "user" });
      const result = await requireUser();
      expect(result.id).toBe("u1");
    });

    it("requireModerator should throw FORBIDDEN if user is not moderator/admin/ceo", async () => {
      await setSessionUser({ id: "u1", email: "user@example.com", name: "User", picture: null, role: "user" });
      await expect(requireModerator()).rejects.toThrow("FORBIDDEN");
    });

    it("requireModerator should return user if moderator", async () => {
      await setSessionUser({ id: "u1", email: "mod@example.com", name: "Mod", picture: null, role: "moderator" });
      const result = await requireModerator();
      expect(result.id).toBe("u1");
    });

    it("requireAdmin should throw FORBIDDEN if user is not admin/ceo", async () => {
      await setSessionUser({ id: "u1", email: "mod@example.com", name: "Mod", picture: null, role: "moderator" });
      await expect(requireAdmin()).rejects.toThrow("FORBIDDEN");
    });

    it("requireAdmin should return user if admin or ceo", async () => {
      await setSessionUser({ id: "u1", email: "admin@example.com", name: "Admin", picture: null, role: "admin" });
      const result = await requireAdmin();
      expect(result.id).toBe("u1");
    });
  });
});

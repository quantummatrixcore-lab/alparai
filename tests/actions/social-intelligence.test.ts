import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

vi.hoisted(() => {
  vi.doMock("@/lib/auth/session", () => ({
    getCurrentUser: vi.fn(),
  }));
  vi.doMock("@/lib/security/ssrf", () => ({
    fetchWithSsrfGuard: vi.fn(),
    isSafeUrl: vi.fn().mockResolvedValue({ safe: true }),
  }));
  vi.doMock("@/lib/ai/api-keys", () => ({
    resolveApiKey: vi.fn(),
  }));
  vi.doMock("@google/generative-ai", () => ({
    GoogleGenerativeAI: vi.fn(),
  }));
});

import { getCurrentUser } from "@/lib/auth/session";
import { resolveApiKey } from "@/lib/ai/api-keys";
import { fetchContentFromUrl, generateStrategicResponse } from "@/actions/social-intelligence";

describe("Social Intelligence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchContentFromUrl", () => {
    it("returns UNAUTHORIZED when no user", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null);

      const result = await fetchContentFromUrl("https://example.com");

      expect(result.ok).toBe(false);
      expect(result.error).toBe("UNAUTHORIZED");
    });

    it("returns UNAUTHORIZED when user is not admin/ceo", async () => {
      const mockUser = {
        id: "u1",
        email: "user@test.com",
        fullName: "User",
        role: "user" as const,
        isVerified: true,
        avatarUrl: null,
        createdAt: "2026-01-01",
      };
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

      const result = await fetchContentFromUrl("https://example.com");

      expect(result.ok).toBe(false);
      expect(result.error).toBe("UNAUTHORIZED");
    });

    it("returns error when URL is empty", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue({
        id: "a1",
        email: "admin@test.com",
        fullName: "Admin",
        role: "admin",
        isVerified: true,
        avatarUrl: null,
        createdAt: "2026-01-01",
      } as never);

      const result = await fetchContentFromUrl("");

      expect(result.ok).toBe(false);
      expect(result.error).toBe("URL is required");
    });
  });

  describe("generateStrategicResponse", () => {
    const mockAdmin = {
      id: "a1",
      email: "admin@test.com",
      fullName: "Admin",
      role: "admin" as const,
      isVerified: true,
      avatarUrl: null,
      createdAt: "2026-01-01",
    } as never;

    it("returns UNAUTHORIZED when no user", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null);

      const result = await generateStrategicResponse("context", "visionary", "general");

      expect(result.ok).toBe(false);
      expect(result.error).toBe("UNAUTHORIZED");
    });

    it("returns error when context text is empty", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockAdmin);

      const result = await generateStrategicResponse("", "visionary", "general");

      expect(result.ok).toBe(false);
      expect(result.error).toBe("Context text is required");
    });

    it("returns API_KEY_NOT_FOUND when Gemini key is missing", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockAdmin);
      vi.mocked(resolveApiKey).mockResolvedValue(null);

      const result = await generateStrategicResponse("context", "visionary", "general");

      expect(result.ok).toBe(false);
      expect(result.error).toBe("API_KEY_NOT_FOUND");
    });
  });
});

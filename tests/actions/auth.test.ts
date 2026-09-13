import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockDeHostClient, createTestUser } from "../helpers/dehost-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/dehost/server", () => ({
    createClient: vi.fn(),
    createServerClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    getCurrentUser: vi.fn(),
  }));
  vi.doMock("@/lib/utils/rate-limit", () => ({
    checkRateLimit: vi.fn(),
    RATE_LIMIT_KEYS: {
      incident_submission: "ratelimit:incident_submission",
      suggestion_submission: "ratelimit:suggestion_submission",
      auth_signin: "ratelimit:auth_signin",
      auth_magiclink: "ratelimit:auth_magiclink",
      contact_submission: "ratelimit:contact_submission",
      takedown_submission: "ratelimit:takedown_submission",
      search_query: "ratelimit:search_query",
      export_request: "ratelimit:export_request",
      api_general: "ratelimit:api_general",
    },
  }));
  vi.doMock("@/lib/constants", () => ({
    APP_URL: "https://test.alparai.com",
    APP_NAME: "ALPAR AI",
  }));
});

import { createClient, createServerClient } from "@/lib/dehost/server";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { signInWithGoogle, signInWithMagicLink, getMe } from "@/actions/auth/auth";

let mockDeHost: ReturnType<typeof createMockDeHostClient>;
let mockUser: ReturnType<typeof createTestUser>;

beforeEach(() => {
  vi.clearAllMocks();
  mockDeHost = createMockDeHostClient();
  mockUser = createTestUser();
  vi.mocked(createClient).mockResolvedValue(mockDeHost as never);
  vi.mocked(createServerClient).mockResolvedValue(mockDeHost as never);
  vi.mocked(getCurrentUser).mockResolvedValue(null);
  vi.mocked(checkRateLimit).mockResolvedValue({ ok: true });
});

describe("signInWithGoogle", () => {
  beforeEach(() => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true });
    mockDeHost.auth.signInWithOAuth.mockResolvedValue({
      data: { url: "https://accounts.google.com/o/oauth2/auth" },
      error: null,
    });
  });

  it("returns url on success", async () => {
    const result = await signInWithGoogle();
    expect(result.ok).toBe(true);
    expect(result.url).toContain("google");
  });

  it("uses custom next parameter", async () => {
    const result = await signInWithGoogle("/dashboard");
    expect(result.ok).toBe(true);
    expect(mockDeHost.auth.signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "google",
        options: expect.objectContaining({
          redirectTo: expect.stringContaining(encodeURIComponent("/dashboard")),
        }),
      }),
    );
  });

  it("returns error when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      ok: false,
      retryAfter: 60,
    });
    const result = await signInWithGoogle();
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Too many");
  });

  it("returns error when OAuth fails", async () => {
    mockDeHost.auth.signInWithOAuth.mockResolvedValueOnce({
      data: { url: null },
      error: { message: "OAuth provider error", status: 500 },
    });
    const result = await signInWithGoogle();
    expect(result.ok).toBe(false);
    expect(result.error).toBe("OAuth provider error");
  });
});

describe("signInWithMagicLink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeHost.auth.signInWithOtp.mockResolvedValue({ error: null });
  });

  it("returns success on valid email", async () => {
    const result = await signInWithMagicLink("user@example.com");
    expect(result.ok).toBe(true);
    expect(mockDeHost.auth.signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({ email: "user@example.com" }),
    );
  });

  it("returns error when OTP fails", async () => {
    mockDeHost.auth.signInWithOtp.mockResolvedValueOnce({
      error: { message: "Rate limit exceeded" },
    });
    const result = await signInWithMagicLink("user@example.com");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Rate limit exceeded");
  });

  it("returns error when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      ok: false,
      retryAfter: 60,
    });
    const result = await signInWithMagicLink("user@example.com");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Too many");
  });
});

describe("getMe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null user when not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce(null);
    const result = await getMe();
    expect(result.ok).toBe(true);
    expect(result.user).toBeNull();
  });

  it("returns user data when authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce(mockUser);
    const result = await getMe();
    expect(result.ok).toBe(true);
    expect(result.user).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      fullName: mockUser.fullName,
      avatarUrl: mockUser.avatarUrl,
      role: mockUser.role,
    });
  });
});

/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

const mockUser = { id: "user-123", email: "user@example.com" };

const currentUserMock = vi.fn().mockResolvedValue(mockUser);
vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: () => currentUserMock(),
}));

const mockSingle = vi.fn().mockResolvedValue({ data: { badges: ["Beta Tester"] }, error: null });
const mockCount = vi.fn().mockResolvedValue({ count: 50, error: null });
const mockUpdate = vi.fn();
const updateErrorMock = vi.fn().mockReturnValue(null);

const mockSupabaseChain: any = {
  select: vi.fn().mockImplementation((_cols: string, opts?: any) => {
    if (opts?.count) {
      return mockCount();
    }
    return mockSupabaseChain;
  }),
  eq: vi.fn().mockReturnThis(),
  single: () => mockSingle(),
  update: mockUpdate.mockImplementation(() => {
    return {
      eq: vi.fn().mockImplementation(() => {
        return { error: updateErrorMock() };
      }),
    };
  }),
};

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: () => mockSupabaseChain,
  }),
}));

const rateLimitMock = vi.fn().mockResolvedValue({ ok: true });
vi.mock("@/lib/utils/rate-limit", () => ({
  checkRateLimit: () => rateLimitMock(),
  RATE_LIMIT_KEYS: {
    onboarding: "onboarding",
  },
}));

import { saveOnboardingData } from "@/actions/onboarding";

describe("onboarding action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserMock.mockResolvedValue(mockUser);
    rateLimitMock.mockResolvedValue({ ok: true });
    mockSingle.mockResolvedValue({ data: { badges: ["Beta Tester"] }, error: null });
    mockCount.mockResolvedValue({ count: 50, error: null });
    updateErrorMock.mockReturnValue(null);
  });

  it("returns error for unauthenticated user", async () => {
    currentUserMock.mockResolvedValue(null);
    const res = await saveOnboardingData("advocate", ["safety"]);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Sign in required");
  });

  it("returns error for invalid role", async () => {
    const res = await saveOnboardingData("invalid-role", ["safety"]);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Invalid community role selected");
  });

  it("returns error for invalid interest", async () => {
    const res = await saveOnboardingData("advocate", ["safety", "invalid-interest"]);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Invalid interests selected");
  });

  it("returns rate limit error when limited", async () => {
    rateLimitMock.mockResolvedValue({ ok: false, retryAfter: 300 });
    const res = await saveOnboardingData("advocate", ["safety"]);
    expect(res.ok).toBe(false);
    expect(res.error).toContain("Too many attempts");
  });

  it("gives Founding Reporter badge if user count <= 100", async () => {
    mockCount.mockResolvedValue({ count: 85, error: null });
    const res = await saveOnboardingData("advocate", ["safety", "privacy"]);
    expect(res.ok).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      community_role: "advocate",
      interests: ["safety", "privacy"],
      badges: ["Beta Tester", "Founding Reporter"],
    });
  });

  it("does not give Founding Reporter badge if user count > 100", async () => {
    mockCount.mockResolvedValue({ count: 120, error: null });
    const res = await saveOnboardingData("advocate", ["safety", "privacy"]);
    expect(res.ok).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      community_role: "advocate",
      interests: ["safety", "privacy"],
      badges: ["Beta Tester"],
    });
  });

  it("handles user retrieval error gracefully", async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error("User not found") });
    const res = await saveOnboardingData("advocate", ["safety"]);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Database error. Could not retrieve user profile.");
  });

  it("handles user update error gracefully", async () => {
    updateErrorMock.mockReturnValue(new Error("Update failed"));
    const res = await saveOnboardingData("advocate", ["safety"]);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Database error. Could not save onboarding details.");
  });
});

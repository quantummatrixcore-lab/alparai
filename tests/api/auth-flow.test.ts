import { describe, it, expect, vi } from "vitest";
import { signInWithGoogleIdToken } from "@/actions/auth/auth";

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Map([["x-forwarded-for", "127.0.0.1"]])),
}));

vi.mock("@/lib/utils/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ ok: true }),
  RATE_LIMIT_KEYS: { auth_signin: "auth_signin" },
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn().mockResolvedValue({
    auth: {
      signInWithIdToken: vi.fn().mockResolvedValue({
        error: { code: "invalid_grant", status: 400, message: "Invalid Google ID token" },
      }),
    },
  }),
}));

describe("AUTH-1: Google ID Token Sign-in Action", () => {
  it("returns server rejection error cleanly without throwing or silent fallback", async () => {
    const result = await signInWithGoogleIdToken("mock_id_token", "mock_nonce");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Google ID Token verification failed");
  });
});

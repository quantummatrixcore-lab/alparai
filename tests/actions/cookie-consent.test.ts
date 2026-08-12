import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    getCurrentUser: vi.fn(),
  }));
  vi.doMock("next/headers", () => ({
    headers: vi.fn(),
  }));
});

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { headers } from "next/headers";
import { logCookieConsent } from "@/actions/cookie-consent";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(headers).mockResolvedValue(
    new Map([
      ["x-forwarded-for", "127.0.0.1"],
      ["user-agent", "vitest"],
    ]) as never,
  );
});

describe("Cookie Consent", () => {
  it("logs consent when user is signed in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" } as never);
    const mockSupabase = {
      from: vi.fn().mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: null }) }),
    };
    vi.mocked(createAdminClient).mockReturnValue(mockSupabase as never);

    const result = await logCookieConsent("analytics");
    expect(result.ok).toBe(true);
  });

  it("logs consent when user is anonymous", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const mockSupabase = {
      from: vi.fn().mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: null }) }),
    };
    vi.mocked(createAdminClient).mockReturnValue(mockSupabase as never);

    const result = await logCookieConsent("necessary");
    expect(result.ok).toBe(true);
  });

  it("returns ok false on database error", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const mockSupabase = {
      from: vi
        .fn()
        .mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: new Error("DB down") }) }),
    };
    vi.mocked(createAdminClient).mockReturnValue(mockSupabase as never);

    const result = await logCookieConsent("marketing");
    expect(result.ok).toBe(false);
  });
});

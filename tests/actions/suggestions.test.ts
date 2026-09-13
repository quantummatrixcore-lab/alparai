import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockDeHostClient, createTestUser } from "../helpers/dehost-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/dehost/server", () => ({
    createClient: vi.fn(),
    createServerClient: vi.fn(),
  }));
  vi.doMock("@/lib/dehost/admin", () => ({
    createAdminClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    getCurrentUser: vi.fn(),
  }));
  vi.doMock("@/lib/utils/rate-limit", () => ({
    checkRateLimit: vi.fn().mockResolvedValue({ ok: true }),
    RATE_LIMIT_KEYS: {
      suggestion_submission: "ratelimit:suggestion_submission",
    },
  }));
});

import { createClient, createServerClient } from "@/lib/dehost/server";
import { createAdminClient } from "@/lib/dehost/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { submitSuggestion, upvoteSuggestion } from "@/actions/community/suggestions";

let mockDeHost: ReturnType<typeof createMockDeHostClient>;
let mockAdminClient: ReturnType<typeof createMockDeHostClient>;
let mockUser: ReturnType<typeof createTestUser>;

beforeEach(() => {
  vi.clearAllMocks();
  mockDeHost = createMockDeHostClient();
  mockAdminClient = createMockDeHostClient();
  mockUser = createTestUser();
  vi.mocked(createClient).mockResolvedValue(mockDeHost as never);
  vi.mocked(createServerClient).mockResolvedValue(mockDeHost as never);
  vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as never);
  vi.mocked(getCurrentUser).mockResolvedValue(mockUser as never);
});

function buildSuggestionForm(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("title", "Add dark mode support for the platform");
  fd.set(
    "description",
    "It would be great to have a dark mode option for better accessibility and comfort.",
  );
  fd.set("category", "feature");
  for (const [key, value] of Object.entries(overrides)) {
    fd.set(key, value);
  }
  return fd;
}

describe("submitSuggestion", () => {
  beforeEach(() => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

    mockDeHost.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "sug-1" }, error: null }),
        }),
      }),
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "test" }, error: null }),
        }),
      }),
    } as ReturnType<typeof mockDeHost.from>);
  });

  it("submits successfully with valid data", async () => {
    const result = await submitSuggestion({ ok: false }, buildSuggestionForm());
    expect(result.ok).toBe(true);
    expect(mockDeHost.from).toHaveBeenCalledWith("suggestions");
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce(null);
    const result = await submitSuggestion({ ok: false }, buildSuggestionForm());
    expect(result.ok).toBe(false);
    expect(result.error).toContain("sign_in");
  });

  it("returns field errors for short title", async () => {
    const fd = buildSuggestionForm({ title: "short" });
    const result = await submitSuggestion({ ok: false }, fd);
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toBeDefined();
  });

  it("returns error when database insert fails", async () => {
    mockDeHost.from.mockReturnValue({
      insert: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "DB error" },
      }),
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "test" }, error: null }),
        }),
      }),
    } as ReturnType<typeof mockDeHost.from>);
    const result = await submitSuggestion({ ok: false }, buildSuggestionForm());
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Failed");
  });
});

describe("upvoteSuggestion", () => {
  beforeEach(() => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockEqInner = vi.fn().mockReturnValue({
      maybeSingle: mockMaybeSingle,
    });
    const mockEqOuter = vi.fn().mockReturnValue({
      eq: mockEqInner,
    });

    mockDeHost.from.mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: mockEqOuter }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      update: vi.fn().mockResolvedValue({ data: null, error: null }),
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "test" }, error: null }),
        }),
      }),
    } as ReturnType<typeof mockDeHost.from>);
  });

  it("creates a new upvote when none exists", async () => {
    const result = await upvoteSuggestion("sug-1");
    expect(result).toEqual({ ok: true });
    expect(mockDeHost.from).toHaveBeenCalledWith("suggestion_votes");
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce(null);
    const result = await upvoteSuggestion("sug-1");
    expect(result).toEqual({ ok: false, error: "sign_in_to_upvote" });
  });
});

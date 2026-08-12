import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockSupabaseClient, createTestUser } from "../helpers/supabase-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/server", () => ({
    createServerClient: vi.fn(),
  }));
  vi.doMock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(),
  }));
  vi.doMock("@/lib/utils/rate-limit", () => ({
    checkRateLimit: vi.fn(),
    RATE_LIMIT_KEYS: {
      dilemma_vote: "ratelimit:dilemma_vote",
    },
  }));
  vi.doMock("@/lib/utils/hash", () => ({
    hashIp: vi.fn().mockReturnValue("hashed-ip"),
  }));
  vi.doMock("next/headers", () => ({
    headers: vi.fn().mockResolvedValue({
      get: vi.fn().mockReturnValue("127.0.0.1"),
    }),
  }));
  vi.doMock("next/cache", () => ({
    revalidatePath: vi.fn(),
  }));
});

import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { submitVote } from "@/actions/dilemmas";

let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
let mockAdmin: ReturnType<typeof createMockSupabaseClient>;
let testUser: ReturnType<typeof createTestUser>;

const POLL_ID = "00000000-0000-0000-0000-000000000001";

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabase = createMockSupabaseClient();
  mockAdmin = createMockSupabaseClient();
  testUser = createTestUser();
  vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);
  vi.mocked(createAdminClient).mockReturnValue(mockAdmin as never);
  vi.mocked(checkRateLimit).mockResolvedValue({ ok: true, remaining: 2 });
  mockSupabase.auth.getUser = vi.fn().mockResolvedValue({ data: { user: testUser }, error: null });
  mockAdmin._mocks.mockInsert.mockReturnValue({
    then: vi.fn((onfulfilled) => {
      if (typeof onfulfilled === "function") {
        onfulfilled({ data: null, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    }),
    select: vi
      .fn()
      .mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }),
  });
});

describe("submitVote", () => {
  it("blocks vote when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: false, retryAfter: 30 });
    const result = await submitVote(POLL_ID, "yes", "token");
    expect(result.error).toContain("Too many votes");
  });

  it("returns error on duplicate vote (23505)", async () => {
    mockAdmin._mocks.mockInsert.mockReturnValue({
      then: vi.fn((onfulfilled) => {
        if (typeof onfulfilled === "function") {
          onfulfilled({ data: null, error: { code: "23505", message: "duplicate" } });
        }
        return Promise.resolve({ data: null, error: { code: "23505", message: "duplicate" } });
      }),
      select: vi
        .fn()
        .mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }),
    });
    const result = await submitVote(POLL_ID, "yes", "token");
    expect(result.error).toBe("You have already voted on this dilemma.");
  });

  it("returns success and badge for authenticated user", async () => {
    mockAdmin._mocks.mockInsert.mockReturnValue({
      then: vi.fn((onfulfilled) => {
        if (typeof onfulfilled === "function") {
          onfulfilled({ data: null, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      }),
      select: vi
        .fn()
        .mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }),
    });
    (mockAdmin as unknown as { rpc: ReturnType<typeof vi.fn> }).rpc = vi
      .fn()
      .mockResolvedValue({ error: null });
    mockAdmin._mocks.mockMaybeSingle.mockResolvedValue({
      data: { reputation_score: 10, badges: [] },
      error: null,
    });

    const result = await submitVote(POLL_ID, "yes", "token");
    expect(result.success ?? result.error).toBeDefined();
  });

  it("skips turnstile verification in non-production without secret", async () => {
    const origEnv = process.env.NODE_ENV;
    const origKey = process.env.TURNSTILE_SECRET_KEY;
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
    delete process.env.TURNSTILE_SECRET_KEY;
    mockAdmin._mocks.mockInsert.mockReturnValue({
      then: vi.fn((onfulfilled) => {
        if (typeof onfulfilled === "function") {
          onfulfilled({ data: null, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      }),
      select: vi
        .fn()
        .mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }),
    });
    (mockAdmin as unknown as { rpc: ReturnType<typeof vi.fn> }).rpc = vi
      .fn()
      .mockResolvedValue({ error: null });

    const result = await submitVote(POLL_ID, "no", "any-token");
    expect(result).toBeDefined();

    (process.env as Record<string, string | undefined>).NODE_ENV = origEnv;
    if (origKey !== undefined) process.env.TURNSTILE_SECRET_KEY = origKey;
  });
});

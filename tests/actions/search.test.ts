import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockSupabaseClient } from "../helpers/supabase-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/server", () => ({
    createClient: vi.fn(),
  }));
  vi.doMock("@/lib/utils/rate-limit", () => ({
    checkRateLimit: vi.fn(),
    RATE_LIMIT_KEYS: {
      search_query: "ratelimit:search_query",
    },
  }));
  vi.doMock("next/headers", () => ({
    headers: vi.fn().mockResolvedValue({
      get: vi.fn().mockReturnValue("127.0.0.1"),
    }),
  }));
});

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { searchIncidents } from "@/actions/search";

let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabase = createMockSupabaseClient();
  vi.mocked(createClient).mockResolvedValue(mockSupabase as never);
  vi.mocked(checkRateLimit).mockResolvedValue({ ok: true, remaining: 29 });
});

describe("searchIncidents", () => {
  it("returns empty results for short query (<2 chars)", async () => {
    const result = await searchIncidents("a");
    expect(result.ok).toBe(true);
    expect(result.results).toHaveLength(0);
    expect(checkRateLimit).not.toHaveBeenCalled();
  });

  it("returns empty results for empty query", async () => {
    const result = await searchIncidents("");
    expect(result.ok).toBe(true);
    expect(result.results).toHaveLength(0);
  });

  it("returns error when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: false, retryAfter: 30 });
    const result = await searchIncidents("openai hallucination");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Too many searches");
  });

  it("sanitizes XSS input and proceeds", async () => {
    const chainMock = {
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    mockSupabase.from = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue(chainMock) });
    const result = await searchIncidents("<script>alert(1)</script>");
    expect(result.ok).toBe(true);
    expect(result.results).toHaveLength(0);
  });

  it("returns mapped results on success", async () => {
    const rows = [
      {
        id: "abc",
        title_masked: "Test incident",
        category: "safety",
        severity: "high",
        created_at: "2026-01-01",
      },
    ];
    const chainMock = {
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: rows, error: null }),
    };
    mockSupabase.from = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue(chainMock) });
    const result = await searchIncidents("Test incident");
    expect(result.ok).toBe(true);
    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.title).toBe("Test incident");
    expect(result.results[0]?.severity).toBe("high");
  });

  it("returns error on DB failure", async () => {
    const chainMock = {
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: null, error: { message: "db error" } }),
    };
    mockSupabase.from = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue(chainMock) });
    const result = await searchIncidents("openai");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Search failed");
  });
});

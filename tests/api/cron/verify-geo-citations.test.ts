import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        limit: vi.fn().mockResolvedValue({
          data: [
            {
              id: "c1",
              cited_url: "https://alparai.com/incidents",
              ai_engine: "ChatGPT",
              bot_hit_count: 5,
            },
          ],
        }),
      }),
      update: () => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
  }),
}));

vi.mock("@/lib/security/ssrf", () => ({
  isSafeUrl: (url: string) => url.startsWith("https://alparai.com"),
}));

describe("Item 148 — GEO Citation Verifier Cron", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject requests without valid Bearer CRON_SECRET", async () => {
    const { GET } = await import("@/app/api/cron/verify-geo-citations/route");

    const reqWithoutAuth = new Request("http://localhost:3000/api/cron/verify-geo-citations");
    const resUnauth = await GET(reqWithoutAuth);
    expect(resUnauth.status).toBe(401);
  }, 30000);

  it("should execute real verification and handle fetch reachability check", async () => {
    process.env.CRON_SECRET = "test-secret-key-12345678901234567890";
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    }) as unknown as typeof fetch;

    const { GET } = await import("@/app/api/cron/verify-geo-citations/route");

    const reqValid = new Request("http://localhost:3000/api/cron/verify-geo-citations", {
      headers: {
        Authorization: "Bearer test-secret-key-12345678901234567890",
      },
    });

    const res = await GET(reqValid);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.citations_verified).toBe(1);
    expect(body.total_scanned).toBe(1);
  });
});

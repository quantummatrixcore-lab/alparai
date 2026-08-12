import { describe, it, expect, vi } from "vitest";
import { GET, OPTIONS } from "@/app/api/v1/incidents/route";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  headers: async () => new Map([["x-forwarded-for", "127.0.0.1"]]),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
        }),
      }),
    }),
  }),
}));

vi.mock("@/lib/utils/rate-limit", () => ({
  checkRateLimit: async () => ({ ok: true, remaining: 5, limit: 10, retryAfter: 60 }),
  RATE_LIMIT_KEYS: { api_free: "api_free", api_developer: "api_dev", api_enterprise: "api_ent" },
}));

describe("Public API v1 Incidents Route (Item 155)", () => {
  it("handles OPTIONS request with CORS headers", async () => {
    const req = new Request("http://localhost:3000/api/v1/incidents", {
      method: "OPTIONS",
      headers: { origin: "https://alparai.com" },
    });
    const res = await OPTIONS(req);
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Headers")).toContain("x-api-key");
  });

  it("rejects request missing both Authorization and x-api-key headers with 401", async () => {
    const req = new Request("http://localhost:3000/api/v1/incidents", { method: "GET" });
    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });
});

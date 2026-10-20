import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  headers: async () => new Map([["x-forwarded-for", "198.51.100.7"]]),
  cookies: async () => new Map(),
}));

const selectedColumns: string[] = [];
const sourceTable: string[] = [];

vi.mock("@/lib/dehost/server", () => ({
  createServerClient: async () => ({
    from: (table: string) => {
      sourceTable.push(table);
      const chain: Record<string, unknown> = {};
      chain.select = (columns: string) => {
        selectedColumns.push(columns);
        return chain;
      };
      chain.order = () => chain;
      chain.limit = async () => ({ data: [], error: null });
      chain.then = (res: (v: unknown) => unknown) =>
        res({
          data: [
            {
              id: "p1",
              slug: "openai",
              name: "OpenAI (ChatGPT)",
              logo_url: null,
              is_verified: true,
              website_url: null,
              trust_score: 70.12,
              incident_count: 194,
              response_count: 12,
              response_rate: 6.19,
            },
            {
              id: "p2",
              slug: "example",
              name: "Example",
              logo_url: null,
              is_verified: false,
              website_url: null,
              trust_score: 75,
              incident_count: 0,
              response_count: 0,
              response_rate: 0,
            },
          ],
          error: null,
        });
      return chain;
    },
  }),
  createClient: async () => ({
    from: () => ({ select: () => ({ limit: async () => ({ data: [], error: null }) }) }),
  }),
}));

vi.mock("@/lib/utils/rate-limit", () => ({
  rateLimit: () => null,
  checkRateLimit: async () => ({ ok: true, limit: 100, remaining: 99, reset: 0 }),
  RATE_LIMIT_KEYS: { api_general: "ratelimit:api_general" },
}));

import { GET } from "@/app/api/v1/leaderboard/route";

describe("/api/v1/leaderboard — regression: incident counts were always zero", () => {
  beforeEach(() => {
    selectedColumns.length = 0;
    sourceTable.length = 0;
  });

  it("reads from the provider_leaderboard view, the same source as the page", async () => {
    const res = await GET(new NextRequest("http://localhost:3000/api/v1/leaderboard") as never);
    expect(res.status).toBe(200);
    expect(sourceTable).toContain("provider_leaderboard");
  });

  it("requests the count columns it then maps", async () => {
    await GET(new NextRequest("http://localhost:3000/api/v1/leaderboard") as never);
    expect(selectedColumns).toHaveLength(1);
    const projection = selectedColumns[0];
    // These three were previously never selected, so the mapper always fell
    // back to 0 while the leaderboard PAGE (which uses the view) showed the
    // real numbers. API and page disagreed about the same data.
    expect(projection).toContain("incident_count");
    expect(projection).toContain("response_count");
    expect(projection).toContain("response_rate");
  });

  it("reports the real incident and response counts", async () => {
    const res = await GET(new NextRequest("http://localhost:3000/api/v1/leaderboard") as never);
    const body = await res.json();
    const openai = body.data.find((r: { slug: string }) => r.slug === "openai");

    expect(openai.incident_count).toBe(194);
    expect(openai.response_count).toBe(12);
    expect(openai.response_rate).toBe(6);
    expect(openai.trust_score).toBe(70.12);
  });

  it("returns a zero response rate for providers without incidents", async () => {
    const res = await GET(new NextRequest("http://localhost:3000/api/v1/leaderboard") as never);
    const body = await res.json();
    const example = body.data.find((r: { slug: string }) => r.slug === "example");

    expect(example.incident_count).toBe(0);
    expect(example.response_rate).toBeNull();
  });
});

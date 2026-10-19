import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET, OPTIONS, calculateBenchmarkGrade, calculateBenchmarkScore } from "./route";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  cookies: async () => new Map(),
  headers: async () => new Map(),
}));

const providerRows: Record<
  string,
  { name: string; trust_score: number | null; is_verified: boolean }
> = {};

vi.mock("@/lib/dehost/server", () => ({
  createServerClient: async () => ({
    from: () => {
      const chain: Record<string, unknown> = {};
      chain.select = () => chain;
      chain.eq = (_col: string, val: string) => {
        chain.__row = providerRows[val] ?? null;
        return chain;
      };
      chain.maybeSingle = async () => ({ data: chain.__row ?? null, error: null });
      chain.then = (res: (v: unknown) => unknown) =>
        res({ data: chain.__row ?? null, error: null, count: chain.__row ? 1 : 0 });
      return chain;
    },
  }),
  createClient: async () => ({
    from: () => ({ select: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
  }),
}));

describe("/api/badge API Route", () => {
  beforeEach(() => {
    for (const key of Object.keys(providerRows)) delete providerRows[key];
  });

  it("handles OPTIONS request with CORS headers", async () => {
    const res = await OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("returns default alpar provider badge data on GET", async () => {
    const req = new NextRequest("http://localhost:3000/api/badge");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.provider).toBe("alpar");
    expect(data.score).toBeGreaterThan(90);
    expect(data.verified).toBe(true);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("returns specific known provider data when query param is present", async () => {
    const req = new NextRequest("http://localhost:3000/api/badge?provider=anthropic");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.provider).toBe("anthropic");
    expect(data.name).toBe("Anthropic");
    expect(data.score).toBe(96.5);
    expect(data.scoreSource).toBe("k_benchmark_static");
  });

  it("prefers the actuarial trust score from the database when present", async () => {
    providerRows.openai = { name: "OpenAI (ChatGPT)", trust_score: 71.25, is_verified: true };
    const req = new NextRequest("http://localhost:3000/api/badge?provider=openai");
    const res = await GET(req);
    const data = await res.json();
    expect(data.score).toBe(71.3);
    expect(data.scoreSource).toBe("actuarial_trust_score");
    expect(data.name).toBe("OpenAI (ChatGPT)");
    expect(data.grade).toBe("BBB");
  });

  it("never fabricates a score for an unknown provider", async () => {
    const req = new NextRequest("http://localhost:3000/api/badge?provider=customai");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.provider).toBe("customai");
    expect(data.name).toBe("Customai");
    expect(data.score).toBeNull();
    expect(data.grade).toBe("UNRATED");
    expect(data.verified).toBe(false);
    expect(data.scoreSource).toBe("insufficient_data");
  });

  it("does not mark a database-known but unverified provider as verified", async () => {
    providerRows.openai = { name: "OpenAI (ChatGPT)", trust_score: 88, is_verified: false };
    const req = new NextRequest("http://localhost:3000/api/badge?provider=openai");
    const res = await GET(req);
    const data = await res.json();
    expect(data.score).toBe(88);
    expect(data.verified).toBe(false);
  });

  it("computes grades deterministically", () => {
    expect(calculateBenchmarkGrade(99)).toBe("AAA+");
    expect(calculateBenchmarkGrade(93)).toBe("AAA");
    expect(calculateBenchmarkGrade(90)).toBe("AA+");
    expect(calculateBenchmarkGrade(40)).toBe("CCC");
  });

  it("computes composite scores from sub-metrics", () => {
    expect(
      calculateBenchmarkScore({
        safety: 90,
        accountability: 90,
        transparency: 90,
        reliability: 90,
      }),
    ).toBe(90);
  });
});

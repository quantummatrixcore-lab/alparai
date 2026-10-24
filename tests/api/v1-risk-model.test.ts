import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: () => null }));
vi.mock("@/lib/internal/guard", () => ({
  checkInternalQuota: () => ({ ok: true, remaining: 599, retryAfter: 0 }),
}));
vi.mock("@/lib/billing/meter", () => ({
  recordUsage: vi.fn(() => ({ count: 1, lastAt: new Date().toISOString() })),
}));
vi.mock("@/lib/dehost/server", () => ({
  createServerClient: async () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          not: () => ({
            limit: async () => ({
              data: [
                { severity: "critical", category: "x" },
                { severity: "critical", category: "x" },
                { severity: "low", category: "y" },
              ],
              error: null,
            }),
          }),
        }),
      }),
    }),
  }),
}));

import { GET } from "@/app/api/v1/insurtech/risk-model/route";
import { recordUsage } from "@/lib/billing/meter";

describe("IN2 insurtech risk-model", () => {
  it("rejects unauthorized anonymous queries with 401", async () => {
    const res = await GET(new NextRequest("http://localhost/api/v1/insurtech/risk-model"));
    expect(res.status).toBe(401);
    const json = (await res.json()) as { error: string; message: string };
    expect(json.error).toBe("Unauthorized");
  });

  it("computes risk index and meters the query for authorized client", async () => {
    const req = new NextRequest("http://localhost/api/v1/insurtech/risk-model", {
      headers: { "x-internal-client": "alpar-insurtech-suite" },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      data: { sample_size: number; risk_index: number };
      meta: { billing: { metered: boolean } };
    };
    expect(json.data.sample_size).toBe(3);
    expect(json.data.risk_index).toBeGreaterThan(0);
    expect(json.meta.billing.metered).toBe(true);
    expect(recordUsage).toHaveBeenCalled();
  });
});

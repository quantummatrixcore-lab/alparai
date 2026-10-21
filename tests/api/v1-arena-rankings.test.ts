import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: () => null }));
vi.mock("@/lib/dehost/server", () => ({
  createServerClient: async () => ({
    from: (table: string) => ({
      select: () => ({
        order: () => ({
          limit: async () => ({
            data:
              table === "k_model_scores"
                ? [
                    { model_id: "m-b", score: 900 },
                    { model_id: "m-a", score: 100 },
                  ]
                : [
                    { id: "m-b", slug: "Model-B" },
                    { id: "m-a", slug: "Model-A" },
                  ],
            error: null,
          }),
        }),
        limit: async () => ({
          data: [
            { id: "m-b", slug: "Model-B" },
            { id: "m-a", slug: "Model-A" },
          ],
          error: null,
        }),
      }),
    }),
  }),
}));

import { GET } from "@/app/api/v1/arena/rankings/route";

describe("IN6 arena rankings", () => {
  it("returns a seeded live leaderboard sorted by rating", async () => {
    const res = await GET(new NextRequest("http://localhost/api/v1/arena/rankings"));
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      data: Array<{ model_slug: string; rating: number }>;
      meta: { live: boolean };
    };
    expect(json.meta.live).toBe(true);
    expect(json.data[0]?.model_slug).toBe("model-b");
    expect(json.data.every((e) => e.rating >= 1500)).toBe(true);
    expect(json.data[0]?.rating).toBeGreaterThan(json.data[1]?.rating ?? 0);
  });
});

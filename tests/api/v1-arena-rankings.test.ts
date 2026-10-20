import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: () => null }));
vi.mock("@/lib/dehost/server", () => ({
  createServerClient: async () => ({
    from: () => ({
      select: () => ({
        order: () => ({
          limit: async () => ({
            data: [
              { model_slug: "model-b", score: 900 },
              { model_slug: "model-a", score: 100 },
            ],
            error: null,
          }),
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
  });
});

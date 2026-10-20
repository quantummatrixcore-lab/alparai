import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/dehost/server", () => ({
  createServerClient: async () => ({
    from: () => ({
      select: () => ({
        eq: (_col: string, val: string) => ({
          maybeSingle: async () =>
            val === "ghost"
              ? { data: null, error: null }
              : { data: { trust_score: 82.5 }, error: null },
        }),
      }),
    }),
  }),
}));

import { GET } from "@/app/api/v1/models/[slug]/badge.svg/route";

function get(slug: string) {
  return GET(new NextRequest("http://localhost/x"), {
    params: Promise.resolve({ slug }),
  });
}

describe("IN3 SVG badge", () => {
  it("returns SVG with grade for a scored provider", async () => {
    const res = await get("openai");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/svg+xml");
    const svg = await res.text();
    expect(svg).toContain("<svg");
    expect(svg).toContain("82.5");
  });
  it("returns honest no-data badge instead of fabricating", async () => {
    const res = await get("ghost");
    const svg = await res.text();
    expect(svg).toContain("veri yok");
    expect(svg).not.toContain("82.5");
  });
});

import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: () => null }));
vi.mock("@/lib/dehost/server", () => ({
  createServerClient: async () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          not: () => ({
            limit: async () => ({
              data: [
                { id: "1", source_url: "https://example.com/a" },
                { id: "2", source_url: "https://sub.example.com/b" },
                { id: "3", source_url: "https://other.org/c" },
                { id: "4", source_url: "not-a-url" },
              ],
              error: null,
            }),
          }),
        }),
      }),
    }),
  }),
}));

import { GET } from "@/app/api/v1/public/domain-count/route";

describe("IN4 domain-count (extension backend)", () => {
  it("counts matching domain and subdomains, skips garbage", async () => {
    const res = await GET(
      new NextRequest("http://localhost/api/v1/public/domain-count?domain=example.com"),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { domain: string; count: number } };
    expect(json.data.domain).toBe("example.com");
    expect(json.data.count).toBe(2);
  });
  it("rejects missing domain", async () => {
    const res = await GET(new NextRequest("http://localhost/api/v1/public/domain-count"));
    expect(res.status).toBe(400);
  });
});

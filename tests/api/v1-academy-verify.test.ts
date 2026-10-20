import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: () => null }));
vi.mock("@/lib/dehost/server", () => ({
  createServerClient: async () => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            limit: async () => ({ data: table === "academy_completions" ? [] : [], error: null }),
          }),
          limit: async () => ({
            data:
              table === "academy_coupons"
                ? [
                    {
                      percent: 15,
                      used: false,
                      expires_at: new Date(Date.now() + 86400000).toISOString(),
                    },
                  ]
                : [],
            error: null,
          }),
        }),
      }),
    }),
  }),
}));

import { GET as certGET } from "@/app/api/v1/academy/certificate/[code]/route";
import { POST as couponPOST } from "@/app/api/v1/academy/coupon/verify/route";

describe("academy verify endpoints", () => {
  it("rejects malformed cert codes without DB hit", async () => {
    const res = await certGET(new NextRequest("http://localhost/x"), {
      params: Promise.resolve({ code: "DIPLOMA-1" }),
    });
    const json = (await res.json()) as { data: { valid: boolean; reason: string } };
    expect(json.data).toEqual({ valid: false, reason: "bad_format" });
  });

  it("reports not_found for unknown cert codes", async () => {
    const res = await certGET(new NextRequest("http://localhost/x"), {
      params: Promise.resolve({ code: "EYK-2026-ABCDEF" }),
    });
    const json = (await res.json()) as { data: { valid: boolean; reason: string } };
    expect(json.data.valid).toBe(false);
  });

  it("validates a good coupon", async () => {
    const res = await couponPOST(
      new NextRequest("http://localhost/x", {
        method: "POST",
        body: JSON.stringify({ code: "ALPAR-ABCDEF" }),
      }),
    );
    const json = (await res.json()) as { data: { valid: boolean; percent: number } };
    expect(json.data.valid).toBe(true);
    expect(json.data.percent).toBe(15);
  });

  it("rejects malformed coupon codes", async () => {
    const res = await couponPOST(
      new NextRequest("http://localhost/x", {
        method: "POST",
        body: JSON.stringify({ code: "BEDAVA" }),
      }),
    );
    const json = (await res.json()) as { data: { valid: boolean } };
    expect(json.data.valid).toBe(false);
  });
});

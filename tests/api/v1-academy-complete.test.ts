import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: () => null }));
vi.mock("@/lib/billing/meter", () => ({
  recordUsage: vi.fn(() => ({ count: 1, lastAt: new Date().toISOString() })),
}));

const store: {
  completions: Array<Record<string, unknown>>;
  coupons: Array<Record<string, unknown>>;
} = {
  completions: [],
  coupons: [],
};

vi.mock("@/lib/dehost/server", () => ({
  createServerClient: async () => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            eq: () => ({
              limit: async () => ({
                data: table === "academy_completions" ? store.completions : store.coupons,
                error: null,
              }),
            }),
            limit: async () => ({
              data: table === "academy_completions" ? store.completions : store.coupons,
              error: null,
            }),
          }),
          limit: async () => ({
            data: table === "academy_completions" ? store.completions : store.coupons,
            error: null,
          }),
        }),
      }),
      insert: (row: Record<string, unknown>) => {
        let done: Promise<{ data: unknown; error: { message: string } | null }> | null = null;
        const exec = () => {
          if (!done) {
            done = (async () => {
              if (table === "academy_completions") {
                if (
                  store.completions.some(
                    (c) => c.email === row.email && c.lesson_slug === row.lesson_slug,
                  )
                ) {
                  return { data: null, error: { message: "duplicate key value" } };
                }
                store.completions.push(row);
                return { data: [row], error: null };
              }
              if (store.coupons.some((c) => c.email === row.email)) {
                return { data: null, error: { message: "duplicate key value" } };
              }
              const full = {
                ...row,
                used: false,
                expires_at: new Date(Date.now() + 86400000).toISOString(),
              };
              store.coupons.push(full);
              return { data: [full], error: null };
            })();
          }
          return done;
        };
        // Route bazen await insert(...), bazen .insert(...).select() kullanır.
        return {
          select: exec,
          then: (
            res: (v: { data: unknown; error: { message: string } | null }) => unknown,
            rej?: (e: unknown) => unknown,
          ) => exec().then(res, rej),
        };
      },
    }),
  }),
}));

import { POST } from "@/app/api/v1/academy/complete/route";

function req(body: unknown) {
  return new NextRequest("http://localhost/api/v1/academy/complete", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("academy complete", () => {
  beforeEach(() => {
    store.completions = [];
    store.coupons = [];
  });

  it("fails below passing score without writing", async () => {
    const res = await POST(
      req({ email: "a@b.com", slug: "guvenli-yapay-zeka", locale: "tr", answers: [0, 0, 0] }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { passed: boolean; score: number } };
    expect(json.data.passed).toBe(false);
    expect(store.completions).toHaveLength(0);
  });

  it("issues cert + single coupon on pass", async () => {
    const res = await POST(
      req({ email: "a@b.com", slug: "guvenli-yapay-zeka", locale: "tr", answers: [2, 1, 2] }),
    );
    const json = (await res.json()) as {
      data: { passed: boolean; cert_code: string; coupon: { code: string } | null };
    };
    expect(json.data.passed).toBe(true);
    expect(json.data.cert_code).toMatch(/^EYK-/);
    expect(json.data.coupon?.code).toMatch(/^ALPAR-/);
  });

  it("reuses existing cert and coupon on repeat completion", async () => {
    const body = { email: "c@d.com", slug: "verini-koru", locale: "tr", answers: [1, 1, 1] };
    const first = (await (await POST(req(body))).json()) as {
      data: { cert_code: string; coupon: { code: string } };
    };
    const second = (await (await POST(req(body))).json()) as {
      data: { cert_code: string; coupon: { code: string }; repeated: boolean };
    };
    expect(second.data.repeated).toBe(true);
    expect(second.data.cert_code).toBe(first.data.cert_code);
    expect(second.data.coupon.code).toBe(first.data.coupon.code);
    expect(store.coupons).toHaveLength(1);
  });

  it("rejects invalid email and unknown lesson", async () => {
    expect(
      (await POST(req({ email: "nope", slug: "guvenli-yapay-zeka", answers: [2, 1, 2] }))).status,
    ).toBe(400);
    expect((await POST(req({ email: "a@b.com", slug: "yok", answers: [0] }))).status).toBe(404);
  });
});

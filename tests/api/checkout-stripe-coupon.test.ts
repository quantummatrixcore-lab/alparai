import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const couponRow = {
  code: "ALPAR-ABCDEF",
  percent: 15,
  used: false,
  expires_at: new Date(Date.now() + 86400000).toISOString(),
  email: "a@b.com",
};

let couponState: Record<string, unknown> = { ...couponRow };
let sessionPayload: Record<string, unknown> | null = null;
let couponCreated: string | null = null;

vi.mock("@/lib/dehost/server", () => ({
  createServerClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: { id: "u1", email: "a@b.com" } }, error: null }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ limit: async () => ({ data: [], error: null }) }) }),
    }),
  }),
}));

vi.mock("@/lib/dehost/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          limit: async () => ({
            data: table === "academy_coupons" ? [couponState] : [],
            error: null,
          }),
          maybeSingle: async () =>
            table === "subscriptions"
              ? { data: { stripe_customer_id: "cus_1" }, error: null }
              : { data: null, error: null },
        }),
      }),
    }),
  }),
}));

vi.mock("stripe", () => ({
  default: vi.fn(() => ({
    customers: { create: async () => ({ id: "cus_new" }) },
    coupons: {
      retrieve: async (id: string) => {
        if (id === "alpar-academy-15") return { id };
        throw new Error("not found");
      },
      create: async (p: { id: string }) => {
        couponCreated = p.id;
        return { id: p.id };
      },
    },
    checkout: {
      sessions: {
        create: async (p: Record<string, unknown>) => {
          sessionPayload = p;
          return { url: "https://checkout.stripe.test/s/1" };
        },
      },
    },
  })),
}));

function req(body: unknown) {
  return new Request("http://localhost/api/checkout/stripe", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function post(body: unknown) {
  process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_dummy";
  process.env.STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || "price_dummy";
  const { POST } = await import("@/app/api/checkout/stripe/route");
  return POST(req(body));
}

describe("checkout academy coupon", () => {
  beforeEach(() => {
    couponState = { ...couponRow };
    sessionPayload = null;
    couponCreated = null;
  });

  it("applies discount and stamps metadata for a valid coupon", async () => {
    const res = await post({ tier: "pro", locale: "tr", coupon_code: "alpar-abcdef" });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { url: string };
    expect(json.url).toContain("checkout.stripe.test");
    expect(sessionPayload).toMatchObject({
      discounts: [{ coupon: "alpar-academy-15" }],
      metadata: expect.objectContaining({ academy_coupon_code: "ALPAR-ABCDEF" }),
    });
    expect(couponCreated).toBeNull();
  });

  it("rejects used coupons without creating a session", async () => {
    couponState = { ...couponRow, used: true };
    const res = await post({ tier: "pro", coupon_code: "ALPAR-ABCDEF" });
    expect(res.status).toBe(400);
    expect(sessionPayload).toBeNull();
  });

  it("rejects coupons bound to another email", async () => {
    couponState = { ...couponRow, email: "baska@ornek.com" };
    const res = await post({ tier: "pro", coupon_code: "ALPAR-ABCDEF" });
    expect(res.status).toBe(400);
  });

  it("works without a coupon (unchanged behavior)", async () => {
    const res = await post({ tier: "pro" });
    expect(res.status).toBe(200);
    expect(sessionPayload).not.toHaveProperty("discounts");
  });
});

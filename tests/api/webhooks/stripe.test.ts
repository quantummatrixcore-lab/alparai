import { describe, it, expect, vi, beforeEach } from "vitest";
import "../../helpers/setup";

vi.hoisted(() => {
  process.env.STRIPE_SECRET_KEY = "sk_test_mock";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_mock";
});

const mockSubUpsert = vi.fn();
const mockSubEq = vi.fn().mockResolvedValue({ error: null });

const mockSubTable = {
  upsert: mockSubUpsert,
  update: vi.fn().mockReturnThis(),
  eq: mockSubEq,
};

const mockFrom = vi.fn().mockReturnValue(mockSubTable);

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

const mockConstructEvent = vi.fn();

vi.mock("stripe", () => ({
  default: vi.fn(() => ({
    webhooks: { constructEvent: mockConstructEvent },
  })),
}));

import { POST } from "@/app/api/webhooks/stripe/route";

function createMockEvent(type: string, overrides: Record<string, unknown> = {}) {
  return {
    type,
    data: { object: { id: "sub_123", ...overrides } },
  };
}

describe("Stripe Webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSubEq.mockResolvedValue({ error: null });
  });

  it("returns 400 when signature is missing", async () => {
    const req = new Request("http://localhost/api/webhooks/stripe", { method: "POST", body: "{}" });
    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe("missing signature");
  });

  it("returns 400 when signature verification fails", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const req = new Request("http://localhost/api/webhooks/stripe", {
      method: "POST",
      headers: { "stripe-signature": "bad-sig" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe("invalid_signature");
  });

  it("handles checkout.session.completed event", async () => {
    mockConstructEvent.mockReturnValue(
      createMockEvent("checkout.session.completed", {
        metadata: { user_id: "user-1" },
        customer: "cus_123",
        subscription: "sub_123",
      }),
    );
    mockSubUpsert.mockResolvedValue({ error: null });

    const req = new Request("http://localhost/api/webhooks/stripe", {
      method: "POST",
      headers: { "stripe-signature": "valid-sig" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(mockSubUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        stripe_customer_id: "cus_123",
        stripe_subscription_id: "sub_123",
        status: "active",
      }),
      expect.objectContaining({ onConflict: "user_id" }),
    );
  });

  it("handles checkout.session.completed without userId gracefully", async () => {
    mockConstructEvent.mockReturnValue(
      createMockEvent("checkout.session.completed", {
        metadata: {},
        customer: "cus_123",
        subscription: "sub_123",
      }),
    );

    const req = new Request("http://localhost/api/webhooks/stripe", {
      method: "POST",
      headers: { "stripe-signature": "valid-sig" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockSubUpsert).not.toHaveBeenCalled();
  });

  it("handles customer.subscription.updated event", async () => {
    mockConstructEvent.mockReturnValue({
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_123",
          status: "active",
          items: {
            data: [
              {
                current_period_start: 1000000,
                current_period_end: 2000000,
                price: { id: "price_pro" },
              },
            ],
          },
        },
      },
    });

    const req = new Request("http://localhost/api/webhooks/stripe", {
      method: "POST",
      headers: { "stripe-signature": "valid-sig" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(mockSubTable.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "active", stripe_price_id: "price_pro" }),
    );
    expect(mockSubEq).toHaveBeenCalledWith("stripe_subscription_id", "sub_123");
  });

  it("handles customer.subscription.deleted event", async () => {
    mockConstructEvent.mockReturnValue(
      createMockEvent("customer.subscription.deleted", { id: "sub_456" }),
    );

    const req = new Request("http://localhost/api/webhooks/stripe", {
      method: "POST",
      headers: { "stripe-signature": "valid-sig" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(mockSubTable.update).toHaveBeenCalledWith({ status: "canceled" });
    expect(mockSubEq).toHaveBeenCalledWith("stripe_subscription_id", "sub_456");
  });

  it("returns 200 for unknown event types", async () => {
    mockConstructEvent.mockReturnValue(createMockEvent("charge.succeeded"));

    const req = new Request("http://localhost/api/webhooks/stripe", {
      method: "POST",
      headers: { "stripe-signature": "valid-sig" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.received).toBe(true);
  });
});

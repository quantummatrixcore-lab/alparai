import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import "../../helpers/setup";

const TEST_SECRET = "whsec_ls_mock_secret_12345678901234";

vi.hoisted(() => {
  process.env.LEMONSQUEEZY_WEBHOOK_SECRET = "whsec_ls_mock_secret_12345678901234";
});

const mockSubUpsert = vi.fn().mockResolvedValue({ error: null });
const mockSubEq = vi.fn();

const mockSubTable = {
  upsert: mockSubUpsert,
  update: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: mockSubEq,
  single: vi.fn().mockResolvedValue({ data: { id: "resolved-user-id" }, error: null }),
  then: function (resolve: (value: { error: null }) => void) {
    resolve({ error: null });
  },
};
mockSubEq.mockReturnValue(mockSubTable);
mockSubEq.mockImplementation(() => mockSubTable);

const mockFrom = vi.fn().mockReturnValue(mockSubTable);

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

vi.mock("@/lib/billing/invoices", () => ({
  processAutonomousPdfInvoice: vi.fn().mockResolvedValue({ invoiceId: "inv_123", stored: true }),
}));

import { POST } from "@/app/api/webhooks/lemonsqueezy/route";

function signPayload(bodyStr: string, secret: string = TEST_SECRET): string {
  return crypto.createHmac("sha256", secret).update(bodyStr).digest("hex");
}

function createLemonEvent(eventName: string, customData: Record<string, unknown> = {}, attributes: Record<string, unknown> = {}) {
  return {
    meta: {
      event_name: eventName,
      custom_data: customData,
    },
    data: {
      id: "ls_evt_999",
      type: eventName.startsWith("order") ? "orders" : "subscriptions",
      attributes: {
        store_id: 469668,
        customer_id: 12345,
        user_email: "test@example.com",
        total: 99000,
        currency: "TRY",
        status: "paid",
        ...attributes,
      },
    },
  };
}

describe("Lemon Squeezy Webhook Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSubUpsert.mockResolvedValue({ error: null });
    mockSubEq.mockReturnValue(mockSubTable);
  });

  it("returns 400 when x-signature header is missing", async () => {
    const req = new Request("http://localhost/api/webhooks/lemonsqueezy", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe("missing signature");
  });

  it("returns 400 when x-signature verification fails", async () => {
    const bodyStr = JSON.stringify({ test: "data" });
    const req = new Request("http://localhost/api/webhooks/lemonsqueezy", {
      method: "POST",
      headers: { "x-signature": "bad_hex_signature" },
      body: bodyStr,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe("invalid_signature");
  });

  it("handles order_created with valid signature and upgrades user tier", async () => {
    const event = createLemonEvent("order_created", { user_id: "user-alpha", tier: "developer" });
    const bodyStr = JSON.stringify(event);
    const validSignature = signPayload(bodyStr);

    const req = new Request("http://localhost/api/webhooks/lemonsqueezy", {
      method: "POST",
      headers: { "x-signature": validSignature },
      body: bodyStr,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.received).toBe(true);
    expect(json.event).toBe("order_created");

    expect(mockSubUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-alpha",
        plan: "developer",
        status: "active",
      }),
      expect.objectContaining({ onConflict: "user_id" }),
    );
  });

  it("resolves user by email when user_id is missing in custom_data", async () => {
    const event = createLemonEvent("order_created", {}, { user_email: "lookup@domain.com" });
    const bodyStr = JSON.stringify(event);
    const validSignature = signPayload(bodyStr);

    const req = new Request("http://localhost/api/webhooks/lemonsqueezy", {
      method: "POST",
      headers: { "x-signature": validSignature },
      body: bodyStr,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(mockFrom).toHaveBeenCalledWith("users");
  });

  it("handles subscription_updated and updates active status", async () => {
    const event = createLemonEvent("subscription_updated", { user_id: "user-beta", tier: "developer" }, { status: "active" });
    const bodyStr = JSON.stringify(event);
    const validSignature = signPayload(bodyStr);

    const req = new Request("http://localhost/api/webhooks/lemonsqueezy", {
      method: "POST",
      headers: { "x-signature": validSignature },
      body: bodyStr,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(mockSubTable.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "active", plan: "developer" }),
    );
  });

  it("handles subscription_cancelled and revokes tier to free", async () => {
    const event = createLemonEvent("subscription_cancelled", { user_id: "user-gamma" }, { status: "cancelled" });
    const bodyStr = JSON.stringify(event);
    const validSignature = signPayload(bodyStr);

    const req = new Request("http://localhost/api/webhooks/lemonsqueezy", {
      method: "POST",
      headers: { "x-signature": validSignature },
      body: bodyStr,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(mockSubTable.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "canceled", plan: "free" }),
    );
  });
});

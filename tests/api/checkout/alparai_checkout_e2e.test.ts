import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import "../../helpers/setup";

const TEST_SECRET = "whsec_alparai_sandbox_test_secret_998877665544";
const TEST_API_KEY = "mock_ls_jwt_api_key_alparai_sandbox_12345";
const TEST_STORE_ID = "469668";
const TEST_VARIANT_ID = "2103062";

vi.hoisted(() => {
  process.env.LEMONSQUEEZY_WEBHOOK_SECRET = "whsec_alparai_sandbox_test_secret_998877665544";
  process.env.LEMONSQUEEZY_API_KEY = "mock_ls_jwt_api_key_alparai_sandbox_12345";
  process.env.LEMONSQUEEZY_STORE_ID = "469668";
  process.env.LEMONSQUEEZY_VARIANT_ID = "2103062";
  process.env.NEXT_PUBLIC_APP_URL = "https://alparai.com";
});

// Database & Service Mocks
const mockGetUser = vi.fn();
vi.mock("@/lib/dehost/server", () => ({
  createServerClient: () =>
    Promise.resolve({
      auth: {
        getUser: mockGetUser,
      },
    }),
}));

const mockSubUpsert = vi.fn().mockResolvedValue({ error: null });
const mockSubUpdate = vi.fn();
const mockSubSelect = vi.fn();
const mockSubEq = vi.fn();

const mockSubTable = {
  upsert: mockSubUpsert,
  update: mockSubUpdate,
  select: mockSubSelect,
  eq: mockSubEq,
  single: vi.fn().mockResolvedValue({ data: { id: "resolved-user-by-email" }, error: null }),
  then: function (resolve: (value: { error: null }) => void) {
    resolve({ error: null });
  },
};
mockSubUpdate.mockReturnValue(mockSubTable);
mockSubSelect.mockReturnValue(mockSubTable);
mockSubEq.mockReturnValue(mockSubTable);

const mockFrom = vi.fn().mockReturnValue(mockSubTable);
vi.mock("@/lib/dehost/admin", () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

const mockProcessInvoice = vi.fn().mockResolvedValue({ invoiceId: "inv_e2e_001", stored: true });
vi.mock("@/lib/billing/invoices", () => ({
  processAutonomousPdfInvoice: (...args: unknown[]) => mockProcessInvoice(...args),
}));

// Import Target Route Handlers
import { POST as handleCheckout } from "@/app/api/checkout/lemonsqueezy/route";
import { POST as handleWebhook } from "@/app/api/webhooks/lemonsqueezy/route";

function signPayload(bodyStr: string, secret: string = TEST_SECRET): string {
  return crypto.createHmac("sha256", secret).update(bodyStr).digest("hex");
}

function flushMicrotasks(ms: number = 30): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildMockOrderEvent(options: {
  eventName?: string;
  orderId?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  tier?: string;
  amount?: number;
  currency?: string;
  status?: string;
}) {
  const eventName = options.eventName || "order_created";
  const orderId = options.orderId || `ord_sandbox_${Date.now()}`;
  const userId = options.userId || "usr_e2e_alparai_test";
  const userEmail = options.userEmail || "explorer@alparai.com";
  const userName = options.userName || "AlparAi Test Operator";
  const tier = options.tier || "developer";
  const amount = options.amount || 99000;
  const currency = options.currency || "TRY";
  const status = options.status || "paid";

  return {
    meta: {
      event_name: eventName,
      custom_data: {
        user_id: userId,
        userId: userId,
        tier: tier,
        locale: "tr",
      },
    },
    data: {
      id: orderId,
      type: eventName.startsWith("order") ? "orders" : "subscriptions",
      attributes: {
        store_id: Number(TEST_STORE_ID),
        customer_id: 888123,
        identifier: `chk-uuid-${Date.now()}`,
        order_number: 100201,
        user_name: userName,
        user_email: userEmail,
        currency: currency,
        subtotal: amount,
        discount_total: 0,
        tax: 0,
        total: amount,
        status: status,
        refunded: false,
        test_mode: true,
        created_at: new Date().toISOString(),
      },
    },
  };
}

describe("URETIM-020: AlparAi LemonSqueezy Checkout & Webhook E2E Sandbox Verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET = TEST_SECRET;
    process.env.LEMONSQUEEZY_API_KEY = TEST_API_KEY;
    process.env.LEMONSQUEEZY_STORE_ID = TEST_STORE_ID;
    process.env.LEMONSQUEEZY_VARIANT_ID = TEST_VARIANT_ID;
    process.env.NEXT_PUBLIC_APP_URL = "https://alparai.com";
    mockSubUpsert.mockResolvedValue({ error: null });
    mockSubUpdate.mockReturnValue(mockSubTable);
    mockSubSelect.mockReturnValue(mockSubTable);
    mockSubEq.mockReturnValue(mockSubTable);
  });

  describe("Phase 1: Checkout Session Initialization (Sandbox/Test Mode)", () => {
    it("Step 1.1: Creates a valid checkout session for authenticated customer in sandbox mode", async () => {
      mockGetUser.mockResolvedValueOnce({
        data: {
          user: {
            id: "usr_auth_sandbox_99",
            email: "auth-user@alparai.com",
            user_metadata: { full_name: "Sovereign Pilot" },
          },
        },
        error: null,
      });

      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () =>
          Promise.resolve({
            data: {
              id: "chk_sandbox_sess_101",
              type: "checkouts",
              attributes: {
                url: "https://alparai.lemonsqueezy.com/checkout/buy/chk_sandbox_sess_101?test_mode=1",
              },
            },
          }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const request = new Request("http://localhost/api/checkout/lemonsqueezy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: "developer", locale: "tr" }),
      });

      const response = await handleCheckout(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.ok).toBe(true);
      expect(data.id).toBe("chk_sandbox_sess_101");
      expect(data.url).toContain("lemonsqueezy.com/checkout/buy");

      // Verify sandbox payload transmission
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [, fetchOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
      const payload = JSON.parse(fetchOptions.body as string);

      expect(payload.data.relationships.store.data.id).toBe(TEST_STORE_ID);
      expect(payload.data.relationships.variant.data.id).toBe(TEST_VARIANT_ID);
      expect(payload.data.attributes.checkout_data.email).toBe("auth-user@alparai.com");
      expect(payload.data.attributes.checkout_data.name).toBe("Sovereign Pilot");
      expect(payload.data.attributes.checkout_data.custom.user_id).toBe("usr_auth_sandbox_99");
      expect(payload.data.attributes.checkout_data.custom.tier).toBe("developer");
      expect(payload.data.attributes.product_options.redirect_url).toBe(
        "https://alparai.com/tr/dashboard?payment=success",
      );
    });

    it("Step 1.2: Creates a valid checkout session for guest customer with email", async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: null },
        error: new Error("Guest session"),
      });

      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () =>
          Promise.resolve({
            data: {
              id: "chk_sandbox_guest_202",
              type: "checkouts",
              attributes: {
                url: "https://alparai.lemonsqueezy.com/checkout/buy/chk_sandbox_guest_202?test_mode=1",
              },
            },
          }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const request = new Request("http://localhost/api/checkout/lemonsqueezy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "guest.buyer@techcorp.io", tier: "vendor", locale: "en" }),
      });

      const response = await handleCheckout(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.ok).toBe(true);
      expect(data.id).toBe("chk_sandbox_guest_202");

      const [, fetchOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
      const payload = JSON.parse(fetchOptions.body as string);
      expect(payload.data.attributes.checkout_data.email).toBe("guest.buyer@techcorp.io");
      expect(payload.data.attributes.checkout_data.custom.user_id).toBe("guest");
      expect(payload.data.attributes.checkout_data.custom.tier).toBe("vendor");
      expect(payload.data.attributes.product_options.redirect_url).toBe(
        "https://alparai.com/en/dashboard?payment=success",
      );
    });

    it("Step 1.3: Gracefully handles missing API key configuration with HTTP 503", async () => {
      delete process.env.LEMONSQUEEZY_API_KEY;

      const request = new Request("http://localhost/api/checkout/lemonsqueezy", {
        method: "POST",
        body: JSON.stringify({ tier: "developer" }),
      });

      const response = await handleCheckout(request);
      expect(response.status).toBe(503);

      const json = await response.json();
      expect(json.error).toContain("not configured");
    });

    it("Step 1.4: Handles LemonSqueezy upstream error responses safely (400 Bad Request)", async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: () =>
          Promise.resolve({
            errors: [{ detail: "The variant 9999999 is inactive or does not belong to this store." }],
          }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const request = new Request("http://localhost/api/checkout/lemonsqueezy", {
        method: "POST",
        body: JSON.stringify({ variantId: "9999999" }),
      });

      const response = await handleCheckout(request);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.error).toContain("The variant 9999999 is inactive");
    });
  });

  describe("Phase 2: Webhook Security & Ingestion Gate", () => {
    it("Step 2.1: Rejects webhook payload missing x-signature header (HTTP 400)", async () => {
      const event = buildMockOrderEvent({});
      const bodyStr = JSON.stringify(event);

      const request = new Request("http://localhost/api/webhooks/lemonsqueezy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyStr,
      });

      const response = await handleWebhook(request);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.error).toBe("missing signature");
    });

    it("Step 2.2: Rejects tampered or forged HMAC-SHA256 signature (HTTP 400)", async () => {
      const event = buildMockOrderEvent({});
      const bodyStr = JSON.stringify(event);
      const forgedSignature = "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0";

      const request = new Request("http://localhost/api/webhooks/lemonsqueezy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-signature": forgedSignature,
        },
        body: bodyStr,
      });

      const response = await handleWebhook(request);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.error).toBe("invalid_signature");
    });

    it("Step 2.3: Rejects malformed JSON body even with signature (HTTP 400)", async () => {
      const corruptBody = "{ bad json string: true, ";
      const validSigForCorruptBody = signPayload(corruptBody);

      const request = new Request("http://localhost/api/webhooks/lemonsqueezy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-signature": validSigForCorruptBody,
        },
        body: corruptBody,
      });

      const response = await handleWebhook(request);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.error).toBe("invalid_json");
    });
  });

  describe("Phase 3: Order Lifecycle E2E Simulation (order_created)", () => {
    it("Step 3.1: Processes sandbox order_created, upgrades tier, and triggers PDF invoice", async () => {
      const orderEvent = buildMockOrderEvent({
        eventName: "order_created",
        orderId: "ord_e2e_sandbox_555",
        userId: "usr_sandbox_alpha",
        userEmail: "alpha@alparai.com",
        tier: "developer",
        amount: 99000,
        currency: "TRY",
      });

      const bodyStr = JSON.stringify(orderEvent);
      const validSignature = signPayload(bodyStr);

      const request = new Request("http://localhost/api/webhooks/lemonsqueezy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-signature": validSignature,
        },
        body: bodyStr,
      });

      const response = await handleWebhook(request);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.received).toBe(true);
      expect(json.event).toBe("order_created");

      // Wait for background tasks to complete
      await flushMicrotasks(50);

      // Verify database subscriptions upsert
      expect(mockSubUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "usr_sandbox_alpha",
          plan: "developer",
          status: "active",
        }),
        expect.objectContaining({ onConflict: "user_id" }),
      );

      // Verify api_keys table update
      expect(mockFrom).toHaveBeenCalledWith("api_keys");
      expect(mockSubUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          tier: "developer",
        }),
      );

      // Verify users table update
      expect(mockFrom).toHaveBeenCalledWith("users");
      expect(mockSubUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          subscription_tier: "developer",
        }),
      );

      // Verify autonomous PDF invoice generation
      expect(mockProcessInvoice).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "usr_sandbox_alpha",
          customerEmail: "alpha@alparai.com",
          amount: 99000,
          currency: "try",
          plan: "developer",
        }),
      );
    });

    it("Step 3.2: Upgrades to enterprise tier when tier=enterprise is specified", async () => {
      const orderEvent = buildMockOrderEvent({
        eventName: "order_created",
        orderId: "ord_e2e_ent_777",
        userId: "usr_ent_client",
        userEmail: "corp@enterprise.org",
        tier: "enterprise",
      });

      const bodyStr = JSON.stringify(orderEvent);
      const validSignature = signPayload(bodyStr);

      const request = new Request("http://localhost/api/webhooks/lemonsqueezy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-signature": validSignature,
        },
        body: bodyStr,
      });

      const response = await handleWebhook(request);
      expect(response.status).toBe(200);

      await flushMicrotasks(30);

      expect(mockSubUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "usr_ent_client",
          plan: "enterprise",
          status: "active",
        }),
        expect.anything(),
      );
    });
  });

  describe("Phase 4: Subscription Lifecycle Simulation (created, updated, cancelled, refunded)", () => {
    it("Step 4.1: Activates subscription on subscription_created & subscription_payment_success", async () => {
      const subCreatedEvent = {
        meta: {
          event_name: "subscription_created",
          custom_data: { user_id: "usr_sub_client", tier: "developer" },
        },
        data: {
          id: "sub_ls_111222",
          type: "subscriptions",
          attributes: {
            store_id: 469668,
            customer_id: 333444,
            user_email: "sub.client@alparai.com",
            status: "active",
            product_name: "AlparAI Developer Pass",
          },
        },
      };

      const bodyStr = JSON.stringify(subCreatedEvent);
      const signature = signPayload(bodyStr);

      const request = new Request("http://localhost/api/webhooks/lemonsqueezy", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-signature": signature },
        body: bodyStr,
      });

      const response = await handleWebhook(request);
      expect(response.status).toBe(200);

      await flushMicrotasks(30);

      expect(mockSubUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "usr_sub_client",
          stripe_subscription_id: "sub_ls_111222",
          plan: "developer",
          status: "active",
        }),
        expect.objectContaining({ onConflict: "user_id" }),
      );
    });

    it("Step 4.2: Handles subscription_updated and modifies current period expiration", async () => {
      const renewsAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
      const subUpdatedEvent = {
        meta: {
          event_name: "subscription_updated",
          custom_data: { user_id: "usr_sub_client", tier: "developer" },
        },
        data: {
          id: "sub_ls_111222",
          type: "subscriptions",
          attributes: {
            status: "active",
            renews_at: renewsAt,
          },
        },
      };

      const bodyStr = JSON.stringify(subUpdatedEvent);
      const signature = signPayload(bodyStr);

      const request = new Request("http://localhost/api/webhooks/lemonsqueezy", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-signature": signature },
        body: bodyStr,
      });

      const response = await handleWebhook(request);
      expect(response.status).toBe(200);

      await flushMicrotasks(30);

      expect(mockSubUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "active",
          plan: "developer",
          current_period_end: renewsAt,
        }),
      );
    });

    it("Step 4.3: Revokes access on subscription_cancelled by downgrading tier to 'free'", async () => {
      const subCancelledEvent = {
        meta: {
          event_name: "subscription_cancelled",
          custom_data: { user_id: "usr_sub_client" },
        },
        data: {
          id: "sub_ls_111222",
          type: "subscriptions",
          attributes: {
            status: "cancelled",
          },
        },
      };

      const bodyStr = JSON.stringify(subCancelledEvent);
      const signature = signPayload(bodyStr);

      const request = new Request("http://localhost/api/webhooks/lemonsqueezy", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-signature": signature },
        body: bodyStr,
      });

      const response = await handleWebhook(request);
      expect(response.status).toBe(200);

      await flushMicrotasks(30);

      // Subscriptions table must mark canceled
      expect(mockSubUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "canceled",
          plan: "free",
        }),
      );

      // api_keys table tier must be revoked to 'free'
      expect(mockSubUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          tier: "free",
        }),
      );

      // users table subscription_tier must be revoked to 'free'
      expect(mockSubUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          subscription_tier: "free",
        }),
      );
    });

    it("Step 4.4: Immediately revokes access on order_refunded", async () => {
      const orderRefundedEvent = {
        meta: {
          event_name: "order_refunded",
          custom_data: { user_id: "usr_refund_client" },
        },
        data: {
          id: "ord_ls_999000",
          type: "orders",
          attributes: {
            status: "refunded",
          },
        },
      };

      const bodyStr = JSON.stringify(orderRefundedEvent);
      const signature = signPayload(bodyStr);

      const request = new Request("http://localhost/api/webhooks/lemonsqueezy", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-signature": signature },
        body: bodyStr,
      });

      const response = await handleWebhook(request);
      expect(response.status).toBe(200);

      await flushMicrotasks(30);

      expect(mockSubUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "canceled",
          plan: "free",
        }),
      );
    });
  });
});

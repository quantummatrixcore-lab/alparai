import { describe, it, expect, vi, beforeEach } from "vitest";
import "../../helpers/setup";

vi.hoisted(() => {
  process.env.STRIPE_SECRET_KEY = "sk_test_mock";
  process.env.STRIPE_PRO_PRICE_ID = "price_mock";
  process.env.NEXT_PUBLIC_APP_URL = "https://alparai.com";
});

const mockGetUser = vi.fn();
const mockSubMaybeSingle = vi.fn();
const mockSubInsert = vi.fn();

const mockSubSelect = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  maybeSingle: mockSubMaybeSingle,
  insert: mockSubInsert,
};

const mockFrom = vi.fn().mockReturnValue(mockSubSelect);

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    auth: { getUser: mockGetUser },
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}));

const mockCheckoutSessionsCreate = vi.fn();
const mockCustomersCreate = vi.fn();

vi.mock("stripe", () => ({
  default: vi.fn(() => ({
    checkout: { sessions: { create: mockCheckoutSessionsCreate } },
    customers: { create: mockCustomersCreate },
  })),
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { POST } from "@/app/api/checkout/stripe/route";

describe("Stripe Checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error("no auth") });

    const req = new Request("http://localhost/api/checkout/stripe", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.error).toBe("unauthorized");
  });

  it("creates checkout session for existing customer", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "test@test.com" } },
      error: null,
    });
    mockSubMaybeSingle.mockResolvedValue({
      data: { stripe_customer_id: "cus_existing" },
      error: null,
    });
    mockCheckoutSessionsCreate.mockResolvedValue({
      url: "https://checkout.stripe.com/session_123",
    });

    const req = new Request("http://localhost/api/checkout/stripe", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.url).toBe("https://checkout.stripe.com/session_123");
    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "cus_existing", mode: "subscription" }),
    );
    expect(mockCustomersCreate).not.toHaveBeenCalled();
  });

  it("creates new customer and checkout session for new user", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-2", email: "new@test.com" } },
      error: null,
    });
    mockSubMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockCustomersCreate.mockResolvedValue({ id: "cus_new" });
    mockSubInsert.mockResolvedValue({ error: null });
    mockCheckoutSessionsCreate.mockResolvedValue({
      url: "https://checkout.stripe.com/session_456",
    });

    const req = new Request("http://localhost/api/checkout/stripe", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.url).toBe("https://checkout.stripe.com/session_456");
    expect(mockCustomersCreate).toHaveBeenCalledWith(
      expect.objectContaining({ email: "new@test.com", metadata: { user_id: "user-2" } }),
    );
  });

  it("returns 500 when checkout session creation fails", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "test@test.com" } },
      error: null,
    });
    mockSubMaybeSingle.mockResolvedValue({
      data: { stripe_customer_id: "cus_existing" },
      error: null,
    });
    mockCheckoutSessionsCreate.mockRejectedValue(new Error("Stripe API error"));

    const req = new Request("http://localhost/api/checkout/stripe", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error).toBe("checkout_failed");
  });
});

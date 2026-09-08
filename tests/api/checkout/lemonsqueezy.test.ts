import { describe, it, expect, vi, beforeEach } from "vitest";
import "../../helpers/setup";

const mockGetUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () =>
    Promise.resolve({
      auth: {
        getUser: mockGetUser,
      },
    }),
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { POST } from "@/app/api/checkout/lemonsqueezy/route";

describe("Lemon Squeezy Checkout Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.LEMONSQUEEZY_API_KEY = "mock_ls_jwt_api_key_123456789";
    process.env.LEMONSQUEEZY_STORE_ID = "469668";
    process.env.LEMONSQUEEZY_VARIANT_ID = "2103062";
    process.env.NEXT_PUBLIC_APP_URL = "https://alparai.com";
  });

  it("returns 503 when LEMONSQUEEZY_API_KEY is missing", async () => {
    delete process.env.LEMONSQUEEZY_API_KEY;

    const req = new Request("http://localhost/api/checkout/lemonsqueezy", {
      method: "POST",
      body: JSON.stringify({ tier: "developer" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.error).toContain("not configured");
  });

  it("successfully creates checkout session for authenticated user", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: {
        user: {
          id: "usr_auth_123",
          email: "founder@example.com",
          user_metadata: { full_name: "Founder CEO" },
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
            id: "chk_ls_888",
            attributes: {
              url: "https://alparai.lemonsqueezy.com/checkout/custom/888",
            },
          },
        }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const req = new Request("http://localhost/api/checkout/lemonsqueezy", {
      method: "POST",
      body: JSON.stringify({ tier: "developer", locale: "tr" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.url).toBe("https://alparai.lemonsqueezy.com/checkout/custom/888");
    expect(json.id).toBe("chk_ls_888");

    // Verify fetch payload
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const callArgs = mockFetch.mock.calls[0] as [string, RequestInit];
    const options = callArgs[1];
    const payload = JSON.parse(options.body as string);
    expect(payload.data.relationships.store.data.id).toBe("469668");
    expect(payload.data.relationships.variant.data.id).toBe("2103062");
    expect(payload.data.attributes.checkout_data.email).toBe("founder@example.com");
    expect(payload.data.attributes.checkout_data.custom.user_id).toBe("usr_auth_123");
  });

  it("successfully creates checkout session for guest user", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error("No session"),
    });

    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () =>
        Promise.resolve({
          data: {
            id: "chk_ls_guest_111",
            attributes: {
              url: "https://alparai.lemonsqueezy.com/checkout/custom/guest_111",
            },
          },
        }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const req = new Request("http://localhost/api/checkout/lemonsqueezy", {
      method: "POST",
      body: JSON.stringify({ email: "guest@tech.com", locale: "en" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.url).toContain("custom/guest_111");

    const callArgs = mockFetch.mock.calls[0] as [string, RequestInit];
    const options = callArgs[1];
    const payload = JSON.parse(options.body as string);
    expect(payload.data.attributes.checkout_data.email).toBe("guest@tech.com");
    expect(payload.data.attributes.checkout_data.custom.user_id).toBeNull();
  });

  it("handles Lemon Squeezy API rejection with 400/502 status", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: () =>
        Promise.resolve({
          errors: [{ detail: "Invalid variant ID provided." }],
        }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const req = new Request("http://localhost/api/checkout/lemonsqueezy", {
      method: "POST",
      body: JSON.stringify({ variantId: "invalid" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("Invalid variant ID");
  });
});

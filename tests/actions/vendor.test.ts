/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHash } from "node:crypto";
import "../helpers/setup";

const mockDeHost = {
  from: vi.fn(),
};

const mockAdminClient = {
  from: vi.fn(),
};

vi.mock("@/lib/dehost/server", () => ({
  createClient: vi.fn().mockImplementation(() => Promise.resolve(mockDeHost)),
  createServerClient: vi.fn().mockImplementation(() => Promise.resolve(mockDeHost)),
}));

vi.mock("@/lib/dehost/admin", () => ({
  createAdminClient: vi.fn().mockImplementation(() => mockAdminClient),
}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn(),
  requireAdmin: vi.fn(),
}));

vi.mock("@/lib/utils/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ ok: true, remaining: 10 }),
  RATE_LIMIT_KEYS: {
    provider_response: "ratelimit:provider_response",
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
  }),
}));

import { submitVendorResponseAction } from "@/actions/vendor";
import { getCurrentUser } from "@/lib/auth/session";

describe("submitVendorResponseAction", () => {
  const testIncidentId = "11111111-2222-3333-4444-555555555555";
  const testResponseText = "This is our official and verified vendor statement regarding the reported issue.";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue(null);
  });

  it("rejects unauthorized submission without session or token", async () => {
    const result = await submitVendorResponseAction(testIncidentId, testResponseText);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Unauthorized");
  });

  it("rejects fake vtr_ prefix token that does not exist in database", async () => {
    // Mock admin client querying ai_providers returning null
    mockAdminClient.from.mockImplementation((tableName: string) => {
      if (tableName === "ai_providers" || tableName === "provider_response_tokens") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              gt: () => ({
                is: () => ({
                  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
          }),
        };
      }
      return { update: () => ({ eq: () => Promise.resolve({ error: null }) }) };
    });

    const result = await submitVendorResponseAction(
      testIncidentId,
      testResponseText,
      "vtr_fake_token_1234567890abcdef",
    );

    expect(result.ok).toBe(false);
    expect(result.error).toContain("Unauthorized");
  });

  it("authorizes and succeeds when token matches ai_providers.token_hash", async () => {
    const rawToken = "valid_vendor_api_token_secret_9999";
    const expectedHash = createHash("sha256").update(rawToken).digest("hex");

    mockAdminClient.from.mockImplementation((tableName: string) => {
      if (tableName === "ai_providers") {
        return {
          select: () => ({
            eq: (_col: string, val: string) => {
              if (val === expectedHash) {
                return {
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: { id: "provider-uuid", is_verified: true },
                    error: null,
                  }),
                };
              }
              return {
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              };
            },
          }),
        };
      }
      if (tableName === "incidents") {
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        };
      }
      return { select: () => ({ eq: () => ({ maybeSingle: vi.fn() }) }) };
    });

    const result = await submitVendorResponseAction(testIncidentId, testResponseText, rawToken);
    expect(result.ok).toBe(true);
    expect(result.vendorResponseAt).toBeDefined();
  });
});

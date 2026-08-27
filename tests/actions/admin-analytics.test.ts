import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  requireAdmin: vi.fn().mockResolvedValue({ id: "admin" }),
}));

import { getPlausibleMetrics } from "@/actions/admin/analytics";

describe("Admin Analytics - getPlausibleMetrics", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.PLAUSIBLE_API_KEY = "test-key";
    process.env.PLAUSIBLE_SITE_ID = "test-site";
  });

  it("returns error if API key is missing", async () => {
    delete process.env.PLAUSIBLE_API_KEY;
    const result = await getPlausibleMetrics();
    expect(result.error).toContain("PLAUSIBLE_API_KEY is not set");
    expect(result.visitors).toBe(0);
  });

  it("returns metrics successfully on valid fetch", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: {
          visitors: { value: 100 },
          pageviews: { value: 200 },
        },
      }),
    });

    const result = await getPlausibleMetrics();
    expect(result.error).toBeNull();
    expect(result.visitors).toBe(100);
    expect(result.pageviews).toBe(200);
  });

  it("returns error on fetch failure", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    const result = await getPlausibleMetrics();
    expect(result.error).toContain("Failed to fetch");
    expect(result.visitors).toBe(0);
  });
});

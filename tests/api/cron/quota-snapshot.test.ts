import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "../../helpers/setup";
import type { NextRequest } from "next/server";

const mockUpsert = vi.fn();
const mockRpc = vi.fn();

const mockFrom = vi.fn().mockImplementation(() => ({
  upsert: mockUpsert,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    rpc: mockRpc,
    from: mockFrom,
  }),
}));

import { GET } from "@/app/api/cron/quota-snapshot/route";

const originalFetch = global.fetch;

function okJson(data: unknown) {
  return { ok: true, status: 200, json: async () => data };
}

function failJson(status = 500) {
  return { ok: false, status, json: async () => ({}) };
}

function buildFetchMock(handler: (url: string) => unknown) {
  const fetchMock = vi.fn((input: string) => Promise.resolve(handler(input)));
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

function makeAuthRequest() {
  return new Request("http://localhost/api/cron/quota-snapshot", {
    headers: { authorization: "Bearer test-secret" },
  });
}

function successHandler(url: string): unknown {
  if (url === "https://api.github.com/user") return okJson({ login: "alparai" });
  if (url.includes("settings/billing/actions")) {
    return okJson({ total_minutes_used: 690, included_minutes: 3000 });
  }
  if (url.includes("api.vercel.com")) {
    return okJson({ charges: [{ ConsumedQuantity: 1073741824, ConsumedUnit: "BYTES" }] });
  }
  return failJson(404);
}

describe("Quota Snapshot Cron Route (/api/cron/quota-snapshot)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-secret";
    process.env.GITHUB_TOKEN = "test-gh-token";
    process.env.VERCEL_TOKEN = "test-vercel-token";
    mockRpc.mockResolvedValue({ data: 52428800, error: null });
    mockUpsert.mockResolvedValue({ data: null, error: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    delete process.env.CRON_SECRET;
    delete process.env.GITHUB_TOKEN;
    delete process.env.VERCEL_TOKEN;
    delete process.env.GITHUB_ORG;
    global.fetch = originalFetch;
  });

  it("returns 401 without valid CRON_SECRET in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const res = await GET(new Request("http://localhost/api/cron/quota-snapshot") as NextRequest);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("accepts x-vercel-cron header in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    buildFetchMock(successHandler);
    const req = new Request("http://localhost/api/cron/quota-snapshot", {
      headers: { "x-vercel-cron": "1" },
    });
    const res = await GET(req as NextRequest);
    expect(res.status).toBe(200);
  });

  it("captures GitHub, Vercel, and Supabase and writes source='api' rows", async () => {
    buildFetchMock(successHandler);

    const res = await GET(makeAuthRequest() as NextRequest);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.captured).toHaveLength(3);
    expect(body.skipped).toEqual([]);

    expect(mockRpc).toHaveBeenCalledWith("get_database_size");
    expect(mockFrom).toHaveBeenCalledWith("vendor_quotas");
    expect(mockUpsert).toHaveBeenCalledTimes(1);

    const rows = mockUpsert.mock.calls[0]?.[0] as Array<Record<string, unknown>>;
    expect(rows).toHaveLength(3);

    const gh = rows.find((r) => r.vendor === "github_actions");
    expect(gh).toMatchObject({
      vendor: "github_actions",
      metric: "minutes",
      used_value: 690,
      limit_value: 3000,
      unit: "minutes",
      source: "api",
    });

    const vercel = rows.find((r) => r.vendor === "vercel");
    expect(vercel).toMatchObject({
      vendor: "vercel",
      metric: "bandwidth_gb",
      used_value: 1,
      limit_value: null,
      unit: "GB",
      source: "api",
    });

    const supabase = rows.find((r) => r.vendor === "supabase");
    expect(supabase).toMatchObject({
      vendor: "supabase",
      metric: "db_size_gb",
      used_value: 52428800 / 1024 ** 3,
      limit_value: 0.5,
      unit: "GB",
      plan_name: "Free",
      source: "api",
    });

    for (const row of rows) {
      expect(typeof row.period_start).toBe("string");
      expect(typeof row.period_end).toBe("string");
      expect(new Date(row.period_end as string) >= new Date(row.period_start as string)).toBe(true);
    }
  });

  it("skips GitHub when billing API fails", async () => {
    buildFetchMock((url) => {
      if (url === "https://api.github.com/user") return okJson({ login: "alparai" });
      if (url.includes("settings/billing/actions")) return failJson(500);
      return successHandler(url);
    });

    const res = await GET(makeAuthRequest() as NextRequest);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.captured.map((c: { vendor: string }) => c.vendor)).toEqual(["vercel", "supabase"]);
    expect(body.skipped).toContain("github_actions");

    const rows = mockUpsert.mock.calls[0]?.[0] as Array<Record<string, unknown>>;
    expect(rows.find((r) => r.vendor === "github_actions")).toBeUndefined();
  });

  it("skips Vercel when no bandwidth usage is reported", async () => {
    buildFetchMock((url) => {
      if (url.includes("api.vercel.com")) {
        return okJson({ charges: [{ BilledCost: 5, ChargeCategory: "Usage" }] });
      }
      return successHandler(url);
    });

    const res = await GET(makeAuthRequest() as NextRequest);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.captured.map((c: { vendor: string }) => c.vendor)).toEqual([
      "github_actions",
      "supabase",
    ]);
    expect(body.skipped).toContain("vercel");
  });

  it("skips Supabase when RPC fails", async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: "rpc unavailable" } });
    buildFetchMock(successHandler);

    const res = await GET(makeAuthRequest() as NextRequest);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.captured.map((c: { vendor: string }) => c.vendor)).toEqual([
      "github_actions",
      "vercel",
    ]);
    expect(body.skipped).toContain("supabase");
  });

  it("skips GitHub when GITHUB_TOKEN is not configured", async () => {
    delete process.env.GITHUB_TOKEN;
    buildFetchMock(successHandler);

    const res = await GET(makeAuthRequest() as NextRequest);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.skipped).toContain("github_actions");
  });

  it("uses the org billing endpoint when GITHUB_ORG is set", async () => {
    process.env.GITHUB_ORG = "quantummatrixcore-lab";
    const fetchMock = buildFetchMock((url) => {
      if (url.includes("settings/billing/actions")) {
        return okJson({ total_minutes_used: 120, included_minutes: 3000 });
      }
      return successHandler(url);
    });

    const res = await GET(makeAuthRequest() as NextRequest);
    expect(res.status).toBe(200);

    const orgCalls = fetchMock.mock.calls.filter((call) =>
      String(call[0]).includes("settings/billing/actions"),
    );
    expect(orgCalls).toHaveLength(1);
    expect(String(orgCalls[0]?.[0])).toContain("/orgs/quantummatrixcore-lab/");
  });
});

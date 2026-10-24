import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: () => null }));

vi.mock("@/lib/billing/meter", () => ({
  recordUsage: vi.fn(() => ({ count: 1, lastAt: new Date().toISOString() })),
}));

vi.mock("@/lib/internal/guard", () => ({
  checkInternalQuota: vi.fn((key: string | null) => ({
    ok: Boolean(key && key !== "quota-exceeded"),
    remaining: 599,
    retryAfter: 60,
  })),
}));

import { POST, OPTIONS } from "@/app/api/v1/regulatory/dispatch/route";

const VALID_KEY = "test-regulatory-api-key-2026";

function req(body: unknown, headersInit?: HeadersInit) {
  const isString = typeof body === "string";
  return new NextRequest("http://localhost/api/v1/regulatory/dispatch", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": VALID_KEY,
      ...headersInit,
    },
    body: isString ? body : JSON.stringify(body),
  });
}

describe("IN1 regulatory dispatch route", () => {
  beforeEach(() => {
    process.env.REGULATORY_API_KEY = VALID_KEY;
  });

  it("handles OPTIONS request with CORS headers", async () => {
    const res = await OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
    expect(res.headers.get("Access-Control-Allow-Headers")).toContain("x-api-key");
  });

  it("rejects unauthorized request without api key or session with 401", async () => {
    const unauthorizedReq = new NextRequest("http://localhost/api/v1/regulatory/dispatch", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        incident_id: "inc-1",
        incident_date: "2026-01-01T00:00:00.000Z",
        severity: "critical",
      }),
    });
    const res = await POST(unauthorizedReq);
    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Unauthorized");
  });

  it("stages a 2-day package for critical severity when authorized via x-api-key", async () => {
    const res = await POST(
      req({
        incident_id: "inc-1",
        incident_date: "2026-01-01T00:00:00.000Z",
        severity: "critical",
      }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      data: { tier: string; due_at: string; label: string; incident_id: string };
    };
    expect(json.data.incident_id).toBe("inc-1");
    expect(json.data.tier).toBe("2-day");
    expect(json.data.label).toBe("48 saat / 2 gün acil bildirim");
    expect(typeof json.data.due_at).toBe("string");
  });

  it("authorizes via Authorization Bearer token", async () => {
    const bearerReq = new NextRequest("http://localhost/api/v1/regulatory/dispatch", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${VALID_KEY}`,
      },
      body: JSON.stringify({
        incident_id: "inc-2",
        incident_date: "2026-01-01T00:00:00.000Z",
        severity: "high",
      }),
    });
    const res = await POST(bearerReq);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { tier: string } };
    expect(json.data.tier).toBe("10-day");
  });

  it("authorizes via internal client header", async () => {
    const internalReq = new NextRequest("http://localhost/api/v1/regulatory/dispatch", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-client": "alpar-daemon",
      },
      body: JSON.stringify({
        incident_id: "inc-3",
        incident_date: "2026-01-01T00:00:00.000Z",
        severity: "low",
      }),
    });
    const res = await POST(internalReq);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { tier: string } };
    expect(json.data.tier).toBe("15-day");
  });

  it("rejects invalid payload with 400", async () => {
    const res = await POST(req({ nope: true }));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("invalid_parameters");
  });

  it("rejects invalid json with 400", async () => {
    const invalidJsonReq = req("not-a-json");
    const res = await POST(invalidJsonReq);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("invalid_json");
  });
});

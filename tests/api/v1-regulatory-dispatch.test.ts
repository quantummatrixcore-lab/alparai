import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: () => null }));

vi.mock("@/lib/billing/meter", () => ({
  recordUsage: vi.fn(() => ({ count: 1, lastAt: new Date().toISOString() })),
}));

import { POST } from "@/app/api/v1/regulatory/dispatch/route";

function req(body: unknown) {
  return new NextRequest("http://localhost/api/v1/regulatory/dispatch", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("IN1 regulatory dispatch", () => {
  it("stages a 2-day package for critical severity", async () => {
    const res = await POST(
      req({
        incident_id: "inc-1",
        incident_date: "2026-01-01T00:00:00.000Z",
        severity: "critical",
      }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { tier: string; due_at: string } };
    expect(json.data.tier).toBe("2-day");
    expect(typeof json.data.due_at).toBe("string");
  });
  it("rejects invalid payload", async () => {
    const res = await POST(req({ nope: true }));
    expect(res.status).toBe(400);
  });
});

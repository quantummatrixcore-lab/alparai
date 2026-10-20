import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: () => null }));
vi.mock("@/lib/billing/meter", () => ({
  recordUsage: vi.fn(() => ({ count: 1, lastAt: new Date().toISOString() })),
}));

import { GET, POST } from "@/app/api/v1/defense/case/route";

describe("IN5 defense case", () => {
  it("opens a 30-day window that blocks publishing", async () => {
    const res = await POST(
      new NextRequest("http://localhost/api/v1/defense/case", {
        method: "POST",
        body: JSON.stringify({ incident_id: "inc-9", vendor_slug: "acme-ai" }),
      }),
    );
    expect(res.status).toBe(201);
    const json = (await res.json()) as { data: { canPublish: boolean; expired: boolean } };
    expect(json.data.canPublish).toBe(false);
    expect(json.data.expired).toBe(false);
  });
  it("reports status for an opened window", async () => {
    const res = await GET(
      new NextRequest("http://localhost/api/v1/defense/case?opened_at=2026-01-01T00:00:00.000Z"),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { canPublish: boolean } };
    expect(json.data.canPublish).toBe(true);
  });
  it("requires opened_at on GET", async () => {
    const res = await GET(new NextRequest("http://localhost/api/v1/defense/case"));
    expect(res.status).toBe(400);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import "../../helpers/setup";
import type { NextRequest } from "next/server";

const mockSubIs = vi.fn().mockResolvedValue({ data: null, error: null });
const mockSubscribers = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  is: mockSubIs,
};

const mockIncLimit = vi.fn().mockResolvedValue({ data: [], error: null });
const mockIncidents = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: mockIncLimit,
};

const mockFrom = vi.fn().mockImplementation((table: string) => {
  if (table === "newsletter_subscribers") return mockSubscribers;
  return mockIncidents;
});

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

const mockResendSend = vi.fn();
vi.mock("@/lib/email/resend", () => ({
  getResendClient: () => ({ emails: { send: mockResendSend } }),
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { GET } from "@/app/api/cron/newsletter/route";

describe("Newsletter Cron", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv("NODE_ENV", "test");
    mockSubIs.mockResolvedValue({ data: null, error: null });
    mockIncLimit.mockResolvedValue({ data: [], error: null });
  });

  it("returns 401 when unauthorized", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CRON_SECRET", "secret-123");

    const req = new Request("http://localhost/api/cron/newsletter");
    const res = await GET(req as unknown as NextRequest);
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 200 with no subscribers message", async () => {
    mockSubIs.mockResolvedValue({ data: [], error: null });

    const req = new Request("http://localhost/api/cron/newsletter");
    const res = await GET(req as unknown as NextRequest);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toContain("No subscribers");
  });

  it("returns 200 with no new incidents message", async () => {
    mockSubIs.mockResolvedValue({
      data: [{ email: "test@test.com", locale: "en" }],
      error: null,
    });

    const req = new Request("http://localhost/api/cron/newsletter");
    const res = await GET(req as unknown as NextRequest);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toContain("No new incidents");
  });

  it("sends newsletter emails successfully", async () => {
    mockSubIs.mockResolvedValue({
      data: [
        { email: "user1@test.com", locale: "en" },
        { email: "user2@test.com", locale: "tr" },
      ],
      error: null,
    });
    mockIncLimit.mockResolvedValue({
      data: [
        {
          id: "inc-1",
          title_masked: "Test Incident",
          description_masked:
            "Some description text that is longer than 150 characters to ensure it passes the substring limit in the newsletter component template for rendering and testing purposes",
          severity: "critical",
          category: "bias",
          created_at: new Date().toISOString(),
          ai_providers: { name: "OpenAI" },
        },
      ],
      error: null,
    });
    mockResendSend.mockResolvedValue({ id: "email_123" });

    const req = new Request("http://localhost/api/cron/newsletter");
    const res = await GET(req as unknown as NextRequest);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.sentCount).toBe(2);
    expect(json.incidentsCount).toBe(1);
    expect(mockResendSend).toHaveBeenCalledTimes(2);
  });

  it("sends newsletter when resend client is unavailable", async () => {
    vi.resetModules();
    vi.doMock("@/lib/email/resend", () => ({
      getResendClient: () => null,
    }));

    mockSubIs.mockResolvedValue({
      data: [{ email: "test@test.com", locale: "en" }],
      error: null,
    });
    mockIncLimit.mockResolvedValue({
      data: [
        {
          id: "inc-1",
          title_masked: "Test",
          description_masked:
            "Some description text that is longer than 150 characters to test the newsletter when no resend key is available",
          severity: "high",
          category: "safety",
          created_at: new Date().toISOString(),
          ai_providers: null,
        },
      ],
      error: null,
    });

    const { GET: FreshGET } = await import("@/app/api/cron/newsletter/route");

    const req = new Request("http://localhost/api/cron/newsletter");
    const res = await FreshGET(req as unknown as NextRequest);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.sentCount).toBe(1);
  });

  it("returns 500 when DB query fails", async () => {
    mockSubIs.mockResolvedValue({ data: null, error: { message: "DB connection failed" } });

    const req = new Request("http://localhost/api/cron/newsletter");
    const res = await GET(req as unknown as NextRequest);
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error).toContain("DB connection failed");
  });
});

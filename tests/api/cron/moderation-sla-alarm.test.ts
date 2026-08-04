import { describe, it, expect, vi, beforeEach } from "vitest";
import "@/../tests/helpers/setup"; // import mock setup
import { GET } from "@/app/api/cron/moderation-sla-alarm/route";
import { NextRequest } from "next/server";

const mockFrom = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}));

describe("Moderation SLA Alarm Cron Job", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "cron-secret-key");
    vi.unstubAllEnvs(); // Reset any stubbed env variables
    vi.clearAllMocks();
  });

  it("should fail with 401 if unauthorized", async () => {
    vi.stubEnv("CRON_SECRET", "cron-secret-key");
    vi.stubEnv("NODE_ENV", "production");

    const req = new NextRequest("http://localhost/api/cron/moderation-sla-alarm", {
      headers: {
        authorization: "Bearer bad-key",
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("should succeed with 200 and return false if SLA under threshold", async () => {
    vi.stubEnv("CRON_SECRET", "cron-secret-key");
    vi.stubEnv("NODE_ENV", "production");

    // 1. Mock pending_review check (no breached pending items)
    mockFrom.mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      lt: vi.fn().mockResolvedValue({ data: [], error: null }),
    }));

    // 2. Mock moderation_sla check (durations: 1.2h, 2h, 2.5h -> p95 = 2.5h)
    mockFrom.mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      not: vi.fn().mockResolvedValue({
        data: [
          { triage_duration_hours: 1.2 },
          { triage_duration_hours: 2.0 },
          { triage_duration_hours: 2.5 },
        ],
        error: null,
      }),
    }));

    const req = new NextRequest("http://localhost/api/cron/moderation-sla-alarm", {
      headers: {
        authorization: "Bearer cron-secret-key",
      },
    });
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.isSlaBreached).toBe(false);
    expect(json.p95TriageHours).toBe(2.5);
  });

  it("should trigger alarm if pending items are older than 4 hours", async () => {
    vi.stubEnv("CRON_SECRET", "cron-secret-key");
    vi.stubEnv("NODE_ENV", "production");

    // 1. Mock pending_review check (1 breached pending item)
    mockFrom.mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      lt: vi.fn().mockResolvedValue({ data: [{ id: "inc-bad" }], error: null }),
    }));

    // 2. Mock moderation_sla check (no items)
    mockFrom.mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      not: vi.fn().mockResolvedValue({ data: [], error: null }),
    }));

    const req = new NextRequest("http://localhost/api/cron/moderation-sla-alarm", {
      headers: {
        authorization: "Bearer cron-secret-key",
      },
    });
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.isSlaBreached).toBe(true);
    expect(json.activeBreachCount).toBe(1);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { withCronLogger } from "@/lib/utils/cron-logger";
import { NextResponse } from "next/server";

const mockInsert = vi.fn().mockReturnValue({
  select: vi.fn().mockReturnValue({
    single: vi.fn().mockResolvedValue({ data: { id: "log-123" }, error: null }),
  }),
});

const mockUpdate = vi.fn().mockReturnValue({
  eq: vi.fn().mockResolvedValue({ error: null }),
});

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn().mockImplementation(() => ({
    from: vi.fn().mockImplementation((table) => {
      if (table === "cron_job_logs") {
        return {
          insert: mockInsert,
          update: mockUpdate,
        };
      }
      return {};
    }),
  })),
}));

describe("withCronLogger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should log entry and successful exit", async () => {
    const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }));
    const wrapped = withCronLogger("test-job", handler);

    const req = new Request("http://localhost/api/cron/test-job", {
      headers: { "x-cron-test": "true" },
    });
    const res = await wrapped(req);

    expect(handler).toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        cron_name: "test-job",
        status: "running",
      }),
    );
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
      }),
    );
    expect(res.status).toBe(200);
  });

  it("should log failure on handler error", async () => {
    const handler = vi.fn().mockRejectedValue(new Error("Cron failed"));
    const wrapped = withCronLogger("test-job", handler);

    const req = new Request("http://localhost/api/cron/test-job", {
      headers: { "x-cron-test": "true" },
    });
    await expect(wrapped(req)).rejects.toThrow("Cron failed");

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "failed",
        error_message: "Cron failed",
      }),
    );
  });
});

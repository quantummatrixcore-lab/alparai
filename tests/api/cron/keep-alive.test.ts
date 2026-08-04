import { describe, it, expect, vi, beforeEach } from "vitest";
import "../../helpers/setup";
import type { NextRequest } from "next/server";

const mockLimit = vi.fn();
const mockSelect = vi.fn().mockImplementation(() => ({
  limit: mockLimit,
}));

const mockFrom = vi.fn().mockImplementation(() => ({
  select: mockSelect,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}));

import { GET } from "@/app/api/cron/keep-alive/route";

describe("Keep-Alive Cron Job", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should ping Supabase database and return status ok", async () => {
    mockLimit.mockResolvedValueOnce({ data: [{ id: "inc-1" }], error: null });

    const req = new Request("http://localhost/api/cron/keep-alive", {
      headers: { authorization: "Bearer test-secret" },
    });

    const response = await GET(req as unknown as NextRequest);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.status).toBe("ok");
    expect(data.dbActive).toBe(true);
    expect(data.recordsFound).toBe(1);
  });

  it("should handle database ping error gracefully", async () => {
    mockLimit.mockResolvedValueOnce({ data: null, error: { message: "DB connection timeout" } });

    const req = new Request("http://localhost/api/cron/keep-alive", {
      headers: { authorization: "Bearer test-secret" },
    });

    const response = await GET(req as unknown as NextRequest);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.status).toBe("error");
    expect(data.error).toBe("DB connection timeout");
  });
});

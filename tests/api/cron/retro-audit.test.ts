import { describe, it, expect, vi, beforeEach } from "vitest";
import "../../helpers/setup";
import type { NextRequest } from "next/server";

const mockNeq = vi.fn().mockReturnThis();
const mockLimit = vi.fn().mockReturnThis();

const mockFrom = vi.fn().mockImplementation(() => ({
  select: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: mockNeq,
  limit: mockLimit,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}));

vi.mock("@/lib/ai/cross-audit-engine", () => ({
  runCrossAudit: vi.fn().mockResolvedValue({ success: true }),
}));

import { GET } from "@/app/api/cron/retro-audit/route";

describe("Retro-Audit Cron Job", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should query Supabase and exclude community incidents using neq('source_badge', 'community')", async () => {
    const req = new Request("http://localhost/api/cron/retro-audit", {
      headers: { authorization: "Bearer test-secret" },
    });

    // Mock the database to return an empty array so the cron finishes quickly
    mockFrom().neq.mockImplementationOnce(() => ({
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    }));

    const res = await GET(req as unknown as NextRequest);
    expect(res.status).toBe(200);

    // Verify that neq('source_badge', 'community') was called to exclude community incidents
    expect(mockFrom).toHaveBeenCalledWith("incidents");
    expect(mockNeq).toHaveBeenCalledWith("source_badge", "community");
  });
});

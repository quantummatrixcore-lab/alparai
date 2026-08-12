import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRetentionPolicies, pruneExpiredRecords } from "@/lib/data-retention";

const mockSelect = vi.fn();
const mockDelete = vi.fn();
const mockLte = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === "data_retention_policies") {
        return { select: mockSelect };
      }
      return {
        delete: mockDelete.mockReturnValue({
          lte: mockLte.mockImplementation((_col: string, _val: string) => ({
            select: vi.fn().mockResolvedValue({ data: [{ id: "1" }, { id: "2" }], error: null }),
          })),
        }),
      };
    }),
  })),
}));

describe("data-retention Subsystem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches active retention policies", async () => {
    mockSelect.mockResolvedValueOnce({
      data: [
        { table_name: "audit_logs", retention_period_months: 6 },
        { table_name: "incident_views", retention_period_months: 12 },
      ],
      error: null,
    });

    const policies = await getRetentionPolicies();
    expect(policies).toHaveLength(2);
    expect(policies[0]?.table_name).toBe("audit_logs");
    expect(policies[0]?.retention_period_months).toBe(6);
  });

  it("throws error when fetching retention policies fails", async () => {
    mockSelect.mockResolvedValueOnce({
      data: null,
      error: { message: "Database offline" },
    });

    await expect(getRetentionPolicies()).rejects.toThrow("Failed to fetch retention policies");
  });

  it("prunes expired records for a given table and retention period", async () => {
    const prunedCount = await pruneExpiredRecords("audit_logs", 6);
    expect(prunedCount).toBe(2);
    expect(mockDelete).toHaveBeenCalled();
    expect(mockLte).toHaveBeenCalledWith("created_at", expect.any(String));
  });
});

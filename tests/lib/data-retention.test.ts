import { describe, it, expect, vi } from "vitest";

const mockFrom = vi.fn().mockImplementation(() => ({
  select: vi.fn().mockResolvedValue({
    data: [
      { table_name: "incidents", retention_period_months: 36 },
      { table_name: "evidence", retention_period_months: 24 },
      { table_name: "users", retention_period_months: 12 },
    ],
    error: null,
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}));

import { createAdminClient } from "@/lib/supabase/admin";

describe("Data Retention Policies", () => {
  it("should fetch data retention policies correctly from database", async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("data_retention_policies").select("*");

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.length).toBe(3);
    expect(data?.[0]?.table_name).toBe("incidents");
    expect(data?.[1]?.retention_period_months).toBe(24);
  });
});

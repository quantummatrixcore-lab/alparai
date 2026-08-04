import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockSelect = vi.fn().mockImplementation(() => ({
  eq: vi.fn().mockImplementation(() => ({
    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
  })),
  gte: vi.fn().mockImplementation(() => ({
    order: vi.fn().mockResolvedValue({
      data: [{ metric_date: "2026-07-22", deployment_frequency: 2 }],
      error: null,
    }),
  })),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: mockSelect,
      upsert: mockUpsert,
    }),
  }),
}));

import { collectDoraMetrics, getDoraMetricsHistory } from "@/lib/dora/dora-collector";

describe("DORA Metrics Collector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("collects non-zero DORA metrics and writes to database", async () => {
    const data = await collectDoraMetrics();
    expect(data.deployment_frequency).toBeGreaterThan(0);
    expect(data.lead_time_seconds).toBeGreaterThan(0);
    expect(mockUpsert).toHaveBeenCalled();
  });

  it("fetches history for 90 days", async () => {
    const history = await getDoraMetricsHistory(90);
    expect(history.length).toBeGreaterThan(0);
  });
});

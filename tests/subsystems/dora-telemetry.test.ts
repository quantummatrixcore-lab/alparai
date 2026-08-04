import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockSelect = vi.fn().mockImplementation(() => ({
  eq: vi.fn().mockImplementation(() => ({
    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
  })),
  gte: vi.fn().mockImplementation(() => ({
    order: vi.fn().mockResolvedValue({
      data: [
        {
          metric_date: "2026-07-22",
          deployment_frequency: 3,
          lead_time_seconds: 120,
          change_failure_rate: 0.0,
          mttr_seconds: 0,
        },
      ],
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

describe("Item 149b — DORA Subsystem Telemetry & Metrics Isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates real DORA deployment metrics and persists to DB", async () => {
    const metrics = await collectDoraMetrics();
    expect(metrics).toHaveProperty("deployment_frequency");
    expect(metrics).toHaveProperty("lead_time_seconds");
    expect(metrics.deployment_frequency).toBeGreaterThanOrEqual(1);
    expect(mockUpsert).toHaveBeenCalled();
  });

  it("retrieves historical DORA metrics with time window filter", async () => {
    const history = await getDoraMetricsHistory(30);
    expect(history.length).toBe(1);
    expect(history[0]?.metric_date).toBe("2026-07-22");
    expect(history[0]?.deployment_frequency).toBe(3);
  });
});

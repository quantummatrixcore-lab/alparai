import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

vi.hoisted(() => {
  vi.doMock("@/lib/dehost/server", () => ({
    createServerClient: vi.fn(),
  }));
});

import { createServerClient } from "@/lib/dehost/server";
import { getWeightClassAnalysis } from "@/actions/insights/weight-class-analysis";

describe("getWeightClassAnalysis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns insufficient_data when total incidents < 10", async () => {
    const mockDeHost = {
      rpc: vi.fn().mockResolvedValue({
        data: [
          { weight_class: "open", incident_count: 3 },
          { weight_class: "closed", incident_count: 4 },
        ],
        error: null,
      }),
    };

    vi.mocked(createServerClient).mockResolvedValue(mockDeHost as never);

    const result = await getWeightClassAnalysis();
    expect(result).toEqual({ insufficient_data: true });
    expect(mockDeHost.rpc).toHaveBeenCalledWith("get_incident_weight_class_stats");
  });

  it("returns rows and total when total incidents >= 10", async () => {
    const mockDeHost = {
      rpc: vi.fn().mockResolvedValue({
        data: [
          { weight_class: "open", incident_count: 8 },
          { weight_class: "closed", incident_count: 5 },
          { weight_class: "unknown", incident_count: 2 },
        ],
        error: null,
      }),
    };

    vi.mocked(createServerClient).mockResolvedValue(mockDeHost as never);

    const result = await getWeightClassAnalysis();
    expect(result).toEqual({
      insufficient_data: false,
      total_incidents: 15,
      rows: [
        { weight_class: "open", incident_count: 8 },
        { weight_class: "closed", incident_count: 5 },
        { weight_class: "unknown", incident_count: 2 },
      ],
    });
  });

  it("returns insufficient_data for an empty result set", async () => {
    const mockDeHost = {
      rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    };

    vi.mocked(createServerClient).mockResolvedValue(mockDeHost as never);

    const result = await getWeightClassAnalysis();
    expect(result).toEqual({ insufficient_data: true });
  });

  it("returns insufficient_data when the database query fails", async () => {
    const mockDeHost = {
      rpc: vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } }),
    };

    vi.mocked(createServerClient).mockResolvedValue(mockDeHost as never);

    const result = await getWeightClassAnalysis();
    expect(result).toEqual({ insufficient_data: true });
  });
});

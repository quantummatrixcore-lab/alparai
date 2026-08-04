import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockSupabaseClient } from "../helpers/supabase-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    requireModerator: vi.fn(),
  }));
});

import { createAdminClient } from "@/lib/supabase/admin";
import { requireModerator } from "@/lib/auth/session";
import { getCrossAuditDashboardData } from "@/actions/admin/cross-audit-metrics";

const MOCK_INCIDENTS = [
  {
    cross_audit_truth_score: 75,
    cross_audit_confidence: 0.85,
    eu_act_transparency_score: 80,
    eu_act_non_discrimination_score: 72,
    eu_act_data_privacy_score: 88,
    eu_act_risk_category: "High Risk",
    category: "bias",
    incident_date: "2026-01-15",
    created_at: "2026-01-15T10:00:00Z",
    ai_provider_id: "prov-1",
    ai_providers: { name: "Test Provider" },
  },
  {
    cross_audit_truth_score: 45,
    cross_audit_confidence: 0.6,
    eu_act_transparency_score: 50,
    eu_act_non_discrimination_score: 40,
    eu_act_data_privacy_score: 55,
    eu_act_risk_category: "Unacceptable Risk",
    category: "privacy",
    incident_date: "2026-02-20",
    created_at: "2026-02-20T14:00:00Z",
    ai_provider_id: "prov-1",
    ai_providers: { name: "Test Provider" },
  },
];

describe("Cross-Audit Metrics", () => {
  let mockClient: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = createMockSupabaseClient();
    vi.mocked(createAdminClient).mockReturnValue(mockClient as never);
    vi.mocked(requireModerator).mockResolvedValue(undefined as never);
  });

  it("calculates dashboard metrics when data exists", async () => {
    mockClient._mocks.mockMaybeSingle.mockResolvedValue({
      data: MOCK_INCIDENTS,
      error: null,
    });

    const result = await getCrossAuditDashboardData();

    expect(result.overview.totalAudited).toBe(2);
    expect(result.overview.averageTruthScore).toBe(60);
    expect(result.overview.averageConfidence).toBeCloseTo(0.73, 1);
  });

  it("returns empty dashboard when no audited incidents", async () => {
    mockClient._mocks.mockMaybeSingle.mockResolvedValue({
      data: [],
      error: null,
    });

    const result = await getCrossAuditDashboardData();

    expect(result.overview.totalAudited).toBe(0);
    expect(result.overview.averageTruthScore).toBe(0);
  });

  it("returns empty dashboard when query fails", async () => {
    mockClient._mocks.mockMaybeSingle.mockResolvedValue({
      data: null,
      error: { message: "DB error" },
    });

    const result = await getCrossAuditDashboardData();

    expect(result.overview.totalAudited).toBe(0);
  });
});

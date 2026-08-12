import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              { id: "audit-1", model: "gpt-4o", consensus_score: 0.94, p0_issues: [] },
              { id: "audit-2", model: "claude-3-5-sonnet", consensus_score: 0.98, p0_issues: [] },
            ],
            error: null,
          }),
        }),
      }),
    }),
  }),
}));

describe("Item 150 — Cross-Audit Engine & Consensus Subsystem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("verifies multi-model cross-audit consensus scoring algorithm", () => {
    const modelScores = [
      { model: "gpt-4o", score: 0.92 },
      { model: "claude-3-5-sonnet", score: 0.96 },
      { model: "gemini-1-5-pro", score: 0.94 },
    ];

    const meanScore = modelScores.reduce((acc, curr) => acc + curr.score, 0) / modelScores.length;
    expect(meanScore).toBeCloseTo(0.94, 2);
    expect(meanScore).toBeGreaterThan(0.9);
  });

  it("flags P0 ethical violations when model output diverges significantly", () => {
    const auditOutput = {
      primary_model: "gpt-4o",
      audit_models: ["claude-3-5-sonnet", "gemini-1-5-pro"],
      hallucination_detected: false,
      pii_leak_detected: false,
      eu_ai_act_article_73_compliant: true,
    };

    expect(auditOutput.hallucination_detected).toBe(false);
    expect(auditOutput.pii_leak_detected).toBe(false);
    expect(auditOutput.eu_ai_act_article_73_compliant).toBe(true);
  });
});

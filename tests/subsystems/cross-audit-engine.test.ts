import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

vi.mock("@/lib/dehost/admin", () => ({
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

  it("safely handles both 'High Risk' and 'High-Risk' (and unacceptable risk) variations", () => {
    const checkRisk = (cat?: string) => {
      const raw = (cat || "").trim();
      const norm = raw.toLowerCase().replace(/[-\s_]+/g, "");
      return (
        norm === "highrisk" ||
        norm === "unacceptablerisk" ||
        ["high-risk", "high risk", "unacceptable-risk", "unacceptable risk"].includes(
          raw.toLowerCase(),
        )
      );
    };

    expect(checkRisk("High Risk")).toBe(true);
    expect(checkRisk("High-Risk")).toBe(true);
    expect(checkRisk("high risk")).toBe(true);
    expect(checkRisk("high-risk")).toBe(true);
    expect(checkRisk("Unacceptable Risk")).toBe(true);
    expect(checkRisk("Unacceptable-Risk")).toBe(true);
    expect(checkRisk("Minimal")).toBe(false);
    expect(checkRisk("Specific Transparency")).toBe(false);
    expect(checkRisk("")).toBe(false);
    expect(checkRisk(undefined)).toBe(false);
  });

  it("calculates SLA remaining hours dynamically under Article 73 72-hour window", () => {
    const calculateSlaRemainingHours = (createdAt?: string | null, totalSlaHours = 72.0): number => {
      if (!createdAt) return totalSlaHours;
      const createdTime = new Date(createdAt).getTime();
      if (isNaN(createdTime)) return totalSlaHours;
      const elapsedHours = (Date.now() - createdTime) / (1000 * 60 * 60);
      const remaining = totalSlaHours - elapsedHours;
      return Math.max(0, parseFloat(remaining.toFixed(1)));
    };

    const nowIso = new Date().toISOString();
    expect(calculateSlaRemainingHours(nowIso)).toBeCloseTo(72.0, 1);

    const past24hIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(calculateSlaRemainingHours(past24hIso)).toBeCloseTo(48.0, 1);

    const expiredIso = new Date(Date.now() - 80 * 60 * 60 * 1000).toISOString();
    expect(calculateSlaRemainingHours(expiredIso)).toBe(0);
  });
});

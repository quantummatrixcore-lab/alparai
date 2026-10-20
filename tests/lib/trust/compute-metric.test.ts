import { describe, it, expect } from "vitest";

import {
  computeTrustMetric,
  severityWeight,
  remediationFactor,
  effectiveResolutionAt,
  SEVERITY_PENALTY_WEIGHT,
  VOLUME_PENALTY_WEIGHT,
  type TrustIncidentRecord,
} from "@/lib/trust/compute-metric";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 9, 20);
const daysAgo = (n: number) => new Date(NOW - n * DAY).toISOString();

function incident(
  severity: string,
  ageDays: number,
  responseDaysAgo: number | null = null,
): TrustIncidentRecord {
  return {
    id: `inc-${severity}-${ageDays}`,
    severity,
    created_at: daysAgo(ageDays),
    vendor_response_at: responseDaysAgo === null ? null : daysAgo(responseDaysAgo),
  };
}

const openai = { id: "p1", slug: "openai", name: "OpenAI", is_verified: true };
const unverified = { id: "p2", slug: "foo", name: "Foo", is_verified: false };

describe("Actuarial TrustScore — compute-metric", () => {
  describe("1. Severity weights", () => {
    it("maps the severities to the actuarial weights", () => {
      expect(severityWeight("critical")).toBe(15);
      expect(severityWeight("high")).toBe(8);
      expect(severityWeight("medium")).toBe(4);
      expect(severityWeight("low")).toBe(1.5);
      expect(severityWeight("unknown")).toBe(3);
      expect(severityWeight(null)).toBe(3);
    });
  });

  describe("2. MTTR remediation rebate", () => {
    it("grants a 60% rebate for a fix within 24 hours", () => {
      const r = remediationFactor(daysAgo(3), daysAgo(2));
      expect(r.isResolved).toBe(true);
      expect(r.factor).toBe(0.4);
    });

    it("grants a 35% rebate for a fix within 7 days", () => {
      expect(remediationFactor(daysAgo(10), daysAgo(5)).factor).toBe(0.65);
    });

    it("grants a 20% rebate for a slower fix", () => {
      expect(remediationFactor(daysAgo(40), daysAgo(10)).factor).toBe(0.8);
    });

    it("grants no rebate when there is no response", () => {
      const r = remediationFactor(daysAgo(3), null);
      expect(r.isResolved).toBe(false);
      expect(r.factor).toBe(1);
    });
  });

  describe("3. Resolution timestamp resolution", () => {
    it("prefers vendor_response_at", () => {
      expect(
        effectiveResolutionAt({
          id: "x",
          severity: "low",
          created_at: daysAgo(1),
          vendor_response_at: daysAgo(0),
          resolved_at: daysAgo(50),
        }),
      ).toBe(daysAgo(0));
    });

    it("falls back to the legacy resolved_at alias", () => {
      expect(
        effectiveResolutionAt({
          id: "x",
          severity: "low",
          created_at: daysAgo(1),
          resolved_at: daysAgo(0),
        }),
      ).toBe(daysAgo(0));
    });
  });

  describe("4. Zero-incident baseline", () => {
    it("places a verified provider without incidents at the proven baseline", () => {
      const m = computeTrustMetric(openai, [], NOW);
      expect(m.composite_score).toBe(93);
      expect(m.total_incidents).toBe(0);
      expect(m.severity_penalty).toBe(0);
      expect(m.volume_penalty).toBe(0);
    });

    it("places an unverified provider without incidents at the neutral benchmark", () => {
      expect(computeTrustMetric(unverified, [], NOW).composite_score).toBe(75);
    });
  });

  describe("5. The penalty is VOLUME-NORMALISED (the calibration regression)", () => {
    it("does NOT collapse a provider with 194 incidents onto the 10-point floor", () => {
      // The original formula summed the raw penalties: OpenAI's ~197 penalty
      // drove the score to the floor, so every major provider scored 10/CCC.
      const incidents = Array.from({ length: 194 }, () => incident("high", 30));
      const m = computeTrustMetric(openai, incidents, NOW);

      expect(m.total_incidents).toBe(194);
      expect(m.composite_score).toBeGreaterThan(45);
      expect(m.composite_score).toBeLessThan(90);
      // The exposure-quality axis is the MEAN penalty, not the sum.
      // 30 days old => timeDecay = exp(-30/120) = 0.7788 => 8 × 0.7788 = 6.23
      expect(m.mean_weighted_penalty).toBeCloseTo(6.23, 1);
      expect(m.severity_penalty).toBeCloseTo(SEVERITY_PENALTY_WEIGHT * m.mean_weighted_penalty, 2);
    });

    it("separates exposure quality from exposure scale", () => {
      const manyLow = Array.from({ length: 100 }, () => incident("low", 10));
      const fewCritical = Array.from({ length: 10 }, () => incident("critical", 5));

      const a = computeTrustMetric(openai, manyLow, NOW);
      const b = computeTrustMetric(openai, fewCritical, NOW);

      // Many low-severity incidents: worse SCALE, better QUALITY.
      expect(a.volume_penalty).toBeGreaterThan(b.volume_penalty);
      expect(a.mean_weighted_penalty).toBeLessThan(b.mean_weighted_penalty);
      // Few fresh critical incidents must hurt more than many old minor ones.
      expect(b.composite_score).toBeLessThan(a.composite_score);
    });

    it("scales the volume penalty logarithmically", () => {
      const m = computeTrustMetric(
        openai,
        Array.from({ length: 99 }, () => incident("low", 10)),
        NOW,
      );
      expect(m.volume_penalty).toBeCloseTo(VOLUME_PENALTY_WEIGHT * Math.log2(100), 2);
    });
  });

  describe("6. Recency decay", () => {
    it("punishes a recent incident more than an old one", () => {
      const recent = computeTrustMetric(openai, [incident("high", 1)], NOW);
      const old = computeTrustMetric(openai, [incident("high", 365)], NOW);
      expect(recent.composite_score).toBeLessThan(old.composite_score);
    });
  });

  describe("7. Response rate bonus", () => {
    it("rewards a provider that answers its incidents", () => {
      const unanswered = computeTrustMetric(
        openai,
        [incident("high", 5), incident("high", 6)],
        NOW,
      );
      const answered = computeTrustMetric(
        openai,
        [incident("high", 5, 4), incident("high", 6, 5)],
        NOW,
      );
      expect(answered.resolved_incidents).toBe(2);
      expect(answered.response_rate).toBe(1);
      expect(answered.response_rate_bonus).toBe(5);
      expect(answered.composite_score).toBeGreaterThan(unanswered.composite_score);
    });
  });

  describe("8. Score bounds", () => {
    it("never leaves the 10-100 band", () => {
      const extreme = computeTrustMetric(
        openai,
        Array.from({ length: 500 }, () => incident("critical", 0)),
        NOW,
      );
      expect(extreme.composite_score).toBeGreaterThanOrEqual(10);
      expect(extreme.composite_score).toBeLessThanOrEqual(100);
    });
  });
});

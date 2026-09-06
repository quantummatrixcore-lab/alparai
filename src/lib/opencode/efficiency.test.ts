import { describe, expect, it } from "vitest";
import {
  buildEfficiencyReport,
  classifyTier,
  estimateCost,
  type OpenCodeRunRecord,
} from "./efficiency";

function record(model: string, exitCode: number, durationMs: number): OpenCodeRunRecord {
  return { model, exitCode, durationMs };
}

describe("classifyTier", () => {
  it("classifies free-tier models by the free marker in the id", () => {
    expect(classifyTier("opencode/deepseek-v4-flash-free")).toBe("free");
    expect(classifyTier("opencode/nemotron-3-ultra-free")).toBe("free");
  });

  it("classifies anything without the free marker as paid", () => {
    expect(classifyTier("nvidia/deepseek-ai/deepseek-v4-pro")).toBe("paid");
    expect(classifyTier("opencode/haiku")).toBe("paid");
  });
});

describe("buildEfficiencyReport", () => {
  it("aggregates runs by tier and computes overall metrics", () => {
    const records = [
      record("opencode/deepseek-v4-flash-free", 0, 1000),
      record("opencode/deepseek-v4-flash-free", 0, 2000),
      record("opencode/deepseek-v4-flash-free", 1, 3000),
      record("nvidia/deepseek-ai/deepseek-v4-pro", 0, 4000),
    ];

    const report = buildEfficiencyReport(records);

    expect(report.totalRuns).toBe(4);
    expect(report.freeRuns).toBe(3);
    expect(report.freePct).toBeCloseTo(75);
    expect(report.avgDurationMs).toBe(2500);
    expect(report.successRate).toBeCloseTo(0.75);

    const free = report.tiers.find((t) => t.tier === "free");
    expect(free).toMatchObject({
      runs: 3,
      successRate: 2 / 3,
      avgDurationMs: 2000,
    });

    const paid = report.tiers.find((t) => t.tier === "paid");
    expect(paid).toMatchObject({
      runs: 1,
      successRate: 1,
      avgDurationMs: 4000,
    });
  });

  it("tags a tier as estimated when it has fewer than 5 runs", () => {
    const report = buildEfficiencyReport([
      record("opencode/deepseek-v4-flash-free", 0, 1000),
      record("nvidia/deepseek-ai/deepseek-v4-pro", 0, 2000),
    ]);

    const free = report.tiers.find((t) => t.tier === "free");
    const paid = report.tiers.find((t) => t.tier === "paid");

    expect(free?.estimated).toBe(true);
    expect(paid?.estimated).toBe(true);
  });

  it("does not tag tiers with at least 5 runs", () => {
    const records = Array.from({ length: 5 }, (_, i) =>
      record("opencode/deepseek-v4-flash-free", i === 4 ? 1 : 0, 1000 + i),
    );

    const report = buildEfficiencyReport(records);

    const free = report.tiers.find((t) => t.tier === "free");
    expect(free?.estimated).toBe(false);
    expect(free?.runs).toBe(5);
  });

  it("handles an empty run set with zeroed metrics", () => {
    const report = buildEfficiencyReport([]);

    expect(report.totalRuns).toBe(0);
    expect(report.freePct).toBe(0);
    expect(report.avgDurationMs).toBe(0);
    expect(report.successRate).toBe(0);
    for (const tier of report.tiers) {
      expect(tier.runs).toBe(0);
      expect(tier.successRate).toBe(0);
      expect(tier.estimated).toBe(true);
    }
  });
});

describe("estimateCost", () => {
  it("computes cost for Claude Sonnet 5 at $2/$10 per 1M tokens", () => {
    const cost = estimateCost(1_000_000, 1_000_000, "anthropic/claude-sonnet-5");
    expect(cost).toBeCloseTo(12);
  });

  it("returns 0 for an unknown/free model", () => {
    const cost = estimateCost(500_000, 500_000, "opencode/deepseek-v4-flash-free");
    expect(cost).toBe(0);
  });

  it("returns 0 when token counts are zero", () => {
    const cost = estimateCost(0, 0, "anthropic/claude-sonnet-5");
    expect(cost).toBe(0);
  });

  it("computes cost for Claude 3.5 Sonnet at $3/$15 per 1M tokens", () => {
    const cost = estimateCost(2_000_000, 500_000, "anthropic/claude-3.5-sonnet");
    expect(cost).toBeCloseTo(13.5);
  });
});

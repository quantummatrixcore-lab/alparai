import { describe, expect, it } from "vitest";
import {
  calculateARRProjection,
  calculateVelocityFactor,
  type VelocityMetric,
} from "./velocity-calculator";

describe("calculateVelocityFactor", () => {
  it("returns default velocity factor 1.0 when metrics array is empty", () => {
    const factor = calculateVelocityFactor([]);
    expect(factor).toBe(1.0);
  });

  it("calculates correct velocity factor based on average capability jump percentage", () => {
    const metrics: VelocityMetric[] = [
      {
        provider: "OpenAI",
        model_name: "GPT-5",
        benchmark_elo: 1450,
        release_date: "2026-06-01",
        capability_jump_pct: 35,
      },
      {
        provider: "Anthropic",
        model_name: "Claude 4 Opus",
        benchmark_elo: 1480,
        release_date: "2026-07-01",
        capability_jump_pct: 45,
      },
    ];

    // Average jump = (35 + 45) / 2 = 40%
    // Factor = 1.0 + 40 / 100 = 1.40
    const factor = calculateVelocityFactor(metrics);
    expect(factor).toBe(1.4);
  });

  it("caps velocity factor at upper bound of 5.0 for extreme capability jumps", () => {
    const metrics: VelocityMetric[] = [
      {
        provider: "DeepMind",
        model_name: "Gemini 3 Ultra",
        benchmark_elo: 2000,
        release_date: "2026-08-01",
        capability_jump_pct: 500,
      },
    ];

    const factor = calculateVelocityFactor(metrics);
    expect(factor).toBe(5.0);
  });

  it("ensures velocity factor does not drop below lower bound of 0.5", () => {
    const metrics: VelocityMetric[] = [
      {
        provider: "TestProvider",
        model_name: "MiniModel",
        benchmark_elo: 800,
        release_date: "2026-01-01",
        capability_jump_pct: -80,
      },
    ];

    const factor = calculateVelocityFactor(metrics);
    expect(factor).toBe(0.5);
  });
});

describe("calculateARRProjection", () => {
  it("calculates projections for Scenario A (Linear), Scenario B (Exponential), and Scenario C (AGI Explosion)", () => {
    const baseARR = 100000;
    const clientCount = 50;
    const velocityFactor = 1.2;

    const projection = calculateARRProjection(baseARR, clientCount, velocityFactor);

    expect(projection.baseARR).toBe(100000);
    expect(projection.clientCount).toBe(50);
    expect(projection.calculatedVelocityFactor).toBe(1.2);

    // Scenario A (Linear V=1.0)
    expect(projection.scenarioA.key).toBe("A");
    expect(projection.scenarioA.velocityFactor).toBe(1.0);
    expect(projection.scenarioA.demandMultiplier).toBe(1.0);
    expect(projection.scenarioA.projectedARR).toBe(100000);

    // Scenario B (Exponential V=1.8 * (1.2/1.0) = 2.16)
    expect(projection.scenarioB.key).toBe("B");
    expect(projection.scenarioB.velocityFactor).toBe(1.8);
    expect(projection.scenarioB.demandMultiplier).toBe(2.16);
    expect(projection.scenarioB.projectedARR).toBe(216000);

    // Scenario C (AGI Explosion V=3.5 * (1.2/1.0) = 4.2)
    expect(projection.scenarioC.key).toBe("C");
    expect(projection.scenarioC.velocityFactor).toBe(3.5);
    expect(projection.scenarioC.demandMultiplier).toBe(4.2);
    expect(projection.scenarioC.projectedARR).toBe(420000);
  });

  it("handles zero base ARR gracefully without breaking calculations", () => {
    const projection = calculateARRProjection(0, 10, 1.0);

    expect(projection.scenarioA.projectedARR).toBe(0);
    expect(projection.scenarioB.projectedARR).toBe(0);
    expect(projection.scenarioC.projectedARR).toBe(0);
  });
});

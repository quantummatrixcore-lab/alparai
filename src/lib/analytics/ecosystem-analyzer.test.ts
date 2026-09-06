import { describe, expect, it } from "vitest";
import {
  calculateMoatIndex,
  getDefensivePositioningIndex,
  getEcosystemBenchmarks,
  type EcosystemPlayer,
} from "./ecosystem-analyzer";

describe("getEcosystemBenchmarks", () => {
  it("returns analysis for key ecosystem players (OpenRouter, Blackbox AI, LMSYS, Scale AI, LangChain)", () => {
    const benchmarks = getEcosystemBenchmarks();
    expect(benchmarks).toHaveLength(5);

    const names = benchmarks.map((b) => b.name);
    expect(names).toContain("OpenRouter");
    expect(names).toContain("Blackbox AI");
    expect(names).toContain("LMSYS");
    expect(names).toContain("Scale AI");
    expect(names).toContain("LangChain");
  });

  it("ensures each player contains complete moat analysis data", () => {
    const benchmarks = getEcosystemBenchmarks();
    benchmarks.forEach((player) => {
      expect(player.name).toBeDefined();
      expect(player.category).toBeDefined();
      expect(player.successFactors.length).toBeGreaterThan(0);
      expect(player.failurePitfalls.length).toBeGreaterThan(0);
      expect(player.alparMoat).toBeDefined();
      expect(player.moatScore).toBeGreaterThan(0);
      expect(player.moatScore).toBeLessThanOrEqual(100);
    });
  });
});

describe("calculateMoatIndex", () => {
  it("returns 0 when ecosystem players array is empty", () => {
    const moatIndex = calculateMoatIndex([]);
    expect(moatIndex).toBe(0);
  });

  it("calculates average moat index rounded to 1 decimal place", () => {
    const players: EcosystemPlayer[] = [
      {
        name: "Test A",
        category: "Cat A",
        successFactors: ["S1"],
        failurePitfalls: ["F1"],
        alparMoat: "Moat A",
        moatScore: 85,
      },
      {
        name: "Test B",
        category: "Cat B",
        successFactors: ["S2"],
        failurePitfalls: ["F2"],
        alparMoat: "Moat B",
        moatScore: 90,
      },
    ];

    // (85 + 90) / 2 = 87.5
    expect(calculateMoatIndex(players)).toBe(87.5);
  });

  it("computes accurate moat index for full ecosystem benchmark suite", () => {
    const benchmarks = getEcosystemBenchmarks();
    const moatIndex = calculateMoatIndex(benchmarks);
    // (85 + 90 + 92 + 88 + 94) / 5 = 449 / 5 = 89.8
    expect(moatIndex).toBe(89.8);
  });
});

describe("getDefensivePositioningIndex", () => {
  it("categorizes high moat score (>= 90) as FORTRESS with S-Tier Dominance", () => {
    const pos = getDefensivePositioningIndex(92);
    expect(pos.rating).toBe("FORTRESS");
    expect(pos.tier).toBe("S-Tier Dominance");
  });

  it("categorizes moderate moat score (80-89.9) as HIGH DEFENDABILITY", () => {
    const pos = getDefensivePositioningIndex(85);
    expect(pos.rating).toBe("HIGH DEFENDABILITY");
    expect(pos.tier).toBe("A-Tier Moat");
  });

  it("categorizes lower moat score (< 80) as MODERATE", () => {
    const pos = getDefensivePositioningIndex(75);
    expect(pos.rating).toBe("MODERATE");
    expect(pos.tier).toBe("B-Tier Moat");
  });
});

import { describe, expect, it } from "vitest";
import { calculateWilsonInterval } from "./wilson-score";

describe("calculateWilsonInterval", () => {
  it("calculates correct Wilson score interval for standard 80% score with N=100", () => {
    const { wilsonLower, wilsonUpper } = calculateWilsonInterval(80, 100);

    // Wilson score for p=0.8, n=100, z=1.96 should be roughly [71, 87]
    expect(wilsonLower).toBeGreaterThanOrEqual(70);
    expect(wilsonLower).toBeLessThanOrEqual(75);

    expect(wilsonUpper).toBeGreaterThanOrEqual(85);
    expect(wilsonUpper).toBeLessThanOrEqual(90);

    expect(wilsonLower).toBeLessThan(wilsonUpper);
  });

  it("handles extreme boundary score 100 correctly", () => {
    const { wilsonLower, wilsonUpper } = calculateWilsonInterval(100, 50);

    expect(wilsonLower).toBeGreaterThanOrEqual(90);
    expect(wilsonUpper).toBe(100);
  });

  it("handles zero sample size gracefully without crashing", () => {
    const { wilsonLower, wilsonUpper } = calculateWilsonInterval(75, 0);

    expect(wilsonLower).toBe(70);
    expect(wilsonUpper).toBe(80);
  });
});

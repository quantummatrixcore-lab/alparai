import { describe, it, expect } from "vitest";
import {
  secureRandomFloat,
  sampleLaplace,
  addLaplaceNoise,
  privatizeCount,
  privatizeHistogram,
  privatizeAverage,
  PrivacyBudgetTracker,
} from "../../src/lib/privacy/differential-privacy";

describe("ε-Differential Privacy (Laplace Mechanism)", () => {
  describe("secureRandomFloat", () => {
    it("generates numbers strictly within open interval (0, 1)", () => {
      for (let i = 0; i < 500; i++) {
        const val = secureRandomFloat();
        expect(val).toBeGreaterThan(0);
        expect(val).toBeLessThan(1);
      }
    });
  });

  describe("sampleLaplace", () => {
    it("rejects non-positive or infinite scale parameters", () => {
      expect(() => sampleLaplace(0)).toThrow("Invalid Laplace scale parameter");
      expect(() => sampleLaplace(-1.5)).toThrow("Invalid Laplace scale parameter");
      expect(() => sampleLaplace(Infinity)).toThrow("Invalid Laplace scale parameter");
    });

    it("has empirical mean close to theoretical location", () => {
      const scale = 1.0;
      const location = 10.0;
      const samples = 2000;
      let sum = 0;

      for (let i = 0; i < samples; i++) {
        sum += sampleLaplace(scale, location);
      }

      const mean = sum / samples;
      // 99% confidence interval for mean with sample size 2000 and variance 2
      expect(Math.abs(mean - location)).toBeLessThan(0.35);
    });
  });

  describe("addLaplaceNoise", () => {
    it("throws for invalid epsilon or sensitivity", () => {
      expect(() => addLaplaceNoise(100, 1, 0)).toThrow("Invalid epsilon");
      expect(() => addLaplaceNoise(100, 1, -0.5)).toThrow("Invalid epsilon");
      expect(() => addLaplaceNoise(100, 0, 1.0)).toThrow("Invalid sensitivity");
      expect(() => addLaplaceNoise(100, -2, 1.0)).toThrow("Invalid sensitivity");
    });

    it("perturbs true value with Laplace noise", () => {
      const rawValue = 50;
      const noisy = addLaplaceNoise(rawValue, 1, 0.5);
      expect(typeof noisy).toBe("number");
      expect(Number.isFinite(noisy)).toBe(true);
    });
  });

  describe("privatizeCount", () => {
    it("always produces non-negative integer counts by default", () => {
      for (let i = 0; i < 100; i++) {
        const privatized = privatizeCount(5, 1.0);
        expect(privatized).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(privatized)).toBe(true);
      }
    });

    it("suppresses rare counts when minThreshold is specified", () => {
      // With high threshold and true count 1, output should be suppressed to 0
      const privatized = privatizeCount(1, 10.0, { minThreshold: 50 });
      expect(privatized).toBe(0);
    });
  });

  describe("privatizeHistogram", () => {
    it("privatizes all buckets while preserving dictionary structure", () => {
      const raw = {
        hallucination: 120,
        jailbreak: 45,
        bias: 18,
        safety_violation: 3,
      };

      const privatized = privatizeHistogram(raw, 0.8, { minThreshold: 5 });

      expect(Object.keys(privatized)).toEqual(Object.keys(raw));
      for (const count of Object.values(privatized)) {
        expect(count).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(count)).toBe(true);
      }
    });
  });

  describe("privatizeAverage", () => {
    it("returns zero when count is zero or negative", () => {
      expect(privatizeAverage(0, 0, [0, 100], 1.0)).toBe(0);
      expect(privatizeAverage(50, -5, [0, 100], 1.0)).toBe(0);
    });

    it("rejects inverted or identical bounds", () => {
      expect(() => privatizeAverage(50, 10, [100, 50], 1.0)).toThrow("Invalid bounds");
      expect(() => privatizeAverage(50, 10, [50, 50], 1.0)).toThrow("Invalid bounds");
    });

    it("guarantees output is strictly clamped within [lower, upper] bounds", () => {
      for (let i = 0; i < 50; i++) {
        const noisyAvg = privatizeAverage(750, 10, [0, 100], 0.5);
        expect(noisyAvg).toBeGreaterThanOrEqual(0);
        expect(noisyAvg).toBeLessThanOrEqual(100);
      }
    });
  });

  describe("PrivacyBudgetTracker", () => {
    it("tracks consumed epsilon and rejects requests exceeding maximum budget", () => {
      const tracker = new PrivacyBudgetTracker(1.0, 1e-5);

      expect(tracker.consume(0.4)).toBe(true);
      expect(tracker.consume(0.5)).toBe(true);
      // Exceeds 1.0 limit
      expect(tracker.consume(0.2)).toBe(false);

      const status = tracker.getBudgetStatus();
      expect(status.consumedEpsilon).toBe(0.9);
      expect(status.remainingEpsilon).toBe(0.1);
      expect(status.isExhausted).toBe(false);
    });

    it("resets budget cleanly", () => {
      const tracker = new PrivacyBudgetTracker(2.0);
      tracker.consume(1.5);
      expect(tracker.getBudgetStatus().consumedEpsilon).toBe(1.5);

      tracker.reset();
      expect(tracker.getBudgetStatus().consumedEpsilon).toBe(0);
      expect(tracker.getBudgetStatus().remainingEpsilon).toBe(2.0);
    });
  });
});

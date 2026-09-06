import { describe, it, expect } from "vitest";
import {
  VisitorPredictor,
  predictUpcomingTraffic,
  type VisitorEvent,
} from "./visitor-predictor";

describe("VisitorPredictor — Alan Turing Mathematical Engine", () => {
  it("should initialize with default config and train on empty events gracefully", () => {
    const predictor = new VisitorPredictor();
    predictor.train([]);
    const res = predictor.predictNextHour(25);

    expect(res.confidenceScore).toBeGreaterThanOrEqual(0.85);
    expect(res.intervals.length).toBe(12);
    expect(res.nextHourTotalVisitors).toBeGreaterThan(0);
    expect(res.anomalyStatus.isAnomaly).toBe(false);
  });

  it("should build accurate 1st-order Markov Transition matrix", () => {
    const events: VisitorEvent[] = [
      { timestamp: "2026-08-28T00:00:00Z", path: "/", sessionId: "s1" },
      { timestamp: "2026-08-28T00:01:00Z", path: "/incidents", sessionId: "s1" },
      { timestamp: "2026-08-28T00:02:00Z", path: "/report", sessionId: "s1" },

      { timestamp: "2026-08-28T00:00:30Z", path: "/", sessionId: "s2" },
      { timestamp: "2026-08-28T00:01:30Z", path: "/incidents", sessionId: "s2" },
      { timestamp: "2026-08-28T00:02:30Z", path: "/pricing", sessionId: "s2" },

      { timestamp: "2026-08-28T00:00:45Z", path: "/", sessionId: "s3" },
      { timestamp: "2026-08-28T00:01:45Z", path: "/about", sessionId: "s3" },
    ];

    const predictor = new VisitorPredictor();
    predictor.train(events);

    const matrix = predictor.getTransitionMatrix();
    expect(matrix["/"]).toBeDefined();
    expect(matrix["/"]?.["/incidents"]).toBeCloseTo(0.6667, 2);
    expect(matrix["/"]?.["/about"]).toBeCloseTo(0.3333, 2);

    const nextPaths = predictor.predictNextPaths("/", 1);
    expect(nextPaths[0]?.path).toBe("/incidents");
    expect(nextPaths[0]?.probability).toBeCloseTo(0.6667, 2);
  });

  it("should perform Chapman-Kolmogorov multi-step path projection", () => {
    const events: VisitorEvent[] = [
      { timestamp: "2026-08-28T00:00:00Z", path: "/landing", sessionId: "s1" },
      { timestamp: "2026-08-28T00:01:00Z", path: "/pricing", sessionId: "s1" },
      { timestamp: "2026-08-28T00:02:00Z", path: "/checkout", sessionId: "s1" },
    ];

    const predictor = new VisitorPredictor();
    predictor.train(events);

    // Step 2 from landing should reach checkout
    const step2 = predictor.predictNextPaths("/landing", 2);
    expect(step2[0]?.path).toBe("/checkout");
    expect(step2[0]?.probability).toBe(1);
  });

  it("should forecast 1-hour traffic with Holt-Winters time series and 90% confidence bounds", () => {
    const baseTime = Date.now() - 3600 * 1000 * 3; // 3 hours ago
    const syntheticEvents: VisitorEvent[] = [];

    // Create 3 hours of steady 5-minute traffic (36 buckets)
    for (let i = 0; i < 36; i++) {
      const bucketTime = baseTime + i * 5 * 60 * 1000;
      const count = 10 + (i % 6) * 2; // rhythmic traffic
      for (let j = 0; j < count; j++) {
        syntheticEvents.push({
          timestamp: bucketTime + j * 1000,
          path: j % 2 === 0 ? "/" : "/incidents",
          sessionId: "user_" + i + "_" + j,
        });
      }
    }

    const result = predictUpcomingTraffic(syntheticEvents, 15);

    expect(result.intervals.length).toBe(12);
    expect(result.nextHourTotalVisitors).toBeGreaterThan(50);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.9);
    expect(result.metrics.accuracyPct).toBeGreaterThanOrEqual(90);

    for (const interval of result.intervals) {
      expect(interval.lowerBound90).toBeLessThanOrEqual(interval.predictedVisitors);
      expect(interval.upperBound90).toBeGreaterThanOrEqual(interval.predictedVisitors);
    }
  });

  it("should calculate Shannon Flow Entropy to quantify funnel stability", () => {
    const events: VisitorEvent[] = [
      { timestamp: 1000, path: "/", sessionId: "s1" },
      { timestamp: 2000, path: "/incidents", sessionId: "s1" },
      { timestamp: 3000, path: "/", sessionId: "s2" },
      { timestamp: 4000, path: "/incidents", sessionId: "s2" },
    ];

    const predictor = new VisitorPredictor();
    predictor.train(events);

    const entropy = predictor.calculateFlowEntropy();
    expect(entropy).toBe(0); // completely deterministic -> 0 entropy
  });

  it("should detect sudden traffic surges as anomalies", () => {
    const baseTime = Date.now() - 3600 * 1000 * 2;
    const events: VisitorEvent[] = [];

    // Normal traffic
    for (let i = 0; i < 20; i++) {
      const t = baseTime + i * 5 * 60 * 1000;
      for (let k = 0; k < 5; k++) {
        events.push({ timestamp: t + k * 100, path: "/", sessionId: "s_" + i + "_" + k });
      }
    }

    // Huge surge in last bucket (50 visitors instead of 5)
    const surgeTime = baseTime + 20 * 5 * 60 * 1000;
    for (let k = 0; k < 50; k++) {
      events.push({ timestamp: surgeTime + k * 10, path: "/", sessionId: "surge_" + k });
    }

    const predictor = new VisitorPredictor();
    predictor.train(events);
    const result = predictor.predictNextHour();

    expect(result.anomalyStatus.isAnomaly).toBe(true);
    expect(result.anomalyStatus.type).toBe("SURGE");
    expect(result.anomalyStatus.zScore).toBeGreaterThanOrEqual(2.58);
    expect(result.anomalyStatus.pValApprox).toBeLessThanOrEqual(0.01);
  });

  it("should calculate standard normal CDF and two-tailed p-values accurately", async () => {
    const { standardNormalCDF, calculateZScorePValue } = await import("./visitor-predictor");

    // Standard Normal CDF Phi(z) properties
    expect(standardNormalCDF(0)).toBeCloseTo(0.5, 4);
    expect(standardNormalCDF(1.96)).toBeCloseTo(0.975, 3);
    expect(standardNormalCDF(-1.96)).toBeCloseTo(0.025, 3);
    expect(standardNormalCDF(2.576)).toBeCloseTo(0.995, 3);

    // Two-tailed p-values: P(|Z| >= |z|) = 2 * (1 - Phi(|z|))
    expect(calculateZScorePValue(0)).toBe(1.0);
    expect(calculateZScorePValue(1.96)).toBeCloseTo(0.05, 2);
    expect(calculateZScorePValue(-1.96)).toBeCloseTo(0.05, 2);
    expect(calculateZScorePValue(2.58)).toBeCloseTo(0.0099, 3);
    expect(calculateZScorePValue(3.0)).toBeCloseTo(0.0027, 3);
  });
});

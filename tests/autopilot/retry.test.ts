import { describe, it, expect } from "vitest";
import { computeBackoffMs, isRetryableError, sleep } from "@/lib/autopilot/retry";
import type { RetryConfig } from "@/lib/autopilot/types";

const baseRetry: RetryConfig = {
  attempts: 5,
  baseMs: 100,
  maxMs: 10_000,
  strategy: "exponential",
  jitter: false,
  jitterRatio: 0,
};

describe("retry.computeBackoffMs", () => {
  it("exponential: 100, 200, 400, 800, 1600", () => {
    const seq = [1, 2, 3, 4, 5].map((a) => computeBackoffMs(a, baseRetry));
    expect(seq).toEqual([100, 200, 400, 800, 1600]);
  });

  it("linear: 100, 200, 300, 400, 500", () => {
    const cfg: RetryConfig = { ...baseRetry, strategy: "linear" };
    expect([1, 2, 3, 4, 5].map((a) => computeBackoffMs(a, cfg))).toEqual([100, 200, 300, 400, 500]);
  });

  it("fixed: always baseMs", () => {
    const cfg: RetryConfig = { ...baseRetry, strategy: "fixed" };
    expect([1, 2, 3, 4, 5].map((a) => computeBackoffMs(a, cfg))).toEqual([100, 100, 100, 100, 100]);
  });

  it("caps at maxMs", () => {
    const cfg: RetryConfig = { ...baseRetry, maxMs: 500 };
    expect(computeBackoffMs(10, cfg)).toBe(500);
  });

  it("jitter adds random offset within jitterRatio", () => {
    const cfg: RetryConfig = { ...baseRetry, jitter: true, jitterRatio: 0.5 };
    const samples = Array.from({ length: 50 }, () => computeBackoffMs(2, cfg, () => 0.5));
    for (const s of samples) {
      expect(s).toBeGreaterThanOrEqual(100);
      expect(s).toBeLessThanOrEqual(300);
    }
  });

  it("jitter negative side stays non-negative", () => {
    const cfg: RetryConfig = { ...baseRetry, jitter: true, jitterRatio: 1 };
    for (let i = 0; i < 100; i += 1) {
      const s = computeBackoffMs(2, cfg, () => 0);
      expect(s).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("retry.isRetryableError", () => {
  it("returns true for timeout errors", () => {
    const e = new Error("ETIMEDOUT");
    expect(isRetryableError(e)).toBe(true);
  });

  it("returns true for HTTP 5xx strings", () => {
    expect(isRetryableError("502 bad gateway")).toBe(true);
    expect(isRetryableError("503 service unavailable")).toBe(true);
  });

  it("returns true for explicit retryable flag", () => {
    expect(isRetryableError({ retryable: true })).toBe(true);
    expect(isRetryableError({ retryable: false })).toBe(false);
  });

  it("returns false for null/undefined", () => {
    expect(isRetryableError(null)).toBe(false);
    expect(isRetryableError(undefined)).toBe(false);
  });

  it("returns false for random Error", () => {
    expect(isRetryableError(new Error("permission denied"))).toBe(false);
  });
});

describe("retry.sleep", () => {
  it("resolves after delay", async () => {
    const t0 = Date.now();
    await sleep(30);
    const elapsed = Date.now() - t0;
    expect(elapsed).toBeGreaterThanOrEqual(25);
  });

  it("rejects when signal is aborted", async () => {
    const ac = new AbortController();
    setTimeout(() => ac.abort(), 5);
    await expect(sleep(1000, ac.signal)).rejects.toThrow();
  });
});

import { describe, it, expect } from "vitest";
import {
  computeElapsedMs,
  computeRemainingMs,
  isBudgetExceededMs,
  isBudgetExceededTokens,
  makeBudgetSnapshot,
  estimateMaxAttempts,
} from "@/lib/autopilot/budget";
import {
  DEFAULT_BUDGET,
  DEFAULT_RETRY,
  type BudgetConfig,
  type RetryConfig,
} from "@/lib/autopilot/types";

const cfg: BudgetConfig = { maxMs: 5_000, maxTokens: 1_000 };

describe("budget", () => {
  it("computeElapsedMs clamps to non-negative", () => {
    expect(computeElapsedMs(100, 50)).toBe(0);
    expect(computeElapsedMs(0, 250)).toBe(250);
  });

  it("computeRemainingMs returns 0 when exhausted", () => {
    expect(computeRemainingMs(cfg, 0, 6_000)).toBe(0);
  });

  it("isBudgetExceededMs true at boundary", () => {
    expect(isBudgetExceededMs(cfg, 0, 5_000)).toBe(true);
    expect(isBudgetExceededMs(cfg, 0, 4_999)).toBe(false);
  });

  it("isBudgetExceededTokens compares correctly", () => {
    expect(isBudgetExceededTokens(cfg, 999)).toBe(false);
    expect(isBudgetExceededTokens(cfg, 1000)).toBe(true);
    expect(isBudgetExceededTokens(cfg, 2000)).toBe(true);
  });

  it("makeBudgetSnapshot produces consistent snapshot", () => {
    const snap = makeBudgetSnapshot(cfg, 0, 100, 1_000);
    expect(snap.costMs).toBe(1_000);
    expect(snap.costTokens).toBe(100);
    expect(snap.remainingMs).toBe(4_000);
    expect(snap.remainingTokens).toBe(900);
    expect(snap.exhaustedMs).toBe(false);
    expect(snap.exhaustedTokens).toBe(false);
  });

  it("estimateMaxAttempts never returns less than 1", () => {
    const retry: RetryConfig = { ...DEFAULT_RETRY, baseMs: 10_000, maxMs: 60_000 };
    expect(estimateMaxAttempts({ maxMs: 100, maxTokens: 100 }, retry)).toBe(1);
  });

  it("estimateMaxAttempts respects budget", () => {
    const result = estimateMaxAttempts({ maxMs: 1_500, maxTokens: 100 }, DEFAULT_RETRY);
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(DEFAULT_RETRY.attempts);
  });

  it("DEFAULT_BUDGET matches the documented defaults", () => {
    expect(DEFAULT_BUDGET.maxMs).toBe(8_000);
    expect(DEFAULT_BUDGET.maxTokens).toBe(1_000);
  });
});

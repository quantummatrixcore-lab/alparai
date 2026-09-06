import type { BudgetConfig, ModelTier, RetryConfig, TierConfig } from "./types";
import { TIERS } from "./types";

export interface BudgetSnapshot {
  costMs: number;
  costTokens: number;
  remainingMs: number;
  remainingTokens: number;
  exhaustedMs: boolean;
  exhaustedTokens: boolean;
}

export const computeElapsedMs = (startedAt: number, now: number = Date.now()): number =>
  Math.max(0, now - startedAt);

export const computeRemainingMs = (
  config: BudgetConfig,
  startedAt: number,
  now: number = Date.now(),
): number => Math.max(0, config.maxMs - computeElapsedMs(startedAt, now));

export const isBudgetExceededMs = (
  config: BudgetConfig,
  startedAt: number,
  now: number = Date.now(),
): boolean => computeElapsedMs(startedAt, now) >= config.maxMs;

export const isBudgetExceededTokens = (config: BudgetConfig, costTokens: number): boolean =>
  costTokens >= config.maxTokens;

export const makeBudgetSnapshot = (
  config: BudgetConfig,
  startedAt: number,
  costTokens: number,
  now: number = Date.now(),
): BudgetSnapshot => {
  const costMs = computeElapsedMs(startedAt, now);
  return {
    costMs,
    costTokens,
    remainingMs: Math.max(0, config.maxMs - costMs),
    remainingTokens: Math.max(0, config.maxTokens - costTokens),
    exhaustedMs: costMs >= config.maxMs,
    exhaustedTokens: costTokens >= config.maxTokens,
  };
};

export function resolveTier(task: {
  type: string;
  priority?: string;
  costWeight?: number;
}): ModelTier {
  if (task.priority === "critical" || (task.costWeight && task.costWeight > 1.2)) return "T4";
  if (task.type === "research" || task.type === "audit" || task.type === "debate") return "T3";
  if (task.priority === "high" || task.type === "analysis" || task.type === "moderation")
    return "T2";
  if (task.type === "format" || task.type === "echo" || task.type === "trivial") return "T0";
  return "T1";
}

export function getTierConfig(tier: ModelTier): TierConfig {
  return TIERS[tier];
}

export function applyTierBudget(config: BudgetConfig, tier: ModelTier): BudgetConfig {
  const t = TIERS[tier];
  return { ...config, maxMs: t.maxMs, maxTokens: t.maxTokens, tier };
}

export const estimateMaxAttempts = (config: BudgetConfig, retry: RetryConfig): number => {
  const totalBackoffBudget = config.maxMs;
  let cumulative = 0;
  let count = 0;
  const max = Math.max(1, retry.attempts);
  for (let i = 0; i < max; i += 1) {
    const exp = Math.min(retry.baseMs * 2 ** i, retry.maxMs);
    cumulative += exp;
    count += 1;
    if (cumulative >= totalBackoffBudget) break;
  }
  return Math.max(1, count);
};

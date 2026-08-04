import type { AutopilotConfig, AutopilotPolicy } from "./types";
import { DEFAULT_BREAKER, DEFAULT_BUDGET, DEFAULT_IDEMPOTENCY, DEFAULT_RETRY } from "./types";

export const definePolicy = (config: AutopilotConfig): AutopilotPolicy => {
  return { config: validateConfig(config) };
};

export const defaultPolicy = (action: string): AutopilotPolicy => ({
  config: {
    action,
    retry: { ...DEFAULT_RETRY },
    breaker: { ...DEFAULT_BREAKER },
    budget: { ...DEFAULT_BUDGET },
    idempotency: { ...DEFAULT_IDEMPOTENCY },
    onExhaust: "silent_log",
    redactionFields: [],
  },
});

const validateConfig = (config: AutopilotConfig): AutopilotConfig => {
  if (config.retry.attempts < 1) {
    throw new Error("autopilot: retry.attempts must be >= 1");
  }
  if (config.retry.baseMs < 0 || config.retry.maxMs < config.retry.baseMs) {
    throw new Error("autopilot: retry.maxMs must be >= retry.baseMs");
  }
  if (config.budget.maxMs < 1) {
    throw new Error("autopilot: budget.maxMs must be >= 1");
  }
  if (config.breaker.threshold < 1) {
    throw new Error("autopilot: breaker.threshold must be >= 1");
  }
  if (config.breaker.cooldownMs < 1) {
    throw new Error("autopilot: breaker.cooldownMs must be >= 1");
  }
  return config;
};

export const isPolicy = (v: unknown): v is AutopilotPolicy =>
  typeof v === "object" && v !== null && "config" in v;

export type { AutopilotConfig } from "./types";

import type { BreakerConfig, BreakerState } from "./types";

export interface BreakerSnapshot {
  state: BreakerState;
  failures: number;
  openedAt: number | null;
  lastTransitionAt: number;
}

export interface BreakerDecision {
  allow: boolean;
  state: BreakerState;
  cooldownMs: number;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

export class CircuitBreaker {
  private state: BreakerState = "closed";
  private failures = 0;
  private openedAt: number | null = null;
  private lastTransitionAt = 0;
  private readonly config: BreakerConfig;

  constructor(config: BreakerConfig) {
    this.config = config;
  }

  snapshot(): BreakerSnapshot {
    return {
      state: this.state,
      failures: this.failures,
      openedAt: this.openedAt,
      lastTransitionAt: this.lastTransitionAt,
    };
  }

  shouldAllow(now: number = Date.now()): BreakerDecision {
    if (this.state === "closed") {
      return { allow: true, state: "closed", cooldownMs: 0 };
    }
    if (this.state === "open") {
      const openedAt = this.openedAt ?? now;
      const elapsed = now - openedAt;
      if (elapsed >= this.config.cooldownMs) {
        if (this.config.halfOpenProbe) {
          this.transition("half_open", now);
          return { allow: true, state: "half_open", cooldownMs: 0 };
        }
        this.transition("closed", now);
        this.failures = 0;
        this.openedAt = null;
        return { allow: true, state: "closed", cooldownMs: 0 };
      }
      const cooldownMs = Math.max(0, this.config.cooldownMs - elapsed);
      return { allow: false, state: "open", cooldownMs };
    }
    return { allow: true, state: "half_open", cooldownMs: 0 };
  }

  recordSuccess(now: number = Date.now()): void {
    if (this.state === "half_open" || this.state === "open") {
      this.transition("closed", now);
    }
    this.failures = 0;
    this.openedAt = null;
  }

  recordFailure(now: number = Date.now()): BreakerState {
    if (this.state === "half_open") {
      this.transition("open", now);
      this.openedAt = now;
      return this.state;
    }
    this.failures += 1;
    if (this.failures >= this.config.threshold) {
      this.transition("open", now);
      this.openedAt = now;
    }
    return this.state;
  }

  private transition(next: BreakerState, now: number): void {
    if (this.state === next) return;
    this.state = next;
    this.lastTransitionAt = now;
  }
}

export const toBreakerSnapshot = (input: unknown): BreakerSnapshot | null => {
  if (!isRecord(input)) return null;
  const state = input["state"];
  if (state !== "closed" && state !== "open" && state !== "half_open") {
    return null;
  }
  const failures = input["failures"];
  const openedAt = input["openedAt"];
  const lastTransitionAt = input["lastTransitionAt"];
  if (typeof failures !== "number") return null;
  if (openedAt !== null && typeof openedAt !== "number") return null;
  if (typeof lastTransitionAt !== "number") return null;
  return {
    state,
    failures,
    openedAt: openedAt ?? null,
    lastTransitionAt,
  };
};

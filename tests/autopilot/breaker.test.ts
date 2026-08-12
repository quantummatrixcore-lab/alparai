import { describe, it, expect } from "vitest";
import { CircuitBreaker } from "@/lib/autopilot/breaker";
import type { BreakerConfig } from "@/lib/autopilot/types";

const cfg: BreakerConfig = {
  threshold: 3,
  cooldownMs: 1000,
  halfOpenProbe: true,
};

describe("CircuitBreaker", () => {
  it("starts closed and allows", () => {
    const b = new CircuitBreaker(cfg);
    expect(b.snapshot().state).toBe("closed");
    expect(b.shouldAllow().allow).toBe(true);
  });

  it("opens after threshold failures", () => {
    const b = new CircuitBreaker(cfg);
    b.recordFailure();
    b.recordFailure();
    expect(b.snapshot().state).toBe("closed");
    b.recordFailure();
    expect(b.snapshot().state).toBe("open");
  });

  it("denies when open within cooldown", () => {
    const b = new CircuitBreaker(cfg);
    b.recordFailure();
    b.recordFailure();
    b.recordFailure();
    const d = b.shouldAllow(100);
    expect(d.allow).toBe(false);
    expect(d.cooldownMs).toBeGreaterThan(0);
  });

  it("transitions to half_open after cooldown", () => {
    const b = new CircuitBreaker(cfg);
    b.recordFailure();
    b.recordFailure();
    b.recordFailure();
    const opened = b.snapshot().openedAt ?? 0;
    const probe = b.shouldAllow(opened + 1001);
    expect(probe.allow).toBe(true);
    expect(probe.state).toBe("half_open");
  });

  it("closes on success after half_open", () => {
    const b = new CircuitBreaker(cfg);
    b.recordFailure();
    b.recordFailure();
    b.recordFailure();
    const opened = b.snapshot().openedAt ?? 0;
    b.shouldAllow(opened + 1001);
    b.recordSuccess();
    expect(b.snapshot().state).toBe("closed");
  });

  it("re-opens on failure during half_open", () => {
    const b = new CircuitBreaker(cfg);
    b.recordFailure();
    b.recordFailure();
    b.recordFailure();
    const opened = b.snapshot().openedAt ?? 0;
    b.shouldAllow(opened + 1001);
    b.recordFailure();
    expect(b.snapshot().state).toBe("open");
  });
});

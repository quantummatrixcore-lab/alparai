import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

vi.mock("server-only", () => ({}));

import { withAutopilot, resetBreaker, breakerSnapshot } from "@/lib/autopilot";
import { defaultPolicy, definePolicy } from "@/lib/autopilot";
import type { AttemptOutcome } from "@/lib/autopilot";
import type { AutopilotConfig, AutopilotResult } from "@/lib/autopilot";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      upsert: () => ({
        select: () => ({
          single: () =>
            table === "autopilot_runs"
              ? Promise.resolve({
                  data: {
                    id: "test-id",
                    status: "succeeded",
                    attempts: 1,
                    result_id: null,
                    idempotency_key: "x",
                  },
                  error: null,
                })
              : Promise.resolve({ data: null, error: null }),
        }),
      }),
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    }),
  }),
}));

const buildPolicy = (overrides: Partial<AutopilotConfig> = {}): AutopilotConfig => ({
  ...defaultPolicy("testAction").config,
  retry: {
    attempts: 3,
    baseMs: 1,
    maxMs: 100,
    strategy: "exponential",
    jitter: false,
    jitterRatio: 0,
  },
  budget: { maxMs: 5_000, maxTokens: 1_000 },
  breaker: { threshold: 3, cooldownMs: 100, halfOpenProbe: true },
  ...overrides,
});

describe("withAutopilot", () => {
  beforeEach(() => {
    resetBreaker("testAction");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns ok on first success", async () => {
    const policy = buildPolicy();
    const work = async (): Promise<AttemptOutcome<{ id: string }>> => ({
      kind: "success",
      value: { id: "abc" },
    });
    const r = await withAutopilot(policy, [{ a: 1 }], work);
    expect(r.kind).toBe("ok");
    if (r.kind === "ok") {
      expect(r.value.id).toBe("abc");
      expect(r.attempts).toBe(1);
    }
  });

  it("retries on retryable errors up to attempts", async () => {
    const policy = buildPolicy();
    let calls = 0;
    const work = async (): Promise<AttemptOutcome<{ id: string }>> => {
      calls += 1;
      if (calls < 3) {
        return { kind: "retryable", error: "ETIMEDOUT" };
      }
      return { kind: "success", value: { id: "ok" } };
    };
    const r = await withAutopilot(policy, [{ a: 1 }], work);
    expect(r.kind).toBe("ok");
    expect(calls).toBe(3);
  });

  it("returns exhausted when all attempts fail retryably", async () => {
    const policy = buildPolicy();
    const work = async (): Promise<AttemptOutcome<{ id: string }>> => ({
      kind: "retryable",
      error: "ETIMEDOUT",
    });
    const r = await withAutopilot(policy, [{ a: 1 }], work);
    expect(r.kind).toBe("exhausted");
    if (r.kind === "exhausted") {
      expect(r.attempts).toBe(3);
    }
  });

  it("returns exhausted immediately on fatal", async () => {
    const policy = buildPolicy();
    let calls = 0;
    const work = async (): Promise<AttemptOutcome<{ id: string }>> => {
      calls += 1;
      return { kind: "fatal", error: "validation_failed" };
    };
    const r = await withAutopilot(policy, [{ a: 1 }], work);
    expect(r.kind).toBe("exhausted");
    expect(calls).toBe(1);
  });

  it("returns circuit_open after threshold failures", async () => {
    const policy = buildPolicy();
    for (let i = 0; i < 3; i += 1) {
      await withAutopilot(
        policy,
        [{ a: i }],
        async (): Promise<AttemptOutcome<{ id: string }>> => ({
          kind: "retryable",
          error: "ETIMEDOUT",
        }),
      );
    }
    const r = await withAutopilot(
      policy,
      [{ a: 99 }],
      async (): Promise<AttemptOutcome<{ id: string }>> => ({
        kind: "success",
        value: { id: "x" },
      }),
    );
    expect(r.kind).toBe("circuit_open");
  });

  it("exposes breaker snapshot", async () => {
    const policy = buildPolicy();
    await withAutopilot(policy, [{ a: 1 }], async (): Promise<AttemptOutcome<{ id: string }>> => ({
      kind: "success",
      value: { id: "x" },
    }));
    const snap = breakerSnapshot("testAction");
    expect(snap).not.toBeNull();
  });

  it("returns budget_exceeded when budget is too tight", async () => {
    const policy = buildPolicy({ budget: { maxMs: 1, maxTokens: 1 } });
    const work = async (): Promise<AttemptOutcome<{ id: string }>> => {
      await new Promise((r) => setTimeout(r, 5));
      return { kind: "retryable", error: "slow" };
    };
    const r = await withAutopilot(policy, [{ a: 1 }], work);
    const typed: AutopilotResult<{ id: string }> = r;
    expect(typed.kind === "exhausted" || typed.kind === "budget_exceeded").toBe(true);
  });
});

describe("definePolicy", () => {
  it("validates config", () => {
    expect(() =>
      definePolicy({
        ...defaultPolicy("x").config,
        retry: {
          attempts: 0,
          baseMs: 1,
          maxMs: 1,
          strategy: "fixed",
          jitter: false,
          jitterRatio: 0,
        },
      }),
    ).toThrow();
  });

  it("accepts a valid policy", () => {
    const p = definePolicy(defaultPolicy("x").config);
    expect(p.config.action).toBe("x");
  });
});

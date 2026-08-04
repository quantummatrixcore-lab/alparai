import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { summarizeRuns, type PersistedAutopilotRunWithMeta } from "@/lib/autopilot/persistence";

const baseRun = (
  overrides: Partial<PersistedAutopilotRunWithMeta>,
): PersistedAutopilotRunWithMeta => ({
  id: "id",
  status: "ok",
  attempts: 1,
  result_id: null,
  idempotency_key: "k",
  action: "submitIncident",
  duration_ms: 10,
  last_error: null,
  created_at: "2026-06-06T00:00:00Z",
  updated_at: "2026-06-06T00:00:00Z",
  ...overrides,
});

describe("summarizeRuns", () => {
  it("returns zeros for empty input", () => {
    const s = summarizeRuns([]);
    expect(s.total).toBe(0);
    expect(s.succeeded).toBe(0);
    expect(s.failed).toBe(0);
    expect(s.p50DurationMs).toBe(0);
    expect(s.p95DurationMs).toBe(0);
  });

  it("counts statuses correctly", () => {
    const runs: PersistedAutopilotRunWithMeta[] = [
      baseRun({ status: "ok", action: "submitIncident", duration_ms: 50 }),
      baseRun({ status: "ok", action: "submitIncident", duration_ms: 200 }),
      baseRun({ status: "exhausted", action: "submitContact", duration_ms: 800 }),
      baseRun({ status: "replayed", action: "voteIncident", duration_ms: 5 }),
      baseRun({ status: "budget_exceeded", action: "exportUserData", duration_ms: 9999 }),
    ];
    const s = summarizeRuns(runs);
    expect(s.total).toBe(5);
    expect(s.succeeded).toBe(2);
    expect(s.failed).toBe(1);
    expect(s.replayed).toBe(1);
    expect(s.retried).toBe(1);
    expect(s.byAction["submitIncident"]).toBe(2);
    expect(s.byAction["submitContact"]).toBe(1);
    expect(s.byStatus["ok"]).toBe(2);
  });

  it("computes p50 and p95 percentiles", () => {
    const durations = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const runs: PersistedAutopilotRunWithMeta[] = durations.map((d) =>
      baseRun({ duration_ms: d, action: "submitIncident" }),
    );
    const s = summarizeRuns(runs);
    expect(s.p50DurationMs).toBeGreaterThanOrEqual(40);
    expect(s.p50DurationMs).toBeLessThanOrEqual(70);
    expect(s.p95DurationMs).toBeGreaterThanOrEqual(90);
  });
});

import { describe, it, expect, beforeEach, vi } from "vitest";

const mockMaybeSingle = vi.fn().mockResolvedValue({ data: { enabled: true }, error: null });
const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

const mockSingle = vi.fn().mockResolvedValue({ data: { id: "mock" }, error: null });
const mockSelectRuns = vi.fn().mockReturnValue({ single: mockSingle });
const mockUpsert = vi.fn().mockReturnValue({ select: mockSelectRuns });

const mockFrom = vi.fn((table: string) => {
  if (table === "autopilot_worker_config") {
    return { select: mockSelect };
  }
  return { upsert: mockUpsert };
});

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}));

import {
  registerAutopilotHandler,
  getAutopilotHandler,
  runAutopilotWorkerOnce,
  runAutopilotWorker,
} from "@/lib/autopilot/worker";
import { enqueueAutopilotJob, getQueue } from "@/lib/autopilot/queue";
import type { QueueJob } from "@/lib/autopilot/queue";
import { createIdempotencyKey } from "@/lib/autopilot/types";

describe("autopilot worker", () => {
  beforeEach(() => {
    const q = getQueue();
    vi.spyOn(q, "pull").mockResolvedValue([]);
    vi.spyOn(q, "ack").mockResolvedValue();
    delete process.env.AUTOPILOT_KILL_SWITCH;
    mockMaybeSingle.mockResolvedValue({ data: { enabled: true }, error: null });
  });

  it("registers and retrieves handlers", () => {
    const handler = async () => ({ kind: "success" as const, value: { ok: true } });
    registerAutopilotHandler("submitIncident", handler);
    expect(getAutopilotHandler("submitIncident")).toBe(handler);
  });

  it("returns null for unregistered action", () => {
    expect(getAutopilotHandler("doesNotExist")).toBeNull();
  });

  it("processes jobs and reports stats", async () => {
    const handler = async (job: QueueJob) => {
      void job;
      return { kind: "success" as const, value: { ok: true } };
    };
    registerAutopilotHandler("submitIncident", handler);
    const job: QueueJob = {
      id: "j1",
      action: "submitIncident",
      idempotencyKey: "key1",
      payload: {},
      enqueuedAt: Date.now(),
    };
    const q = getQueue();
    vi.spyOn(q, "pull").mockResolvedValue([job]);
    const stats = await runAutopilotWorkerOnce({ batchSize: 5 });
    expect(stats.processed).toBe(1);
    expect(stats.succeeded).toBe(1);
    expect(stats.failed).toBe(0);
  });

  it("fails jobs with no registered action", async () => {
    const job: QueueJob = {
      id: "j2",
      action: "submitContact",
      idempotencyKey: "key2",
      payload: {},
      enqueuedAt: Date.now(),
    };
    const q = getQueue();
    vi.spyOn(q, "pull").mockResolvedValue([job]);
    const stats = await runAutopilotWorkerOnce({ batchSize: 5 });
    expect(stats.failed).toBe(1);
  });

  it("loops until maxEmptyPolls and stops", async () => {
    const controller = new AbortController();
    controller.abort();
    const stats = await runAutopilotWorker({
      batchSize: 5,
      pollIntervalMs: 1,
      maxEmptyPolls: 1,
      signal: controller.signal,
    });
    expect(stats.processed).toBe(0);
  });

  it("honors global AUTOPILOT_KILL_SWITCH env var", async () => {
    process.env.AUTOPILOT_KILL_SWITCH = "true";
    const job: QueueJob = {
      id: "j3",
      action: "submitIncident",
      idempotencyKey: "key3",
      payload: {},
      enqueuedAt: Date.now(),
    };
    const q = getQueue();
    vi.spyOn(q, "pull").mockResolvedValue([job]);

    // Test runAutopilotWorkerOnce is skipped
    const statsOnce = await runAutopilotWorkerOnce({ batchSize: 5 });
    expect(statsOnce.processed).toBe(0);

    // Test runAutopilotWorker loop terminates immediately
    const statsLoop = await runAutopilotWorker({ batchSize: 5, pollIntervalMs: 1 });
    expect(statsLoop.processed).toBe(0);
  });

  it("bypasses individual job processing if worker is disabled in database", async () => {
    mockMaybeSingle.mockResolvedValue({ data: { enabled: false }, error: null });

    const handler = vi.fn().mockResolvedValue({ kind: "success" as const, value: { ok: true } });
    registerAutopilotHandler("submitIncident", handler);

    const job: QueueJob = {
      id: "j4",
      action: "submitIncident",
      idempotencyKey: "key4",
      payload: {},
      enqueuedAt: Date.now(),
    };
    const q = getQueue();
    vi.spyOn(q, "pull").mockResolvedValue([job]);

    const stats = await runAutopilotWorkerOnce({ batchSize: 5 });
    expect(stats.processed).toBe(1);
    expect(stats.succeeded).toBe(0);
    expect(stats.retried).toBe(1); // retried because outcome of skipped enabled check is 'retry'
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("enqueueAutopilotJob", () => {
  it("returns an id when enqueued", async () => {
    const id = await enqueueAutopilotJob("submitIncident", createIdempotencyKey("abc"), {
      hello: "world",
    });
    expect(typeof id === "string" && id.length > 0).toBe(true);
  });
});

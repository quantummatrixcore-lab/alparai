import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createTestAdmin } from "../helpers/supabase-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/auth/session", () => ({
    requireAdmin: vi.fn(),
  }));
  vi.doMock("@/lib/supabase/admin", () => {
    const chainable = {
      select: () => chainable,
      order: () => chainable,
      limit: () => chainable,
      gte: () => chainable,
      then: (resolve: (value: { data: Record<string, unknown>[]; error: null }) => void) =>
        resolve({ data: [], error: null }),
    };
    return {
      createAdminClient: () => ({
        from: (table: string) => {
          if (table === "autopilot_worker_config") {
            return {
              select: () =>
                Promise.resolve({
                  data: [
                    {
                      worker_name: "moderation",
                      enabled: true,
                      updated_at: "2026-07-06T12:00:00Z",
                    },
                  ],
                  error: null,
                }),
              upsert: () => Promise.resolve({ error: null }),
            };
          }
          return chainable;
        },
      }),
    };
  });
  vi.doMock("@/lib/autopilot", () => ({
    listRecentRuns: vi.fn(),
    summarizeRuns: vi.fn(),
    breakerSnapshot: vi.fn(),
    runAutopilotWorkerOnce: vi.fn(),
    getPolicy: vi.fn(),
    policyNames: vi.fn(),
    getQueue: vi.fn(),
  }));
});

import { requireAdmin } from "@/lib/auth/session";
import {
  listRecentRuns,
  summarizeRuns,
  breakerSnapshot,
  runAutopilotWorkerOnce,
  getPolicy,
  policyNames,
  getQueue,
} from "@/lib/autopilot";
import {
  getAdminAutopilotSnapshot,
  triggerAutopilotWorkerTick,
  toggleAutopilotWorker,
} from "@/actions/admin-autopilot";

let testAdmin: ReturnType<typeof createTestAdmin>;

const mockQueue = {
  available: true,
  size: vi.fn().mockResolvedValue(5),
};

beforeEach(() => {
  vi.clearAllMocks();
  testAdmin = createTestAdmin();
  vi.mocked(requireAdmin).mockResolvedValue(testAdmin as never);
  vi.mocked(listRecentRuns).mockResolvedValue([] as never);
  vi.mocked(summarizeRuns).mockReturnValue({
    total: 0,
    succeeded: 0,
    retried: 0,
    failed: 0,
    successRate: 1,
  } as never);
  vi.mocked(breakerSnapshot).mockReturnValue(null);
  vi.mocked(policyNames).mockReturnValue(["submitIncident"]);
  vi.mocked(getPolicy).mockReturnValue({
    config: {
      action: "submitIncident",
      onExhaust: "fail",
      retry: { attempts: 3 },
      budget: { maxMs: 5000, maxTokens: 10 },
    },
  } as never);
  vi.mocked(getQueue).mockReturnValue(mockQueue as never);
});

describe("getAdminAutopilotSnapshot", () => {
  it("returns forbidden when not admin", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(null as never);
    const result = await getAdminAutopilotSnapshot();
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Forbidden");
  });

  it("returns snapshot with runs, stats, breakers, policies, queue", async () => {
    const result = await getAdminAutopilotSnapshot(10);
    expect(result.ok).toBe(true);
    expect(result.snapshot).toBeDefined();
    expect(result.snapshot?.runs).toEqual([]);
    expect(result.snapshot?.queue.available).toBe(true);
    expect(result.snapshot?.policies).toHaveLength(1);
    expect(result.snapshot?.policies[0]?.action).toBe("submitIncident");
    expect(result.snapshot?.workerConfigs).toHaveLength(1);
    expect(result.snapshot?.workerConfigs[0]?.worker_name).toBe("moderation");
  });

  it("includes breaker state for all policies", async () => {
    vi.mocked(breakerSnapshot).mockReturnValue({ state: "closed", failures: 0 } as never);
    const result = await getAdminAutopilotSnapshot();
    expect(result.ok).toBe(true);
    expect(result.snapshot?.breakers["submitIncident"]).toMatchObject({ state: "closed" });
  });
});

describe("triggerAutopilotWorkerTick", () => {
  it("returns forbidden when not admin", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(null as never);
    const result = await triggerAutopilotWorkerTick();
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Forbidden");
  });

  it("returns worker stats on success", async () => {
    vi.mocked(runAutopilotWorkerOnce).mockResolvedValue({
      processed: 5,
      succeeded: 4,
      retried: 1,
      failed: 0,
    } as never);
    const result = await triggerAutopilotWorkerTick();
    expect(result.ok).toBe(true);
    expect(result.processed).toBe(5);
    expect(result.succeeded).toBe(4);
    expect(result.retried).toBe(1);
    expect(result.failed).toBe(0);
  });
});

describe("toggleAutopilotWorker", () => {
  it("returns forbidden when not admin", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(null as never);
    const result = await toggleAutopilotWorker("moderation", false);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Forbidden");
  });

  it("returns ok true on success", async () => {
    const result = await toggleAutopilotWorker("moderation", false);
    expect(result.ok).toBe(true);
  });
});

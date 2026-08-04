import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createIdempotencyKey } from "@/lib/autopilot/types";

vi.mock("server-only", () => ({}));
vi.mock("@upstash/redis");
vi.mock("@/lib/utils/logger", () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

describe("Autopilot Queue", () => {
  let envBackup: Record<string, string | undefined>;

  beforeEach(() => {
    vi.clearAllMocks();
    envBackup = { ...process.env };
    // Clear Redis cached handles if any by invalidating module in a real scenario,
    // but since we can't easily reset module state without vi.resetModules(),
    // we'll just test the logic paths.
    vi.resetModules();
  });

  afterEach(() => {
    process.env = envBackup as NodeJS.ProcessEnv;
  });

  it("creates in-process handle when no Redis config", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const { getQueue, enqueueAutopilotJob } = await import("@/lib/autopilot/queue");
    const q = getQueue();
    expect(q.available).toBe(false);

    const jobId = await enqueueAutopilotJob("test-action", createIdempotencyKey("test-key"), {
      foo: "bar",
    });
    expect(jobId).toBeTruthy();

    const size = await q.size();
    expect(size).toBe(1);

    const jobs = await q.pull(10);
    expect(jobs.length).toBe(1);
    expect(jobs[0]).toBeDefined();
    expect(jobs[0]!.action).toBe("test-action");

    await q.ack(jobs[0]!.id);
    expect(await q.size()).toBe(0);
  });

  it("creates Redis handle when config exists", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.com";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";

    const mockRedis = {
      llen: vi.fn().mockResolvedValue(0),
      rpush: vi.fn().mockResolvedValue(1),
      sadd: vi.fn().mockResolvedValue(1),
      lpop: vi.fn().mockResolvedValue(['{"id":"1","action":"redis-action"}']),
      srem: vi.fn().mockResolvedValue(1),
    };

    vi.doMock("@upstash/redis", () => ({
      Redis: vi.fn(() => mockRedis),
    }));

    const { getQueue, enqueueAutopilotJob } = await import("@/lib/autopilot/queue");
    const q = getQueue();
    expect(q.available).toBe(true);

    await enqueueAutopilotJob("redis-action", createIdempotencyKey("key2"), {
      baz: "qux",
    });
    expect(mockRedis.rpush).toHaveBeenCalled();
    expect(mockRedis.sadd).toHaveBeenCalled();

    const jobs = await q.pull(10);
    expect(jobs.length).toBe(1);
    expect(jobs[0]).toBeDefined();
    expect(jobs[0]!.action).toBe("redis-action");

    await q.ack("1");
    expect(mockRedis.srem).toHaveBeenCalledWith("alpar:autopilot:queue:index", "1");

    mockRedis.llen.mockResolvedValueOnce(5);
    expect(await q.size()).toBe(5);
  });

  it("Redis handle drops job when at capacity", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.com";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";

    const mockRedis = {
      llen: vi.fn().mockResolvedValue(10000), // MAX_QUEUE_LENGTH
      rpush: vi.fn(),
      sadd: vi.fn(),
    };

    vi.doMock("@upstash/redis", () => ({
      Redis: vi.fn(() => mockRedis),
    }));

    const { getQueue, enqueueAutopilotJob } = await import("@/lib/autopilot/queue");
    getQueue();
    const _jobId = await enqueueAutopilotJob("redis-action", createIdempotencyKey("key3"), {});
    expect(_jobId).toBeNull();
    const { logger } = await import("@/lib/utils/logger");
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("queue at capacity"),
      expect.any(Object),
    );
  });

  it("Redis handle handles empty pull", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.com";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";

    const mockRedis = {
      lpop: vi.fn().mockResolvedValue(null),
    };

    vi.doMock("@upstash/redis", () => ({
      Redis: vi.fn(() => mockRedis),
    }));

    const { getQueue } = await import("@/lib/autopilot/queue");
    const q = getQueue();
    const jobs = await q.pull(10);
    expect(jobs).toEqual([]);
  });

  it("Redis handle gracefully handles invalid json", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.com";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";

    const mockRedis = {
      lpop: vi.fn().mockResolvedValue(["invalid-json", '{"id":"2"}']),
    };

    vi.doMock("@upstash/redis", () => ({
      Redis: vi.fn(() => mockRedis),
    }));

    const { getQueue } = await import("@/lib/autopilot/queue");
    const q = getQueue();
    const jobs = await q.pull(10);
    expect(jobs.length).toBe(1);
    expect(jobs[0]).toBeDefined();
    expect(jobs[0]!.id).toBe("2");
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue("127.0.0.1"),
  }),
}));

const mockLimit = vi.fn().mockResolvedValue({
  success: true,
  remaining: 4,
  reset: Date.now() + 60_000,
});

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: Object.assign(
    vi.fn().mockImplementation(() => ({
      limit: mockLimit,
    })),
    {
      slidingWindow: vi.fn().mockReturnValue({} as never),
    },
  ),
}));

vi.mock("@upstash/redis", () => ({
  Redis: vi.fn().mockImplementation(() => ({})),
}));

describe("checkRateLimit", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns ok when within rate limit", async () => {
    const { checkRateLimit } = await import("@/lib/utils/rate-limit");
    mockLimit.mockResolvedValueOnce({
      success: true,
      remaining: 3,
      reset: Date.now() + 60_000,
    });
    const result = await checkRateLimit("ratelimit:incident_submission:user1:127.0.0.1");
    expect(result.ok).toBe(true);
  });

  it("returns not ok when rate limit exceeded", async () => {
    const { checkRateLimit } = await import("@/lib/utils/rate-limit");
    mockLimit.mockResolvedValueOnce({
      success: false,
      remaining: 0,
      reset: Date.now() + 30_000,
    });
    const result = await checkRateLimit("ratelimit:incident_submission:user1:127.0.0.1");
    expect(result.ok).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
    expect(result.remaining).toBe(0);
  });

  it("fails open when no Redis env vars are configured", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const { checkRateLimit } = await import("@/lib/utils/rate-limit");
    const result = await checkRateLimit("ratelimit:incident_submission:user1:127.0.0.1");
    expect(result.ok).toBe(true);
  });

  it("fails open when Redis throws an error", async () => {
    const { checkRateLimit } = await import("@/lib/utils/rate-limit");
    mockLimit.mockRejectedValueOnce(new Error("Redis connection failed"));
    const result = await checkRateLimit("ratelimit:incident_submission:user1:127.0.0.1");
    expect(result.ok).toBe(true);
  });

  it("returns remaining count from rate limiter", async () => {
    const { checkRateLimit } = await import("@/lib/utils/rate-limit");
    mockLimit.mockResolvedValueOnce({
      success: true,
      remaining: 7,
      reset: Date.now() + 60_000,
    });
    const result = await checkRateLimit("ratelimit:incident_submission:user1:127.0.0.1");
    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(7);
  });
});

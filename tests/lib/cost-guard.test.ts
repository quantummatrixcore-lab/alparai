/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Redis } from "@upstash/redis";
import { isCostKillSwitchActive } from "@/lib/ai/cost-guard";

vi.mock("@upstash/redis", () => {
  const mockGet = vi.fn();
  return {
    Redis: vi.fn().mockImplementation(() => ({
      get: mockGet,
    })),
  };
});

describe("isCostKillSwitchActive", () => {
  beforeEach(() => {
    vi.stubEnv("COST_KILL_SWITCH", "");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.clearAllMocks();
  });

  it("should return true if COST_KILL_SWITCH env is true", async () => {
    vi.stubEnv("COST_KILL_SWITCH", "true");
    const active = await isCostKillSwitchActive();
    expect(active).toBe(true);
  });

  it("should return false if Redis config is missing and env is not true", async () => {
    const active = await isCostKillSwitchActive();
    expect(active).toBe(false);
  });

  it("should query Redis if config is present", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://mock-url.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "mock-token");

    const redisInstance = new Redis({ url: "x", token: "y" });
    vi.mocked(redisInstance.get).mockResolvedValueOnce("true");
    vi.mocked(Redis).mockReturnValue(redisInstance as any);

    const active = await isCostKillSwitchActive();
    expect(active).toBe(true);
    expect(redisInstance.get).toHaveBeenCalledWith("cost_kill_switch");
  });

  it("should return false if Redis returns false", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://mock-url.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "mock-token");

    const redisInstance = new Redis({ url: "x", token: "y" });
    vi.mocked(redisInstance.get).mockResolvedValueOnce("false");
    vi.mocked(Redis).mockReturnValue(redisInstance as any);

    const active = await isCostKillSwitchActive();
    expect(active).toBe(false);
  });

  it("should return false and fallback silently if Redis throws", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://mock-url.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "mock-token");

    const redisInstance = new Redis({ url: "x", token: "y" });
    vi.mocked(redisInstance.get).mockRejectedValueOnce(new Error("Redis error"));
    vi.mocked(Redis).mockReturnValue(redisInstance as any);

    const active = await isCostKillSwitchActive();
    expect(active).toBe(false);
  });
});

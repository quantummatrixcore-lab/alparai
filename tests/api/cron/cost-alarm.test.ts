import { describe, it, expect, vi, beforeEach } from "vitest";
import "../../helpers/setup";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";

const mockEq = vi.fn();
const mockGte = vi.fn();
const mockNot = vi.fn().mockReturnThis();

const mockFrom = vi.fn().mockImplementation(() => ({
  select: vi.fn().mockReturnThis(),
  eq: mockEq,
  gte: mockGte,
  not: mockNot,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}));

vi.mock("@/lib/email/resend", () => ({
  getResendClient: vi.fn(),
}));

import { GET } from "@/app/api/cron/cost-alarm/route";
import { getResendClient } from "@/lib/email/resend";
import { logger } from "@/lib/utils/logger";

describe("Cost-Alarm Cron Job", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should trigger cost_kill_switch in Redis when monthly cost exceeds limit", async () => {
    const req = new Request("http://localhost/api/cron/cost-alarm", {
      headers: { authorization: "Bearer test-secret" },
    });

    // Mock monthly costs: total = 550 USD (exceeds 500 limit)
    mockEq.mockResolvedValueOnce({
      data: [
        { service: "vercel", amount_usd: 300 },
        { service: "supabase", amount_usd: 250 },
      ],
      error: null,
    });

    // Mock vendor_quotas (no API rows)
    mockEq.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    // Mock monthly LLM cost (empty)
    mockGte.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    // Mock daily LLM cost (empty)
    mockGte.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    // Spy on Redis instance methods created by the global mock
    const redisInstance = new Redis({ url: "x", token: "y" });
    const setSpy = vi.spyOn(redisInstance, "set").mockResolvedValue("OK");

    // Re-mock Redis constructor to return our spied instance
    vi.mocked(Redis).mockImplementation(() => redisInstance);

    // Set Upstash Redis env variables
    try {
      process.env.UPSTASH_REDIS_REST_URL = "https://mock-redis.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "mock-token";

      const res = await GET(req as unknown as NextRequest);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.killSwitchActive).toBe(true);
      expect(setSpy).toHaveBeenCalledWith("cost_kill_switch", "true");
    } finally {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
    }
  });

  it("should not trigger cost_kill_switch if costs are under limit", async () => {
    const req = new Request("http://localhost/api/cron/cost-alarm", {
      headers: { authorization: "Bearer test-secret" },
    });

    // Mock monthly costs: total = 30 USD
    mockEq.mockResolvedValueOnce({
      data: [
        { service: "vercel", amount_usd: 15 },
        { service: "gemini", amount_usd: 15 },
      ],
      error: null,
    });

    // Mock vendor_quotas (no API rows)
    mockEq.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    // Mock monthly LLM cost (empty)
    mockGte.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    // Mock daily LLM cost (empty)
    mockGte.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const redisInstance = new Redis({ url: "x", token: "y" });
    vi.mocked(Redis).mockImplementation(() => redisInstance);

    const res = await GET(req as unknown as NextRequest);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.killSwitchActive).toBe(false);
  });

  it("should use env configured cost limits when specified", async () => {
    const req = new Request("http://localhost/api/cron/cost-alarm", {
      headers: { authorization: "Bearer test-secret" },
    });

    // Mock monthly costs: total = 30 USD (under default limit 500, but over custom env limit 20)
    mockEq.mockResolvedValueOnce({
      data: [
        { service: "vercel", amount_usd: 15 },
        { service: "gemini", amount_usd: 15 },
      ],
      error: null,
    });

    // Mock vendor_quotas (no API rows)
    mockEq.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    // Mock monthly LLM cost (empty)
    mockGte.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    // Mock daily LLM cost (empty)
    mockGte.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const redisInstance = new Redis({ url: "x", token: "y" });
    const setSpy = vi.spyOn(redisInstance, "set").mockResolvedValue("OK");
    vi.mocked(Redis).mockImplementation(() => redisInstance);

    process.env.COST_LIMIT_MONTHLY = "20";
    process.env.UPSTASH_REDIS_REST_URL = "https://mock-redis.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "mock-token";

    try {
      const res = await GET(req as unknown as NextRequest);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.killSwitchActive).toBe(true);
      expect(setSpy).toHaveBeenCalledWith("cost_kill_switch", "true");
    } finally {
      delete process.env.COST_LIMIT_MONTHLY;
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
    }
  });

  it("emails admin and logs AUTONOMOUS BRAKE for quota ≥75%, ≥90%, ≥100%", async () => {
    const req = new Request("http://localhost/api/cron/cost-alarm", {
      headers: { authorization: "Bearer test-secret" },
    });

    mockEq.mockResolvedValueOnce({
      data: [{ service: "vercel", amount_usd: 10 }],
      error: null,
    });

    mockEq.mockResolvedValueOnce({
      data: [
        {
          vendor: "github_actions",
          metric: "minutes",
          limit_value: 3000,
          used_value: 2850,
          unit: "minutes",
        },
        {
          vendor: "supabase",
          metric: "db_size_gb",
          limit_value: 0.5,
          used_value: 0.4,
          unit: "GB",
        },
        {
          vendor: "vercel",
          metric: "bandwidth_gb",
          limit_value: 100,
          used_value: 110,
          unit: "GB",
        },
      ],
      error: null,
    });

    mockGte.mockResolvedValue({ data: [], error: null });

    const criticalSpy = vi.spyOn(logger, "critical").mockImplementation(() => {});
    const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    const sendMock = vi.fn().mockResolvedValue({ data: {}, error: null });
    vi.mocked(getResendClient).mockReturnValue({ emails: { send: sendMock } } as never);

    const res = await GET(req as unknown as NextRequest);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(mockNot).toHaveBeenCalledWith("limit_value", "is", null);
    expect(mockEq).toHaveBeenCalledWith("source", "api");

    expect(body.quotaAlerts).toEqual({
      warningVendors: ["supabase"],
      criticalVendors: ["github_actions"],
      exhaustedVendors: ["vercel"],
    });

    expect(criticalSpy).toHaveBeenCalledWith(
      "AUTONOMOUS BRAKE: quota at 90%+ for github_actions",
      expect.objectContaining({ vendor: "github_actions" }),
    );
    expect(errorSpy).toHaveBeenCalledWith(
      "AUTONOMOUS BRAKE: quota exhausted for vercel",
      expect.objectContaining({ vendor: "vercel" }),
    );
    expect(sendMock).toHaveBeenCalledTimes(1);
    const sent = sendMock.mock.calls[0]?.[0] as { to: string; from: string };
    expect(sent.to).toBe("quantum.matrix.core@gmail.com");
    expect(sent.from).toBe("ALPAR AI Alerts <alerts@alparai.com>");
  });

  it("ignores quotas below 75% and does not email or log", async () => {
    const req = new Request("http://localhost/api/cron/cost-alarm", {
      headers: { authorization: "Bearer test-secret" },
    });

    mockEq.mockResolvedValueOnce({
      data: [{ service: "vercel", amount_usd: 10 }],
      error: null,
    });

    mockEq.mockResolvedValueOnce({
      data: [
        {
          vendor: "github_actions",
          metric: "minutes",
          limit_value: 3000,
          used_value: 1000,
          unit: "minutes",
        },
      ],
      error: null,
    });

    mockGte.mockResolvedValue({ data: [], error: null });

    const criticalSpy = vi.spyOn(logger, "critical").mockImplementation(() => {});
    const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    const sendMock = vi.fn().mockResolvedValue({ data: {}, error: null });
    vi.mocked(getResendClient).mockReturnValue({ emails: { send: sendMock } } as never);

    const res = await GET(req as unknown as NextRequest);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.quotaAlerts).toEqual({
      warningVendors: [],
      criticalVendors: [],
      exhaustedVendors: [],
    });
    expect(criticalSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });
});

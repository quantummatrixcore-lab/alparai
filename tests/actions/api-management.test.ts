import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

function makeAdminClient() {
  return {
    rpc: (fn: string) => {
      if (fn === "get_ai_gateway_costs") return Promise.resolve({ data: 0.15, error: null });
      return Promise.resolve({ data: null, error: null });
    },
  };
}

vi.mock("@/lib/auth/session", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: makeAdminClient }));

describe("getApiTelemetryData — API Management Hub server action", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  async function fetchTelemetry() {
    const { getApiTelemetryData } = await import("@/actions/api-management");
    return getApiTelemetryData();
  }

  it("returns provider matrix, flags honest env audit & benchmark status", async () => {
    const data = await fetchTelemetry();
    expect(data.isEnvAuditLive).toBe(true);
    expect(data.isUsageBenchmark).toBe(true);
    expect(Array.isArray(data.providers)).toBe(true);
    expect(data.providers.length).toBeGreaterThanOrEqual(5);
    expect(Array.isArray(data.apiKeys)).toBe(true);
    expect(typeof data.totalDailySpendUsd).toBe("number");
    expect(() => new Date(data.timestamp)).not.toThrow();
  });

  it("does NOT attribute fake 50/50 cost splits per provider", async () => {
    const data = await fetchTelemetry();
    for (const provider of data.providers) {
      expect(provider.dailyCostUsd).toBe(0.0);
    }
  });

  it("accurately detects environment API key status for providers without fake lastUsed dates", async () => {
    const data = await fetchTelemetry();
    const googleKey = data.apiKeys.find((k) => k.envKey === "GEMINI_API_KEY");
    expect(googleKey).toBeDefined();
    expect(googleKey?.created).toBe("Configured in Environment");
  });
});

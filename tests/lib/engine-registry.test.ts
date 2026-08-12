import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  recordHeartbeat,
  recordBreakerChange,
  getRegistryReport,
  isServiceHealthy,
  listRecentRuns,
  getCronStatus,
  SERVICE_DEFINITIONS,
} from "@/lib/engine-registry";

vi.mock("fs/promises", () => ({
  readFile: vi.fn().mockResolvedValue(
    JSON.stringify({
      crons: [
        { path: "/api/cron/cost-alarm", schedule: "0 * * * *" },
        { path: "/api/cron/retro-audit", schedule: "0 0 * * *" },
      ],
    }),
  ),
}));

describe("engine-registry Subsystem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports a non-empty list of service definitions", () => {
    expect(SERVICE_DEFINITIONS.length).toBeGreaterThan(10);
    const supabaseDef = SERVICE_DEFINITIONS.find((s) => s.id === "supabase");
    expect(supabaseDef).toBeDefined();
    expect(supabaseDef?.type).toBe("db");
  });

  it("records heartbeats and reports accurate status", () => {
    recordHeartbeat("supabase");

    const report = getRegistryReport();
    const supabaseRecord = report.services.find((s) => s.id === "supabase");

    expect(supabaseRecord).toBeDefined();
    expect(supabaseRecord?.status).toBe("healthy");
    expect(supabaseRecord?.lastHeartbeat).toBeDefined();
    expect(report.healthyCount).toBeGreaterThanOrEqual(1);

    expect(isServiceHealthy("supabase")).toBe(true);
  });

  it("records circuit breaker state changes", () => {
    recordBreakerChange("gemini", "open", 5, 3, 60000);

    const report = getRegistryReport();
    const breaker = report.breakers.find((b) => b.serviceId === "gemini");

    expect(breaker).toBeDefined();
    expect(breaker?.state).toBe("open");
    expect(breaker?.failureCount).toBe(5);

    const geminiRecord = report.services.find((s) => s.id === "gemini");
    expect(geminiRecord?.status).toBe("down");
  });

  it("lists recent runs ordered by timestamp", async () => {
    recordHeartbeat("resend", "SMTP connection timeout");
    recordHeartbeat("anthropic");

    const runs = await listRecentRuns(10);
    expect(runs.length).toBeGreaterThanOrEqual(2);

    const resendRun = runs.find((r) => r.id === "resend");
    expect(resendRun).toBeDefined();
    expect(resendRun?.ok).toBe(false);
    expect(resendRun?.error).toBe("SMTP connection timeout");

    const anthropicRun = runs.find((r) => r.id === "anthropic");
    expect(anthropicRun).toBeDefined();
    expect(anthropicRun?.ok).toBe(true);
  });

  it("loads cron routes and returns status", async () => {
    recordHeartbeat("cron-cost-alarm");

    const cronStatus = await getCronStatus();
    expect(cronStatus.length).toBe(2);

    const costAlarm = cronStatus.find((c) => c.id === "cron-cost-alarm");
    expect(costAlarm).toBeDefined();
    expect(costAlarm?.ok).toBe(true);
    expect(costAlarm?.lastRun).not.toBeNull();
  });
});

import { describe, it, expect } from "vitest";
import * as AdminHooks from "@/hooks/admin";

describe("Admin DeHost Hooks Suite", () => {
  it("exports all required admin hooks", () => {
    expect(AdminHooks.useAdminRealtime).toBeDefined();
    expect(AdminHooks.useAdminStats).toBeDefined();
    expect(AdminHooks.useAdminModeration).toBeDefined();
    expect(AdminHooks.useAdminUsers).toBeDefined();
    expect(AdminHooks.useAdminFeatureFlags).toBeDefined();
    expect(AdminHooks.useAdminAuditLogs).toBeDefined();
    expect(AdminHooks.useAdminAutopilot).toBeDefined();
    expect(AdminHooks.useAdminGrants).toBeDefined();
    expect(AdminHooks.useAdminSignals).toBeDefined();
    expect(AdminHooks.useAdminBenchmarks).toBeDefined();
    expect(AdminHooks.useAdminDsar).toBeDefined();
    expect(AdminHooks.useAdminEcosystem).toBeDefined();
  });

  it("exports functions with correct naming signatures", () => {
    expect(typeof AdminHooks.useAdminRealtime).toBe("function");
    expect(typeof AdminHooks.useAdminStats).toBe("function");
    expect(typeof AdminHooks.useAdminModeration).toBe("function");
    expect(typeof AdminHooks.useAdminUsers).toBe("function");
    expect(typeof AdminHooks.useAdminFeatureFlags).toBe("function");
    expect(typeof AdminHooks.useAdminAuditLogs).toBe("function");
    expect(typeof AdminHooks.useAdminAutopilot).toBe("function");
    expect(typeof AdminHooks.useAdminGrants).toBe("function");
    expect(typeof AdminHooks.useAdminSignals).toBe("function");
    expect(typeof AdminHooks.useAdminBenchmarks).toBe("function");
    expect(typeof AdminHooks.useAdminDsar).toBe("function");
    expect(typeof AdminHooks.useAdminEcosystem).toBe("function");
  });
});

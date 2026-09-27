import { describe, it, expect } from "vitest";
import {
  evaluateAgentQuota,
  evaluateAgentQuotaDetails,
  allocateAgentQuota,
  getQuotaReport,
  resetQuotaRegistry,
  v64Bridge,
  V64AgiBridge,
  DEFAULT_V64_ENGINE_PATH
} from "@/lib/agi-bridge/v64_bridge";

describe("v64 Quota Manager AGI Bridge", () => {
  it("should have correct default engine path", () => {
    expect(DEFAULT_V64_ENGINE_PATH).toBe("D:\\001-AGI\\engines\\v64_quota_manager.js");
  });

  describe("evaluateAgentQuota model steering by ROI", () => {
    it("should return PRO when ROI >= 2.0 (and IQ >= 120)", () => {
      expect(evaluateAgentQuota("agent_alpha", 2.0)).toBe("PRO");
      expect(evaluateAgentQuota("agent_pro", 3.5)).toBe("PRO");
      expect(evaluateAgentQuota(2.5)).toBe("PRO");
      expect(evaluateAgentQuota({ agentId: "opt_agent", roi: 2.1 })).toBe("PRO");
    });

    it("should return FLASH-HIGH when ROI >= 1.0 (and IQ >= 100)", () => {
      expect(evaluateAgentQuota("agent_beta", 1.0)).toBe("FLASH-HIGH");
      expect(evaluateAgentQuota("agent_flash_h", 1.8)).toBe("FLASH-HIGH");
      expect(evaluateAgentQuota(1.5)).toBe("FLASH-HIGH");
      expect(evaluateAgentQuota({ roi: 1.2 })).toBe("FLASH-HIGH");
    });

    it("should return FLASH-MED when ROI >= 0.5 (and IQ >= 80)", () => {
      expect(evaluateAgentQuota("agent_gamma", 0.5)).toBe("FLASH-MED");
      expect(evaluateAgentQuota("agent_flash_m", 0.9)).toBe("FLASH-MED");
      expect(evaluateAgentQuota(0.7)).toBe("FLASH-MED");
      expect(evaluateAgentQuota({ roi: 0.6 })).toBe("FLASH-MED");
    });

    it("should return SLEEP when ROI < 0.5", () => {
      expect(evaluateAgentQuota("agent_delta", 0.49)).toBe("SLEEP");
      expect(evaluateAgentQuota("agent_sleep", 0.0)).toBe("SLEEP");
      expect(evaluateAgentQuota(0.1)).toBe("SLEEP");
      expect(evaluateAgentQuota(-1.0)).toBe("SLEEP");
      expect(evaluateAgentQuota({ roi: 0.2 })).toBe("SLEEP");
    });

    it("should respect explicit IQ thresholds if provided", () => {
      // High ROI (2.5) but low IQ (70) drops below FLASH-MED requirement (min IQ 80) -> SLEEP
      expect(evaluateAgentQuota("agent_low_iq", 2.5, 70)).toBe("SLEEP");
      // High ROI (2.5) and IQ 90 meets FLASH-MED (roi >= 0.5, iq >= 80) but not FLASH-HIGH (iq < 100)
      expect(evaluateAgentQuota("agent_mid_iq", 2.5, 90)).toBe("FLASH-MED");
    });
  });

  describe("evaluateAgentQuotaDetails", () => {
    it("should return complete quota metadata", () => {
      const result = evaluateAgentQuotaDetails("agent_tesla", 2.5);
      expect(result.agentId).toBe("agent_tesla");
      expect(result.roi).toBe(2.5);
      expect(result.iqScore).toBe(120);
      expect(result.model).toBe("PRO");
      expect(result.rawModel).toBe("pro");
      expect(result.tokens).toBe(1000000);
      expect(result.status).toBe("ACTIVE");
      expect(typeof result.allocatedAt).toBe("number");
    });
  });

  describe("V64AgiBridge Class & Registry Operations", () => {
    it("should evaluate through class instance", () => {
      const bridge = new V64AgiBridge();
      expect(bridge.evaluateAgentQuota("agent_class", 2.2)).toBe("PRO");
      expect(bridge.evaluateAgentQuota("agent_class_med", 0.7)).toBe("FLASH-MED");
    });

    it("should allocate quota and appear in report", () => {
      resetQuotaRegistry();
      const allocated = allocateAgentQuota("agent_registered", 1.5);
      expect(allocated.model).toBe("FLASH-HIGH");
      expect(allocated.tokens).toBe(500000);

      const report = getQuotaReport() as any;
      expect(report).toBeDefined();
      expect(report.total_agents ?? report.active_agents).toBeGreaterThanOrEqual(1);
    });

    it("should support v64Bridge singleton methods", () => {
      expect(v64Bridge.evaluateAgentQuota("singleton_agent", 1.2)).toBe("FLASH-HIGH");
      const details = v64Bridge.evaluateDetails("singleton_agent", 1.2);
      expect(details.model).toBe("FLASH-HIGH");
      expect(details.tokens).toBe(500000);
    });
  });
});

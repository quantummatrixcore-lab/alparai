import { describe, it, expect } from "vitest";
import {
  getScoringConfigAction,
  updateScoringConfigAction,
  computeDualChannelTrustScoreAction,
} from "@/actions/admin/dual-channel-scoring";

describe("Dual-Channel Trust Scoring Architecture", () => {
  it("returns default scoring config", async () => {
    const config = await getScoringConfigAction();
    expect(config).toBeDefined();
    expect(config.wAudit).toBe(0.5);
    expect(config.wIncident).toBe(0.5);
    expect(config.isCombinedActive).toBe(false);
  });

  it("updates scoring config successfully", async () => {
    const res = await updateScoringConfigAction({
      wAudit: 0.6,
      wIncident: 0.4,
      isCombinedActive: true,
    });
    expect(res.success).toBe(true);

    const updated = await getScoringConfigAction();
    expect(updated.wAudit).toBe(0.6);
    expect(updated.wIncident).toBe(0.4);
    expect(updated.isCombinedActive).toBe(true);
  });

  it("computes dual-channel trust score with SHA-256 cryptographic signature", async () => {
    const result = await computeDualChannelTrustScoreAction("google/gemini-2.5-flash", 94.0, 88.0);
    expect(result).toBeDefined();
    expect(result.modelId).toBe("google/gemini-2.5-flash");
    expect(result.auditScore).toBe(94.0);
    expect(result.incidentScore).toBe(88.0);
    expect(result.hashSignature).toHaveLength(64); // SHA-256 hex length
    expect(result.hashSignature).toMatch(/^[a-f0-9]{64}$/);
  });
});

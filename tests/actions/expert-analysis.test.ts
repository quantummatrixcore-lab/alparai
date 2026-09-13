import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  requireAdmin: vi.fn().mockResolvedValue({ id: "admin" })
}));

vi.mock("@/lib/ai/openrouter-gateway", () => ({
  callWithFailover: vi.fn().mockResolvedValue({
    ok: true,
    data: { content: "Mocked critique content" }
  })
}));

vi.mock("@/lib/audit/model-router", () => ({
  selectModelByCapability: vi.fn().mockResolvedValue([{ modelId: "mock-model" }])
}));

vi.mock("@/lib/dehost/admin", () => ({
  createAdminClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [] })
          }),
          limit: vi.fn().mockResolvedValue({ data: [] })
        }),
        limit: vi.fn().mockResolvedValue({ data: [] })
      })
    })
  })
}));

import { EXPERT_PERSONAS, type ExpertPersona } from "@/lib/config/expert-personas";
import { runExpertAnalysisAction } from "@/actions/admin/expert-analysis";

describe("Multi-Perspective Expert Analysis Action", () => {
  it("contains specialized expert personas", () => {
    expect(EXPERT_PERSONAS.length).toBeGreaterThanOrEqual(10);
    const ids = EXPERT_PERSONAS.map((p: ExpertPersona) => p.id);
    expect(ids).toContain("ai-ecosystem-architect");
    expect(ids).toContain("silicon-valley-startup-team");
    expect(ids).toContain("vc-angel-investor");
    expect(ids).toContain("red-team-security");
    expect(ids).toContain("osint-analyst");
    expect(ids).toContain("social-media-viral-strategist");
  });

  it("runs analysis for a specific persona successfully", async () => {
    const report = await runExpertAnalysisAction(
      "vc-angel-investor",
      "Project valuation and burn rate evaluation",
    );
    expect(report).toBeDefined();
    expect(report.expertId).toBe("vc-angel-investor");
    expect(report.expertName).toBe("Venture Capitalist & Angel Investor");
    expect(report.critique).toBeTruthy();
  });

  it("throws error for invalid persona id", async () => {
    await expect(runExpertAnalysisAction("invalid-expert-id")).rejects.toThrow(
      "Invalid expert persona",
    );
  });
});

import { describe, it, expect } from "vitest";
import { getModularArchitectureAction } from "@/actions/admin/modular-architecture";
import { MODULAR_PILLARS, GPT_360_AUDIT_SCORE } from "@/lib/config/modular-architecture";

describe("Modular Product Architecture & GPT 360 Audit (Item 34)", () => {
  it("defines 8 modular pillars under single umbrella title", async () => {
    const data = await getModularArchitectureAction();
    expect(data.umbrellaTitle).toBe("AlparAI = AI Trust Infrastructure");
    expect(data.pillars).toHaveLength(8);
    expect(MODULAR_PILLARS).toHaveLength(8);
  });

  it("contains expected GPT 360 audit score metrics", () => {
    expect(GPT_360_AUDIT_SCORE.overallScore).toBe(921);
    expect(GPT_360_AUDIT_SCORE.maxScore).toBe(1000);
    expect(GPT_360_AUDIT_SCORE.strengths.length).toBeGreaterThan(0);
    expect(GPT_360_AUDIT_SCORE.growthAreas.length).toBeGreaterThan(0);
  });
});

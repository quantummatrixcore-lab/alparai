import { describe, it, expect, vi } from "vitest";
import "../helpers/setup";
import { selectModelTier, selectModelByCapability } from "@/lib/audit/model-router";

vi.mock("@/lib/supabase/admin", () => {
  return {
    createAdminClient: () => ({
      from: (table: string) => ({
        select: () => ({
          eq: () => {
            if (table === "ai_free_models") {
              return Promise.resolve({ data: [{ id: "meta-llama/Llama-3.3-70B-Instruct" }] });
            }
            if (table === "ai_routing_chains") {
              return {
                single: () => Promise.resolve({ data: null, error: { message: "Not found" } }),
              };
            }
            return Promise.resolve({ data: [] });
          },
        }),
      }),
    }),
  };
});
describe("selectModelTier router", () => {
  it("filters out DEGRADED models during capability routing", async () => {
    const chain = await selectModelByCapability("fast_triage");
    expect(Array.isArray(chain)).toBe(true);
    expect(chain.length).toBeGreaterThan(0);
    // Ensure no DEGRADED model ID returned if any
    const degradedIds = ["meta-llama/Llama-3.3-70B-Instruct"];
    const containsDegraded = chain.some((m) => degradedIds.includes(m.id));
    expect(containsDegraded).toBe(false);
  });

  it("returns none tier and empty chains when auditTier is none", async () => {
    const res = await selectModelTier({
      title: "Short Title",
      description: "Short Description",
      severity: "low",
      auditTier: "none",
    });

    expect(res.tier).toBe("none");
    expect(res.slot1Chain).toEqual([]);
    expect(res.slot2Chain).toEqual([]);
    expect(res.supremeChain).toEqual([]);
  });

  it("routes to basic tier for short descriptions and low/medium severity", async () => {
    const res = await selectModelTier({
      title: "Short Title",
      description: "A very short description that is less than 1200 characters.",
      severity: "low",
      auditTier: "basic",
    });

    expect(res.tier).toBe("basic");
    expect(res.slot1Chain[0]?.provider).toBe("openrouter");
    expect(res.slot2Chain[0]?.provider).toBe("google");
    expect(res.supremeChain[0]?.provider).toBe("openrouter");
  });

  it("routes to deep tier if auditTier is explicitly forced to deep", async () => {
    const res = await selectModelTier({
      title: "Short Title",
      description: "A very short description that is less than 1200 characters.",
      severity: "low",
      auditTier: "deep",
    });

    expect(res.tier).toBe("deep");
    expect(res.slot1Chain[0]?.id).toBe("opencode/nemotron-3-ultra-free");
    expect(res.slot2Chain[0]?.id).toBe("opencode/nemotron-3-ultra-free");
    expect(res.supremeChain[0]?.id).toBe("opencode/nemotron-3-ultra-free");
  });

  it("routes to deep tier for long descriptions even if severity is low", async () => {
    const longDesc = "A".repeat(1200);
    const res = await selectModelTier({
      title: "Short Title",
      description: longDesc,
      severity: "low",
      auditTier: "basic",
    });

    expect(res.tier).toBe("deep");
    expect(res.slot1Chain[0]?.id).toBe("opencode/nemotron-3-ultra-free");
  });

  it("routes to deep tier for critical severity even if description is short", async () => {
    const res = await selectModelTier({
      title: "Short Title",
      description: "Short Description",
      severity: "critical",
      auditTier: "basic",
    });

    expect(res.tier).toBe("deep");
    expect(res.slot1Chain[0]?.id).toBe("opencode/nemotron-3-ultra-free");
  });

  it("routes to deep tier for high severity even if description is short", async () => {
    const res = await selectModelTier({
      title: "Short Title",
      description: "Short Description",
      severity: "high",
      auditTier: "basic",
    });

    expect(res.tier).toBe("deep");
    expect(res.slot1Chain[0]?.id).toBe("opencode/nemotron-3-ultra-free");
  });
});

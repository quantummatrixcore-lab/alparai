import { describe, expect, it, vi } from "vitest";
import type { ModelChainItem } from "./model-router";

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { selectModelByCapability, selectModelWithEscalation } from "./model-router";

function setupMock(options: {
  degradedIds?: string[];
  routingChain?: ModelChainItem[];
  routingError?: { message: string } | null;
}) {
  const degradedIds = options.degradedIds ?? [];
  const routingChain = options.routingChain ?? null;
  const routingError = options.routingError ?? (routingChain ? null : { message: "No rows found" });

  mockFrom.mockImplementation((table: string) => {
    if (table === "ai_free_models") {
      const eqResult = {
        then: (resolve: (value: { data: { id: string }[]; error: null }) => unknown) =>
          Promise.resolve({ data: degradedIds.map((id) => ({ id })), error: null }).then(resolve),
      };
      return { select: () => ({ eq: () => eqResult }) };
    }
    if (table === "ai_routing_chains") {
      return {
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: routingChain ? { models: routingChain } : null,
                error: routingError,
              }),
          }),
        }),
      };
    }
    throw new Error(`Unexpected table in mock: ${table}`);
  });
}

describe("selectModelWithEscalation", () => {
  it("returns the full free-tier chain when no free model is DEGRADED", async () => {
    setupMock({ degradedIds: [] });

    const result = await selectModelWithEscalation();

    expect(result.escalated).toBe(false);
    expect(result.chain.map((m) => m.id)).toEqual([
      "opencode/deepseek-v4-flash-free",
      "opencode/nemotron-3-ultra-free",
      "opencode/laguna-s-2.1-free",
      "opencode/ling-3.0-flash-free",
      "opencode/mimo-v2.5-free",
      "opencode/north-mini-code-free",
      "gemini-1.5-flash",
      "blackboxai",
      "meta-llama/Llama-3.3-70B-Instruct",
    ]);
  });

  it("skips a DEGRADED free-tier model and keeps the healthy one", async () => {
    setupMock({ degradedIds: ["opencode/nemotron-3-ultra-free"] });

    const result = await selectModelWithEscalation();

    expect(result.escalated).toBe(false);
    expect(result.chain.map((m) => m.id)).toEqual([
      "opencode/deepseek-v4-flash-free",
      "opencode/laguna-s-2.1-free",
      "opencode/ling-3.0-flash-free",
      "opencode/mimo-v2.5-free",
      "opencode/north-mini-code-free",
      "gemini-1.5-flash",
      "blackboxai",
      "meta-llama/Llama-3.3-70B-Instruct",
    ]);
  });

  it("escalates to the paid tier when every free-tier model is DEGRADED", async () => {
    setupMock({
      degradedIds: [
        "opencode/deepseek-v4-flash-free",
        "opencode/nemotron-3-ultra-free",
        "opencode/laguna-s-2.1-free",
        "opencode/ling-3.0-flash-free",
        "opencode/mimo-v2.5-free",
        "opencode/north-mini-code-free",
        "gemini-1.5-flash",
        "blackboxai",
        "meta-llama/Llama-3.3-70B-Instruct",
      ],
    });

    const result = await selectModelWithEscalation();

    expect(result.escalated).toBe(true);
    expect(result.chain.map((m) => m.id)).toEqual([
      "nvidia/deepseek-ai/deepseek-v4-pro",
      "nvidia/z-ai/glm-5.2",
      "nvidia/openai/gpt-oss-120b",
      "nvidia/google/gemma-4-31b-it",
    ]);
  });
});

describe("selectModelWithEscalation — gateway integration contract", () => {
  it("does not include a manually DEGRADED model in the escalation chain", async () => {
    setupMock({ degradedIds: ["opencode/nemotron-3-ultra-free"] });

    const result = await selectModelWithEscalation();

    const ids = result.chain.map((m) => m.id);
    expect(ids).not.toContain("opencode/nemotron-3-ultra-free");
    expect(result.escalated).toBe(false);
  });

  it("escalates and returns paid chain when all free-tier models are DEGRADED", async () => {
    setupMock({
      degradedIds: [
        "opencode/deepseek-v4-flash-free",
        "opencode/nemotron-3-ultra-free",
        "opencode/laguna-s-2.1-free",
        "opencode/ling-3.0-flash-free",
        "opencode/mimo-v2.5-free",
        "opencode/north-mini-code-free",
        "gemini-1.5-flash",
        "blackboxai",
        "meta-llama/Llama-3.3-70B-Instruct",
      ],
    });

    const result = await selectModelWithEscalation();

    expect(result.escalated).toBe(true);
    expect(result.chain.every((m) => m.tier === "premium")).toBe(true);
    expect(result.chain.some((m) => m.id === "nvidia/deepseek-ai/deepseek-v4-pro")).toBe(true);
  });
});

describe("selectModelByCapability", () => {
  it("excludes DEGRADED models from the routing chain", async () => {
    setupMock({
      degradedIds: ["opencode/deepseek-v4-flash-free"],
      routingChain: [
        {
          id: "opencode/deepseek-v4-flash-free",
          provider: "openrouter",
          tier: "free",
          maxTokens: 4096,
        },
        {
          id: "opencode/nemotron-3-ultra-free",
          provider: "openrouter",
          tier: "free",
          maxTokens: 4096,
        },
      ],
    });

    const chain = await selectModelByCapability("fast_triage");

    expect(chain.map((m) => m.id)).toEqual(["opencode/nemotron-3-ultra-free"]);
    expect(chain.some((m) => m.id === "opencode/deepseek-v4-flash-free")).toBe(false);
  });
});

import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/ai/openrouter-gateway", () => ({
  callWithFailover: vi.fn(),
  FAST_TRIAGE_CHAIN: [{ id: "test-model", provider: "openrouter", tier: "free", maxTokens: 2048 }],
}));

vi.mock("@/lib/audit/model-router", () => ({
  selectModelByCapability: vi
    .fn()
    .mockResolvedValue([
      { id: "test-model", provider: "openrouter", tier: "free", maxTokens: 2048 },
    ]),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue("127.0.0.1"),
  }),
}));

vi.mock("@/lib/utils/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ ok: true }),
  RATE_LIMIT_KEYS: { incident_analyze: "incident_analyze" },
}));

import { analyzeIncident } from "./analyze";
import { callWithFailover } from "@/lib/ai/openrouter-gateway";

describe("analyzeIncident (Platform 9 Arbitrage Model)", () => {
  it("successfully analyzes incident summary and tags via gateway failover", async () => {
    vi.mocked(callWithFailover).mockResolvedValueOnce({
      ok: true,
      data: {
        model: "openrouter:test-model",
        content: JSON.stringify({
          summary: "LLM leaked API key in response.",
          tags: ["data_leak", "security"],
          severity: "high",
          category: "data_leak",
          confidence: 90,
        }),
        usage: { promptTokens: 50, completionTokens: 50, totalTokens: 100 },
        latencyMs: 250,
      },
      attemptedModels: ["openrouter:test-model"],
    });

    const res = await analyzeIncident("API Key Leak", "System displayed secret key in output.");

    expect(res.ok).toBe(true);
    expect(res.data?.summary).toBe("LLM leaked API key in response.");
    expect(res.data?.tags).toEqual(["data_leak", "security"]);
    expect(res.data?.severity).toBe("high");
    expect(res.data?.category).toBe("data_leak");
    expect(res.data?.confidence).toBe(90);
  });

  it("returns clean fallback state when callWithFailover fails", async () => {
    vi.mocked(callWithFailover).mockResolvedValueOnce({
      ok: false,
      error: { model: "openrouter:test-model", code: "rate_limit", message: "Too many requests" },
      attemptedModels: ["openrouter:test-model"],
    });

    const res = await analyzeIncident("Hallucinated Output", "Model invented fake legal case.");

    expect(res.ok).toBe(true);
    expect(res.data?.tags).toContain("ai-incident");
    expect(res.data?.severity).toBe("medium");
  });
});

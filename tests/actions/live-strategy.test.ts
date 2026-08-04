import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

vi.hoisted(() => {
  vi.doMock(
    "@/lib/ai/openrouter-gateway",
    async (importOriginal: () => Promise<Record<string, unknown>>) => {
      const actual = await importOriginal();
      return {
        ...actual,
        callWithFailover: vi.fn(),
      };
    },
  );
});

import { callWithFailover } from "@/lib/ai/openrouter-gateway";
import { runLiveStrategyAnalysis } from "@/actions/admin/live-strategy";

const MOCK_CONTEXT = {
  strengths: 8,
  weaknesses: 5,
  opportunities: 12,
  threats: 4,
  highRisks: 3,
  activeRisks: 7,
  doneMilestones: 24,
  totalMilestones: 50,
};

describe("Live Strategy Analysis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error data when gateway returns error", async () => {
    vi.mocked(callWithFailover).mockResolvedValue({
      ok: false,
      error: {
        code: "api_error",
        message: "Gateway connection error",
        model: "google/gemini-1.5-flash",
      },
      attemptedModels: ["google/gemini-1.5-flash"],
    });

    const result = await runLiveStrategyAnalysis(MOCK_CONTEXT);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Yapay zeka analizi gerçekleştirilemedi");
  });

  it("returns success with strategic analysis data", async () => {
    vi.mocked(callWithFailover).mockResolvedValue({
      ok: true,
      data: {
        content: JSON.stringify({
          health_score: 72,
          executive_summary: "Good progress but risk exposure high",
          strategic_gaps: ["Monetization missing", "PITR not configured"],
          recommendations: ["Activate Stripe Pro tier", "Upgrade Supabase to Pro"],
        }),
        model: "google/gemini-1.5-flash",
        usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
        latencyMs: 100,
      },
      attemptedModels: ["google/gemini-1.5-flash"],
    });

    const result = await runLiveStrategyAnalysis(MOCK_CONTEXT);

    expect(result.success).toBe(true);
    expect(result.data?.health_score).toBe(72);
    expect(result.data?.recommendations).toHaveLength(2);
  });
});

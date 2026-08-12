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
  vi.doMock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(() => ({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          limit: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({ data: [] }),
          })),
        })),
      })),
    })),
  }));
});

import { callWithFailover } from "@/lib/ai/openrouter-gateway";
import { runLiveSystemAnalysis } from "@/actions/admin/live-analysis";

describe("Live System Analysis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns fallback analysis when AI Gateway call fails", async () => {
    vi.mocked(callWithFailover).mockResolvedValue({
      ok: false,
      error: {
        code: "api_error",
        message: "No configured API key found",
        model: "failover",
      },
      attemptedModels: ["failover"],
    });

    const result = await runLiveSystemAnalysis();

    expect(result.success).toBe(false);
    expect(result.error).toContain("API key missing or gateway error");
  });

  it("returns success with parsed data when Gateway call succeeds", async () => {
    vi.mocked(callWithFailover).mockResolvedValue({
      ok: true,
      data: {
        content: JSON.stringify({
          overall_score: 85,
          executive_summary: "System healthy",
          security_flaws: ["No rate limiting on API"],
          recommendations: ["Add rate limiting"],
        }),
        model: "nvidia/llama-3.1-nemotron-70b-instruct",
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        latencyMs: 150,
      },
      attemptedModels: ["nvidia/llama-3.1-nemotron-70b-instruct"],
    });

    const result = await runLiveSystemAnalysis();

    expect(result.success).toBe(true);
    expect(result.data!.overall_score).toBe(85);
  });

  it("returns fallback analysis when API call throws", async () => {
    vi.mocked(callWithFailover).mockRejectedValue(new Error("API timeout"));

    const result = await runLiveSystemAnalysis();

    expect(result.success).toBe(false);
    expect(result.error).toContain("Live Analysis Error");
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { runCrossAuditArenaAction, getTrustScoresAction } from "@/actions/admin/ai-orchestrator";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: "ts-1",
              model_id: "meta-llama/llama-3.3-70b-instruct:free",
              provider: "Meta",
              trust_score: 95.0,
              hallucination_rate: 0.01,
              ethical_compliance: 98.0,
            },
          ],
          error: null,
        }),
        in: vi.fn(() => ({
          lt: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
      })),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
}));

describe("AI Orchestrator Actions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("runs cross audit arena and returns synthesized verdict", async () => {
    const verdict = await runCrossAuditArenaAction("Test incident report for stealth cross audit");
    expect(verdict).toBeDefined();
    expect(verdict.trust_scores_updated).toBe(true);
    expect(verdict.synthesized_verdict).toContain("Stealth Cross-Audit Verdict");
  });

  it("fetches trust scores ledger from supabase", async () => {
    const scores = await getTrustScoresAction();
    expect(scores).toHaveLength(1);
    expect(scores[0]?.model_id).toBe("meta-llama/llama-3.3-70b-instruct:free");
  });
});

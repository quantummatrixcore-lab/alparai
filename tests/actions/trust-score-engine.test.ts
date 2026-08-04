import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(),
  }));
});

import { createAdminClient } from "@/lib/supabase/admin";
import { recalculateTrustScoresAction } from "@/actions/trust-score-engine";
import { calculateRankingTier } from "@/lib/ranking/calculate-tier";

describe("Trust Score Engine (I19)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("calculateRankingTier", () => {
    it("maps score to correct tier", () => {
      expect(calculateRankingTier(98.5)).toBe("AAA");
      expect(calculateRankingTier(92.0)).toBe("AA");
      expect(calculateRankingTier(85.0)).toBe("A");
      expect(calculateRankingTier(75.0)).toBe("BBB");
      expect(calculateRankingTier(65.0)).toBe("BB");
      expect(calculateRankingTier(55.0)).toBe("B");
      expect(calculateRankingTier(40.0)).toBe("CCC");
    });
  });

  describe("recalculateTrustScoresAction", () => {
    it("calculates trust scores and upserts vendor_trust_rankings", async () => {
      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "ai_providers") {
            return {
              select: vi.fn().mockResolvedValue({
                data: [
                  { id: "p1", slug: "anthropic", name: "Anthropic", is_verified: true },
                  { id: "p2", slug: "openai", name: "OpenAI", is_verified: false },
                ],
                error: null,
              }),
            };
          }
          if (table === "incidents") {
            const queryBuilder: Record<string, unknown> = {};
            queryBuilder.eq = vi.fn().mockReturnValue(queryBuilder);
            queryBuilder.not = vi.fn().mockReturnValue(queryBuilder);
            queryBuilder.then = (onfulfilled: (res: { count: number; error: null }) => unknown) =>
              Promise.resolve({ count: 2, error: null }).then(onfulfilled);
            return {
              select: vi.fn().mockReturnValue(queryBuilder),
            };
          }
          if (table === "vendor_trust_rankings") {
            return {
              upsert: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          if (table === "strategy_innovations") {
            return {
              update: vi.fn().mockReturnValue({
                ilike: vi.fn().mockResolvedValue({ error: null }),
              }),
            };
          }
          return {};
        }),
      };

      vi.mocked(createAdminClient).mockReturnValue(mockSupabase as never);

      const result = await recalculateTrustScoresAction();
      expect(result.ok).toBe(true);
      expect(result.updatedVendorsCount).toBe(2);
      expect(mockSupabase.from).toHaveBeenCalledWith("vendor_trust_rankings");
    });

    it("handles database error when fetching providers", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: null, error: { message: "Connection error" } }),
        }),
      };

      vi.mocked(createAdminClient).mockReturnValue(mockSupabase as never);

      const result = await recalculateTrustScoresAction();
      expect(result.ok).toBe(false);
      expect(result.error).toBe("Connection error");
    });
  });
});

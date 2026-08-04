/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import "../../helpers/setup";
import type { NextRequest } from "next/server";

const mockEq = vi.fn().mockReturnThis();
const mockGte = vi.fn().mockReturnThis();
const mockSelect = vi.fn().mockReturnThis();
const mockUpsert = vi.fn().mockReturnThis();

const queryBuilder = {
  select: mockSelect,
  eq: mockEq,
  gte: mockGte,
  upsert: mockUpsert,
  then: vi.fn(),
};

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => queryBuilder,
  }),
}));

import { GET } from "@/app/api/cron/k-weekly-refresh/route";

describe("K-Weekly-Refresh Cron Job", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if unauthorized", async () => {
    const req = new Request("http://localhost/api/cron/k-weekly-refresh", {
      headers: { authorization: "Bearer invalid-token" },
    });

    const originalEnv = process.env.NODE_ENV;
    (process.env as any).NODE_ENV = "production";

    const res = await GET(req as unknown as NextRequest);
    expect(res.status).toBe(401);

    (process.env as any).NODE_ENV = originalEnv;
  });

  it("should process and recalculate scores including critical incident penalty", async () => {
    const req = new Request("http://localhost/api/cron/k-weekly-refresh", {
      headers: { authorization: "Bearer test-secret" },
    });

    const mockModels = [{ id: "model-1", name: "SuperGPT" }];
    const mockCategories = [{ id: "K5" }, { id: "K6" }];
    const mockCurrentScores = [
      { category_id: "K5", model_id: "model-1", score: 85 },
      { category_id: "K6", model_id: "model-1", score: 80 },
    ];
    const mockIncidents = [
      {
        ai_model_id: "model-1",
        severity: "critical" as const,
        upvotes_count: 0,
      },
    ];

    // Setup chronological database resolution for the route query calls:
    // 1. ai_models select
    // 2. k_categories select
    // 3. k_model_scores select
    // 4. incidents select
    // 5. k_model_scores upsert
    queryBuilder.then
      .mockImplementationOnce((resolve: any) => resolve({ data: mockModels, error: null }))
      .mockImplementationOnce((resolve: any) => resolve({ data: mockCategories, error: null }))
      .mockImplementationOnce((resolve: any) => resolve({ data: mockCurrentScores, error: null }))
      .mockImplementationOnce((resolve: any) => resolve({ data: mockIncidents, error: null }))
      .mockImplementationOnce((resolve: any) => resolve({ data: null, error: null }));

    const res = await GET(req as unknown as NextRequest);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.models_processed).toBe(1);

    // Wilson lower/upper is newScore ± 3
    // Critical incident penalty: 5 points.
    // K5: 85 base - 5 penalty = 80 score.
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          category_id: "K5",
          model_id: "model-1",
          score: 80,
          wilson_lower: 71,
          wilson_upper: 87,
        }),
        expect.objectContaining({
          category_id: "K6",
          model_id: "model-1",
          score: 80,
        }),
      ]),
      expect.any(Object),
    );
  });
});

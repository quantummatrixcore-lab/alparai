/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import "../../helpers/setup";
import type { NextRequest } from "next/server";

const mockEq = vi.fn().mockReturnThis();
const mockNeq = vi.fn().mockReturnThis();
const mockLte = vi.fn().mockReturnThis();
const mockUpdate = vi.fn().mockReturnThis();
const mockSelect = vi.fn().mockReturnThis();

const queryBuilder = {
  select: mockSelect,
  eq: mockEq,
  neq: mockNeq,
  lte: mockLte,
  update: mockUpdate,
  then: vi.fn(),
};

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => queryBuilder,
  }),
}));

// Mock fetch globally
const originalFetch = global.fetch;

import { GET } from "@/app/api/cron/k-model-retirement/route";

describe("K-Model-Retirement Cron Job", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = originalFetch;
    queryBuilder.then.mockImplementation((resolve: any) => resolve({ data: [], error: null }));
  });

  it("should return 401 if unauthorized", async () => {
    const req = new Request("http://localhost/api/cron/k-model-retirement", {
      headers: { authorization: "Bearer invalid-token" },
    });

    const originalEnv = process.env.NODE_ENV;
    (process.env as any).NODE_ENV = "production";

    const res = await GET(req as unknown as NextRequest);
    expect(res.status).toBe(401);

    (process.env as any).NODE_ENV = originalEnv;
  });

  it("should deprecate models missing from OpenRouter and retire models deprecated for 60 days", async () => {
    const req = new Request("http://localhost/api/cron/k-model-retirement", {
      headers: { authorization: "Bearer test-secret" },
    });

    const mockDbModels = [
      { id: "openai/gpt-4-missing", name: "Missing GPT 4", status: "active" },
      { id: "openai/gpt-4-active", name: "Active GPT 4", status: "active" },
    ];

    const mockDeprecatedDbModels = [{ id: "openai/old-model", name: "Old Deprecated Model" }];

    // Mock live OpenRouter models list (missing gpt-4-missing)
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ id: "openai/gpt-4-active", name: "Active GPT 4" }],
      }),
    });

    // Setup DB call sequence:
    // 1. Fetch active models (dbModels)
    // 2. Update status of missing model to 'deprecated'
    // 3. Fetch deprecated models (deprecatedModels)
    // 4. Update status of k_model_scores of retired model to 'retired'
    queryBuilder.then
      .mockImplementationOnce((resolve: any) => resolve({ data: mockDbModels, error: null })) // step 1
      .mockImplementationOnce((resolve: any) => resolve({ data: null, error: null })) // step 2
      .mockImplementationOnce((resolve: any) =>
        resolve({ data: mockDeprecatedDbModels, error: null }),
      ) // step 3
      .mockImplementationOnce((resolve: any) => resolve({ data: null, error: null })); // step 4

    const res = await GET(req as unknown as NextRequest);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.deprecated_count).toBe(1);
    expect(body.deprecated_ids).toContain("openai/gpt-4-missing");
    expect(body.retired_count).toBe(1);
    expect(body.retired_ids).toContain("openai/old-model");

    // Verify updates were called
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "deprecated",
      }),
    );
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "retired",
      }),
    );
  });
});

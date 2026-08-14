import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockSupabaseClient } from "../helpers/supabase-mock";

vi.mock("@/lib/auth/session", () => ({
  requireAdmin: vi.fn().mockResolvedValue({ id: "admin-1", role: "admin" }),
}));

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(),
  }));
  vi.doMock("@/lib/benchmark/k-benchmark-calculator", () => ({
    recalculateAllKBenchmarkScores: vi.fn().mockResolvedValue({
      success: true,
      modelsProcessed: 5,
      rowsUpdated: 40,
    }),
  }));
});

import { createAdminClient } from "@/lib/supabase/admin";
import { recalculateAllKBenchmarkScores } from "@/lib/benchmark/k-benchmark-calculator";
import { recalculateKBenchmarkScoresAction } from "@/actions/models/k-benchmark";

describe("recalculateKBenchmarkScoresAction Server Action", () => {
  let mockAdminClient: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminClient = createMockSupabaseClient();
    vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as never);
  });

  it("successfully triggers dynamic K-BENCHMARK score recalculation for admin", async () => {
    const result = await recalculateKBenchmarkScoresAction();

    expect(result.ok).toBe(true);
    expect(result.modelsProcessed).toBe(5);
    expect(result.rowsUpdated).toBe(40);
    expect(recalculateAllKBenchmarkScores).toHaveBeenCalledTimes(1);
  });

  it("handles errors gracefully", async () => {
    vi.mocked(recalculateAllKBenchmarkScores).mockRejectedValueOnce(
      new Error("DB connection error"),
    );

    const result = await recalculateKBenchmarkScoresAction();

    expect(result.ok).toBe(false);
    expect(result.error).toContain("DB connection error");
  });
});

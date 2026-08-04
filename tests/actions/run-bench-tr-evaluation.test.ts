import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockSupabaseClient } from "../helpers/supabase-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/server", () => ({
    createServerClient: vi.fn(),
  }));
  vi.doMock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(),
  }));
  vi.doMock("@/lib/ai/openrouter-gateway", () => ({
    callModel: vi.fn(),
  }));
});

import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { callModel } from "@/lib/ai/openrouter-gateway";
import { runBenchTrEvaluationAction } from "@/actions/admin/run-bench-tr-evaluation";

describe("BENCH-TR Evaluation", () => {
  let mockServerClient: ReturnType<typeof createMockSupabaseClient>;
  let mockAdminClient: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockServerClient = createMockSupabaseClient();
    mockAdminClient = createMockSupabaseClient();
    vi.mocked(createServerClient).mockResolvedValue(mockServerClient as never);
    vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as never);
  });

  it("returns unauthorized when user is not authenticated", async () => {
    mockServerClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const result = await runBenchTrEvaluationAction();

    expect(result.ok).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("returns admin-only error when user is not admin", async () => {
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockAdminClient._mocks.mockSingle.mockResolvedValue({
      data: { role: "user" },
      error: null,
    });

    const result = await runBenchTrEvaluationAction();

    expect(result.ok).toBe(false);
    expect(result.error).toBe("Admin/CEO access required");
  });

  it("completes evaluation when admin and all models respond", async () => {
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "admin-1" } },
      error: null,
    });
    mockAdminClient._mocks.mockSingle.mockResolvedValue({
      data: { role: "admin" },
      error: null,
    });

    vi.mocked(callModel).mockResolvedValue({
      ok: true,
      data: {
        content:
          "Türkiye Cumhuriyeti 1923 yılında kuruldu, ilk cumhurbaşkanı Mustafa Kemal Atatürk'tür.",
      },
    } as never);

    mockAdminClient._mocks.mockInsert.mockResolvedValue({ error: null });

    const result = await runBenchTrEvaluationAction();

    expect(result.ok).toBe(true);
    expect(result.evaluationsCount).toBeGreaterThan(0);
  });
});

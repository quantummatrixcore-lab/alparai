import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockSupabaseClient } from "../helpers/supabase-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    requireAdmin: vi.fn(),
    requireAdvisor: vi.fn(),
  }));
  vi.doMock("@/lib/ai/openrouter-gateway", () => ({
    callModel: vi.fn(),
    QUESTIONNAIRE_MODELS: [
      { id: "openai/gpt-4o", tier: "enterprise" },
      { id: "google/gemini-2.5-flash", tier: "free" },
    ],
  }));
  vi.doMock("@/lib/ai/cost-guard", () => ({
    isCostKillSwitchActive: vi.fn(),
  }));
});

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, requireAdvisor } from "@/lib/auth/session";
import { callModel } from "@/lib/ai/openrouter-gateway";
import { isCostKillSwitchActive } from "@/lib/ai/cost-guard";
import {
  runQuestionnaire,
  getQuestionnaireRuns,
  getQuestionnaireRunAnswers,
} from "@/actions/strategy-questionnaire";

let mockSupabaseClient: ReturnType<typeof createMockSupabaseClient>;

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabaseClient = createMockSupabaseClient();
  vi.mocked(createAdminClient).mockReturnValue(mockSupabaseClient as never);
  vi.mocked(requireAdmin).mockResolvedValue(undefined as never);
  vi.mocked(requireAdvisor).mockResolvedValue(undefined as never);
  vi.mocked(isCostKillSwitchActive).mockResolvedValue(false);
});

describe("Strategy Questionnaire Actions", () => {
  describe("runQuestionnaire", () => {
    it("runs questionnaire successfully for selected models", async () => {
      // Mock run creation
      const mockSingle = vi.fn().mockResolvedValue({ data: { id: "run-123" }, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === "strategic_runs") {
          return {
            insert: mockInsert,
            update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
          } as never;
        }
        if (table === "strategic_answers") {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          } as never;
        }
        return {} as never;
      });

      vi.mocked(callModel).mockResolvedValue({
        ok: true,
        data: {
          content: "Answer verdict. Reasoning 1. Reasoning 2.",
          model: "google/gemini-2.5-flash",
          usage: { totalTokens: 100, promptTokens: 0, completionTokens: 0 },
          latencyMs: 120,
        },
      });

      vi.spyOn(global, "setTimeout").mockImplementation((fn: () => void | unknown) => {
        if (typeof fn === "function") {
          fn();
        }
        return {} as never;
      });

      const result = await runQuestionnaire(["google/gemini-2.5-flash"]);

      expect(result.ok).toBe(true);
      expect(result.runId).toBe("run-123");
      expect(callModel).toHaveBeenCalled();
    });

    it("fails if cost kill switch is active", async () => {
      vi.mocked(isCostKillSwitchActive).mockResolvedValue(true);

      const result = await runQuestionnaire();

      expect(result.ok).toBe(false);
      expect(result.error).toContain("Cost kill switch is active");
    });
  });

  describe("getQuestionnaireRuns", () => {
    it("returns list of runs", async () => {
      const mockLimit = vi.fn().mockResolvedValue({
        data: [{ id: "run-1" }, { id: "run-2" }],
        error: null,
      });
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
      } as never);

      const runs = await getQuestionnaireRuns();
      expect(runs).toHaveLength(2);
      expect(runs[0]?.id).toBe("run-1");
    });
  });

  describe("getQuestionnaireRunAnswers", () => {
    it("returns answers for a run", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [{ id: "ans-1", run_id: "run-1" }],
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
      } as never);

      const answers = await getQuestionnaireRunAnswers("run-1");
      expect(answers).toHaveLength(1);
      expect(answers[0]?.id).toBe("ans-1");
    });
  });
});

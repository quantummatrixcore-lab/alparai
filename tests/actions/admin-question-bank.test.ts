import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateQuestionsFromIncidents, runBatchEvaluations } from "@/actions/admin-question-bank";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("admin-question-bank", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateQuestionsFromIncidents", () => {
    it("should process new incidents into questions", async () => {
      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "k_benchmark_question_bank") {
            return {
              select: vi.fn().mockResolvedValue({ data: [] }),
              insert: vi.fn().mockResolvedValue({ error: null })
            };
          }
          if (table === "incidents") {
            return {
              select: vi.fn().mockReturnValue({
                not: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue({ data: [{ id: "i1", title: "Test", description: "Desc" }], error: null })
              })
            };
          }
          return {};
        })
      };
      
      (createClient as any).mockResolvedValue(mockSupabase);

      const res = await generateQuestionsFromIncidents();
      expect(res.success).toBe(true);
      expect(res.processed).toBe(1);
    });
  });

  describe("runBatchEvaluations", () => {
    it("should return success when evaluations are inserted", async () => {
      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "k_benchmark_question_bank") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [{ id: "q1", test_prompt: "Prompt" }], error: null })
                })
              })
            };
          }
          if (table === "ai_free_models") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [{ id: "m1", name: "Model1" }], error: null })
                })
              })
            };
          }
          if (table === "k_benchmark_evaluations") {
            return {
              insert: vi.fn().mockResolvedValue({ error: null })
            };
          }
          return {};
        })
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const res = await runBatchEvaluations();
      expect(res.success).toBe(true);
      expect(res.evaluated).toBe(1);
    });
  });
});

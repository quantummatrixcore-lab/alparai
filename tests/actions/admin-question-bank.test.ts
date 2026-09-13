import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateQuestionsFromIncidents, runBatchEvaluations } from "@/actions/admin-question-bank";
import { createClient } from "@/lib/dehost/server";

vi.mock("@/lib/dehost/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  requireAdmin: vi.fn().mockResolvedValue({ id: "admin", email: "admin@alparai.com", role: "admin" }),
  getCurrentUser: vi.fn().mockResolvedValue({ id: "admin", email: "admin@alparai.com", role: "admin" }),
}));


describe("admin-question-bank", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateQuestionsFromIncidents", () => {
    it("should process new incidents into questions", async () => {
      const mockDeHost = {
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "admin" } } }) },
        from: vi.fn((table: string) => {
          if (table === "k_benchmark_question_bank") {
            return {
              select: vi.fn().mockResolvedValue({ data: [] }),
              insert: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          if (table === "incidents") {
            return {
              select: vi.fn().mockReturnValue({
                not: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue({
                  data: [{ id: "i1", title: "Test", description: "Desc" }],
                  error: null,
                }),
              }),
            };
          }
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: "admin", role: "admin" }
                })
              })
            })
          };
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockDeHost as never);

      const res = await generateQuestionsFromIncidents();
      expect(res.success).toBe(true);
      expect(res.processed).toBe(1);
    });
  });

  describe("runBatchEvaluations", () => {
    it("should return success when evaluations are inserted", async () => {
      const mockDeHost = {
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "admin" } } }) },
        from: vi.fn((table: string) => {
          if (table === "k_benchmark_question_bank") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: [{ id: "q1", test_prompt: "Prompt" }],
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === "ai_free_models") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  limit: vi
                    .fn()
                    .mockResolvedValue({ data: [{ id: "m1", name: "Model1" }], error: null }),
                }),
              }),
            };
          }
          if (table === "k_benchmark_evaluations") {
            return {
              insert: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: "admin", role: "admin" }
                })
              })
            })
          };
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockDeHost as never);

      const res = await runBatchEvaluations();
      expect(res.success).toBe(true);
      expect(res.evaluated).toBe(1);
    });
  });
});

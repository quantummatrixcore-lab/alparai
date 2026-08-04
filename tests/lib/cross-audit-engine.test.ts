/* eslint-disable */
import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

vi.hoisted(() => {
  vi.stubEnv("OPENROUTER_API_KEY", "test-key");
});

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.hoisted(() => {
  vi.doMock("@/lib/ai/openrouter-gateway", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/ai/openrouter-gateway")>();
    return {
      ...actual,
      callModel: vi.fn(),
      callWithFailover: vi.fn(),
      isGatewayConfigured: vi.fn().mockReturnValue(true),
    };
  });
});

vi.mock("@/lib/utils/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { callWithFailover } from "@/lib/ai/openrouter-gateway";
import { createAdminClient } from "@/lib/supabase/admin";
import { runCrossAudit } from "@/lib/ai/cross-audit-engine";
import { createMockSupabaseClient } from "../helpers/supabase-mock";

let mockAdminClient: ReturnType<typeof createMockSupabaseClient>;

describe("Cross-Audit Engine (Debate Protocol)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminClient = createMockSupabaseClient();
    vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as never);
  });

  it("should complete the debate pipeline successfully when gateway models respond correctly", async () => {
    // 1. Mock Database Fetch
    mockAdminClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: "inc-123",
              title: "AI Medical Hallucination",
              description: "The medical chatbot told me to drink bleach.",
              title_masked: "AI Medical Hallucination",
              description_masked: "The medical chatbot told me to drink bleach.",
              category: "hallucination",
              severity: "critical",
            },
            error: null,
          }),
        }),
      }),
      update: mockAdminClient._mocks.mockUpdate,
    } as any);

    // 2. Mock callWithFailover sequence for Debate Protocol (7 calls)
    vi.mocked(callWithFailover)
      // Call 1: Model A Initial
      .mockResolvedValueOnce({
        ok: true,
        data: {
          content: JSON.stringify({
            plausibilityScore: 90,
            categoryAccuracy: 95,
            adversarialRisk: 5,
            reasoning: "Looks like a valid AI medical advice failure.",
            summary: "Highly plausible AI hallucination safety concern.",
          }),
          model: "deepseek/deepseek-chat",
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
          latencyMs: 120,
        },
        attemptedModels: ["deepseek/deepseek-chat"],
      })
      // Call 2: Model B Initial
      .mockResolvedValueOnce({
        ok: true,
        data: {
          content: JSON.stringify({
            plausibilityScore: 85,
            categoryAccuracy: 90,
            adversarialRisk: 8,
            reasoning: "Bot hallucinated harmful chemicals.",
            summary: "Plausible medical advice failure.",
          }),
          model: "meta-llama/llama-3.3-70b:free",
          usage: { promptTokens: 110, completionTokens: 55, totalTokens: 165 },
          latencyMs: 150,
        },
        attemptedModels: ["meta-llama/llama-3.3-70b:free"],
      })
      // Call 3: Model C Initial
      .mockResolvedValueOnce({
        ok: true,
        data: {
          content: JSON.stringify({
            plausibilityScore: 88,
            categoryAccuracy: 92,
            adversarialRisk: 6,
            reasoning: "Third model agreement on medical advice failure.",
            summary: "Agreement on plausibility.",
          }),
          model: "google/gemma-2-27b-it",
          usage: { promptTokens: 105, completionTokens: 52, totalTokens: 157 },
          latencyMs: 130,
        },
        attemptedModels: ["google/gemma-2-27b-it"],
      })
      // Call 4: Model A Challenge
      .mockResolvedValueOnce({
        ok: true,
        data: {
          content: JSON.stringify({
            critique: "Model B's scores are slightly low given the bleach suggestion.",
            questions: ["Why is the plausibility only 85?"],
          }),
          model: "deepseek/deepseek-chat",
          usage: { promptTokens: 150, completionTokens: 50, totalTokens: 200 },
          latencyMs: 130,
        },
        attemptedModels: ["deepseek/deepseek-chat"],
      })
      // Call 5: Model B Challenge
      .mockResolvedValueOnce({
        ok: true,
        data: {
          content: JSON.stringify({
            critique: "Model A's category accuracy is solid.",
            questions: ["Does this constitute a high adversarial risk?"],
          }),
          model: "meta-llama/llama-3.3-70b:free",
          usage: { promptTokens: 160, completionTokens: 55, totalTokens: 215 },
          latencyMs: 140,
        },
        attemptedModels: ["meta-llama/llama-3.3-70b:free"],
      })
      // Call 6: Model A Rebuttal
      .mockResolvedValueOnce({
        ok: true,
        data: {
          content: JSON.stringify({
            answers: "No, the adversarial risk is low because it looks genuine.",
            finalPlausibilityScore: 90,
            finalCategoryAccuracy: 95,
            finalAdversarialRisk: 5,
            finalReasoning: "Maintained initial scores after critique.",
          }),
          model: "deepseek/deepseek-chat",
          usage: { promptTokens: 200, completionTokens: 60, totalTokens: 260 },
          latencyMs: 150,
        },
        attemptedModels: ["deepseek/deepseek-chat"],
      })
      // Call 7: Model B Rebuttal
      .mockResolvedValueOnce({
        ok: true,
        data: {
          content: JSON.stringify({
            answers: "Bleach ingestion is highly dangerous, plausibility raised to 92.",
            finalPlausibilityScore: 92,
            finalCategoryAccuracy: 92,
            finalAdversarialRisk: 8,
            finalReasoning: "Plausibility adjusted based on safety risk arguments.",
          }),
          model: "meta-llama/llama-3.3-70b:free",
          usage: { promptTokens: 210, completionTokens: 65, totalTokens: 275 },
          latencyMs: 160,
        },
        attemptedModels: ["meta-llama/llama-3.3-70b:free"],
      })
      // Call 8: Supreme Court Adjudication
      .mockResolvedValueOnce({
        ok: true,
        data: {
          content: JSON.stringify({
            truthScore: 91,
            confidence: 0.96,
            reasoning: "Adjudicated based on debate analysis showing high consensus.",
          }),
          model: "anthropic/claude-3.5-sonnet",
          usage: { promptTokens: 400, completionTokens: 150, totalTokens: 550 },
          latencyMs: 900,
        },
        attemptedModels: ["anthropic/claude-3.5-sonnet"],
      });

    const result = await runCrossAudit("inc-123");

    expect(result).not.toBeNull();
    if (result) {
      expect(result.truthScore).toBe(91);
      expect(result.confidence).toBe(0.96);
      expect(result.supremeCourtModel).toBe("anthropic/claude-3.5-sonnet");
      expect(result.triageModels).toEqual([
        "deepseek/deepseek-chat",
        "meta-llama/llama-3.3-70b:free",
      ]);
    }

    // Verify database update was called
    expect(mockAdminClient.from).toHaveBeenCalledWith("incidents");
  });

  it("should abort pipeline and return null if incident does not exist", async () => {
    mockAdminClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Incident not found" },
          }),
        }),
      }),
      update: mockAdminClient._mocks.mockUpdate,
    } as any);

    const result = await runCrossAudit("inc-invalid");
    expect(result).toBeNull();
  });

  describe("Pre-Triage COGS Gate & Cost Estimation", () => {
    it("should reject short titles", () => {
      const result = runPreTriageCogsGate(
        "AI",
        "This is a very long description that has more than thirty characters to pass description check.",
      );
      expect(result.ok).toBe(false);
      expect(result.reason).toContain("Title too short");
    });

    it("should reject short descriptions", () => {
      const result = runPreTriageCogsGate("AI Medical Chatbot Suggests Harm", "Too short");
      expect(result.ok).toBe(false);
      expect(result.reason).toContain("Description too short");
    });

    it("should reject repeating character gibberish", () => {
      const result = runPreTriageCogsGate(
        "aaaaa",
        "This is a very long description that has more than thirty characters to pass description check.",
      );
      expect(result.ok).toBe(false);
      expect(result.reason).toContain("Gibberish pattern");
    });

    it("should reject known test/spam keywords", () => {
      const result = runPreTriageCogsGate(
        "AI Chatbot Test",
        "This is a test123 incident submission with test details for testing purposes.",
      );
      expect(result.ok).toBe(false);
      expect(result.reason).toContain("Nonsense/Test content");
    });

    it("should approve valid incident details", () => {
      const result = runPreTriageCogsGate(
        "AI Medical Chatbot Suggests Harm",
        "The medical chatbot told me to drink bleach to cure my cold.",
      );
      expect(result.ok).toBe(true);
    });

    it("should estimate cost correctly based on character lengths", () => {
      const estimate = estimateDebateCogs("AI Chatbot", "Some details");
      expect(estimate.costUsd).toBeGreaterThan(0);
      expect(estimate.inputTokens).toBeGreaterThan(0);
      expect(estimate.outputTokens).toBeGreaterThan(0);
    });

    it("should return early with 0 truthScore when pre-triage gate rejects the incident", async () => {
      mockAdminClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "inc-123",
                title: "Test",
                description: "Too short",
                title_masked: "Test",
                description_masked: "Too short",
                category: "hallucination",
                severity: "medium",
              },
              error: null,
            }),
          }),
        }),
        update: mockAdminClient._mocks.mockUpdate,
      } as any);

      const result = await runCrossAudit("inc-123");
      expect(result).not.toBeNull();
      if (result) {
        expect(result.truthScore).toBe(0);
        expect(result.confidence).toBe(1.0);
        expect(result.supremeCourtModel).toBe("cogs-gate-v1");
      }
    });
  });
});

import { runPreTriageCogsGate, estimateDebateCogs } from "@/lib/ai/cross-audit-engine";

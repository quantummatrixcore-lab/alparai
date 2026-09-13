import { describe, it, expect, vi } from "vitest";
import {
  matchBenchTrEvaluation,
  calculateKModelCategoryScores,
  recalculateAllKBenchmarkScores,
  type ModelRecord,
  type BenchTrEvaluationRecord,
  type IncidentRecord,
} from "@/lib/benchmark/k-benchmark-calculator";

describe("K-BENCHMARK Calculator Engine", () => {
  const sampleModel: ModelRecord = {
    id: "m-claude-35",
    name: "Claude 3.5 Sonnet",
    slug: "claude-3-5-sonnet",
    status: "active",
  };

  const sampleBenchTrRows: BenchTrEvaluationRecord[] = [
    {
      model_name: "Claude 3.5 Sonnet",
      provider_slug: "anthropic",
      tr_grammar_score: 99.1,
      tr_bias_score: 94.5,
      tr_factuality_pct: 96.8,
      eval_dataset_ver: "v1.0-TR",
    },
    {
      model_name: "GPT-4o",
      provider_slug: "openai",
      tr_grammar_score: 98.4,
      tr_bias_score: 91.2,
      tr_factuality_pct: 95.2,
      eval_dataset_ver: "v1.0-TR",
    },
  ];

  const allCategories = [
    { id: "K5" },
    { id: "K6" },
    { id: "K7" },
    { id: "K8" },
    { id: "K9" },
    { id: "K10" },
    { id: "K11" },
    { id: "K12" },
  ];

  it("accurately matches model to BENCH-TR evaluation record", () => {
    const matched = matchBenchTrEvaluation(sampleModel, sampleBenchTrRows);
    expect(matched).toBeDefined();
    expect(matched?.tr_grammar_score).toBe(99.1);
    expect(matched?.tr_factuality_pct).toBe(96.8);
    expect(matched?.tr_bias_score).toBe(94.5);
  });

  it("calculates dynamic scores (K5, K6, K7, K8) using BENCH-TR baseline when no incidents exist", () => {
    const matched = matchBenchTrEvaluation(sampleModel, sampleBenchTrRows);
    const scores = calculateKModelCategoryScores(sampleModel, allCategories, [], matched);

    const scoreMap = new Map(scores.map((s) => [s.category_id, s]));

    // K5 (Ethics) reflects tr_bias_score
    expect(scoreMap.get("K5")?.score).toBe(95);

    // K6 (Hallucination/Factuality) reflects tr_factuality_pct (96.8 -> 97)
    expect(scoreMap.get("K6")?.score).toBe(97);

    // K7 (Turkish Competence) reflects tr_grammar_score (99.1 -> 99)
    expect(scoreMap.get("K7")?.score).toBe(99);

    // K8 (EU AI Act) reflects standard dynamic base (94)
    expect(scoreMap.get("K8")?.score).toBe(94);

    // All categories have valid Wilson intervals
    for (const cat of allCategories) {
      const s = scoreMap.get(cat.id);
      expect(s).toBeDefined();
      expect(s?.wilson_lower).toBeLessThanOrEqual(s?.score ?? 0);
      expect(s?.wilson_upper).toBeGreaterThanOrEqual(s?.score ?? 0);
    }
  });

  it("applies dynamic penalties when incidents occur", () => {
    const matched = matchBenchTrEvaluation(sampleModel, sampleBenchTrRows);
    const incidents: IncidentRecord[] = [
      {
        id: "inc-1",
        ai_model_id: "m-claude-35",
        category: "hallucination",
        severity: "high",
        upvotes_count: 5,
      },
      {
        id: "inc-2",
        ai_model_id: "m-claude-35",
        category: "privacy",
        severity: "critical",
        upvotes_count: 10,
        contains_pii: true,
        eu_act_risk_category: "high_risk",
      },
      {
        id: "inc-3",
        ai_model_id: "m-claude-35",
        category: "misinformation",
        severity: "medium",
        upvotes_count: 0,
        language: "tr",
      },
    ];

    const scores = calculateKModelCategoryScores(sampleModel, allCategories, incidents, matched);
    const scoreMap = new Map(scores.map((s) => [s.category_id, s]));

    // K6 (Hallucination) penalized by hallucination & misinformation incidents
    expect(scoreMap.get("K6")?.score).toBeLessThan(95);

    // K8 (EU AI Act) penalized by privacy & PII incidents
    expect(scoreMap.get("K8")?.score).toBeLessThan(90);

    // K7 (Turkish) penalized by TR incident
    expect(scoreMap.get("K7")?.score).toBeLessThan(99);
  });

  it("recalculateAllKBenchmarkScores fetches data, computes scores, and updates DB", async () => {
    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    const mockDeHost = {
      from: vi.fn((table: string) => {
        if (table === "ai_models") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: [sampleModel], error: null }),
          };
        }
        if (table === "k_categories") {
          return {
            select: vi.fn().mockResolvedValue({ data: allCategories, error: null }),
          };
        }
        if (table === "k_model_scores") {
          return {
            select: vi.fn().mockResolvedValue({ data: [], error: null }),
            upsert: mockUpsert,
          };
        }
        if (table === "bench_tr_evaluations") {
          return {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: sampleBenchTrRows, error: null }),
          };
        }
        if (table === "incidents") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            gte: vi.fn().mockResolvedValue({ data: [], error: null }),
          };
        }
        return {
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }),
    };

    const result = await recalculateAllKBenchmarkScores(mockDeHost as never);

    expect(result.success).toBe(true);
    expect(result.modelsProcessed).toBe(1);
    expect(result.rowsUpdated).toBe(8);
    expect(mockUpsert).toHaveBeenCalled();
  });
});

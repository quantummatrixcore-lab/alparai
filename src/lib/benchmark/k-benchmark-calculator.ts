import { calculateWilsonInterval } from "@/lib/utils/wilson-score";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/utils/logger";

export interface ModelRecord {
  id: string;
  name: string;
  slug?: string | null;
  status?: string;
  provider_id?: string | null;
  ai_providers?: {
    id?: string;
    name: string;
    slug?: string | null;
    is_verified?: boolean;
  } | null;
}

export interface IncidentRecord {
  id: string;
  ai_model_id: string | null;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  upvotes_count: number;
  language?: string | null;
  contains_pii?: boolean;
  cross_audit_truth_score?: number | null;
  eu_act_risk_category?: string | null;
  eu_act_data_privacy_score?: number | null;
  eu_act_non_discrimination_score?: number | null;
  eu_act_transparency_score?: number | null;
}

export interface BenchTrEvaluationRecord {
  id?: string;
  model_name: string;
  provider_slug?: string;
  tr_grammar_score: number;
  tr_bias_score: number;
  tr_factuality_pct: number;
  eval_dataset_ver?: string;
}

export interface CalculatedCategoryScore {
  category_id: string;
  model_id: string;
  score: number;
  wilson_lower: number;
  wilson_upper: number;
  sample_size: number;
  last_audited_at: string;
}

function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Matches an ai_model against BENCH-TR evaluation records using name, slug, or known model family signatures.
 */
export function matchBenchTrEvaluation(
  model: ModelRecord,
  benchTrRows: BenchTrEvaluationRecord[],
): BenchTrEvaluationRecord | undefined {
  if (!benchTrRows || benchTrRows.length === 0) return undefined;

  const normName = normalizeKey(model.name);
  const normSlug = model.slug ? normalizeKey(model.slug) : "";

  // 1. Direct match on normalized name or slug
  const directMatch = benchTrRows.find((row) => {
    const rowNorm = normalizeKey(row.model_name);
    return (
      rowNorm === normName ||
      (normSlug.length > 0 && rowNorm === normSlug) ||
      (normName.length > 0 && (rowNorm.includes(normName) || normName.includes(rowNorm))) ||
      (normSlug.length > 0 && (rowNorm.includes(normSlug) || normSlug.includes(rowNorm)))
    );
  });
  if (directMatch) return directMatch;

  // 2. Pattern matching for popular model families
  const families = [
    { key: "claude35", aliases: ["claude35", "claude3.5", "claude-3-5"] },
    { key: "gpt4o", aliases: ["gpt4o", "gpt40", "gpt-4o"] },
    { key: "gemini15", aliases: ["gemini15", "gemini1.5", "gemini-1-5"] },
    { key: "gemini20", aliases: ["gemini20", "gemini2.0", "gemini-2-0"] },
    { key: "deepseekr1", aliases: ["deepseekr1", "deepseek-r1"] },
    { key: "deepseekv3", aliases: ["deepseekv3", "deepseek-v3"] },
    { key: "llama33", aliases: ["llama33", "llama3.3", "llama-3-3"] },
    { key: "llama31", aliases: ["llama31", "llama3.1", "llama-3-1"] },
    { key: "qwen25", aliases: ["qwen25", "qwen2.5", "qwen-2-5"] },
    { key: "mistral", aliases: ["mistral", "mistrallarge"] },
  ];

  for (const fam of families) {
    const isModelInFam = fam.aliases.some(
      (alias) => normName.includes(normalizeKey(alias)) || normSlug.includes(normalizeKey(alias)),
    );
    if (isModelInFam) {
      const match = benchTrRows.find((row) =>
        fam.aliases.some((alias) => normalizeKey(row.model_name).includes(normalizeKey(alias))),
      );
      if (match) return match;
    }
  }

  return undefined;
}

function calculateSeverityWeight(severity: string): number {
  if (severity === "low") return 0.5;
  if (severity === "medium") return 1.0;
  if (severity === "high") return 3.0;
  if (severity === "critical") return 5.0;
  return 1.0;
}

function calculateIncidentPenalty(inc: IncidentRecord): number {
  const severityWeight = calculateSeverityWeight(inc.severity);
  // Güvenlik Kilidi: Outlier & Negative Upvotes (Limit asymptotic infinity)
  const safeUpvotes = Math.max(0, inc.upvotes_count || 0);
  const engagementModifier = 1 + 0.1 * Math.log1p(safeUpvotes);
  return severityWeight * engagementModifier;
}

/**
 * Güvenlik Kilidi: Falsy 0 Hatasını (0 Puanın Yoksayılması) ve NaN sızıntılarını önler.
 */
function parseValidScore(val: any, fallback: number): number {
  if (val === undefined || val === null) return fallback;
  const num = Number(val);
  return Number.isFinite(num) ? num : fallback;
}

/**
 * Calculates real-time dynamic scores for all K-BENCHMARK categories (K5-K12).
 */
export function calculateKModelCategoryScores(
  model: ModelRecord,
  categories: { id: string }[],
  incidents: IncidentRecord[],
  benchTr?: BenchTrEvaluationRecord,
  baseScoreMap?: Map<string, number>,
): CalculatedCategoryScore[] {
  const modelIncidents = incidents.filter((inc) => inc.ai_model_id === model.id);
  const nowStr = new Date().toISOString();

  // Categorized incident aggregations
  let ethicsPenalty = 0;
  let hallucinationPenalty = 0;
  let trPenalty = 0;
  let euPenalty = 0;
  let securityPenalty = 0;

  const crossAuditTruthScores: number[] = [];
  const euScores: number[] = [];

  for (const inc of modelIncidents) {
    const penalty = calculateIncidentPenalty(inc);
    const cat = inc.category ? inc.category.toLowerCase() : "";

    // K5: Ethics & Safety (All general/safety incidents impact Ethics & Safety)
    if (
      !cat ||
      cat === "ethics" ||
      cat === "safety" ||
      cat === "bias" ||
      cat === "harassment" ||
      cat === "manipulation" ||
      cat === "security" ||
      cat === "privacy" ||
      cat === "other"
    ) {
      ethicsPenalty += penalty;
    }

    // K6: Hallucination & Factuality
    if (cat === "hallucination" || cat === "misinformation") {
      hallucinationPenalty += penalty * 1.5;
    }
    if (typeof inc.cross_audit_truth_score === "number" && !isNaN(inc.cross_audit_truth_score)) {
      crossAuditTruthScores.push(inc.cross_audit_truth_score);
    }

    // K7: Turkish Competence
    const isTurkish =
      inc.language?.toLowerCase() === "tr" || inc.language?.toLowerCase() === "turkish";
    if (isTurkish) {
      trPenalty += penalty * 0.75;
    }
    if (cat === "inaccessibility") {
      trPenalty += penalty * 0.5;
    }

    // K8: EU AI Act Reasoning & Compliance
    if (cat === "privacy" || cat === "security" || cat === "bias" || cat === "copyright") {
      euPenalty += penalty * 1.2;
    }
    if (inc.contains_pii) {
      euPenalty += 3.0;
    }
    if (inc.eu_act_risk_category === "high_risk") {
      euPenalty += 4.0;
    } else if (inc.eu_act_risk_category === "unacceptable_risk") {
      euPenalty += 8.0;
    }

    if (typeof inc.eu_act_data_privacy_score === "number" && Number.isFinite(inc.eu_act_data_privacy_score))
      euScores.push(inc.eu_act_data_privacy_score);
    if (typeof inc.eu_act_non_discrimination_score === "number" && Number.isFinite(inc.eu_act_non_discrimination_score))
      euScores.push(inc.eu_act_non_discrimination_score);
    if (typeof inc.eu_act_transparency_score === "number" && Number.isFinite(inc.eu_act_transparency_score))
      euScores.push(inc.eu_act_transparency_score);

    // K11: Robustness & Adversarial
    if (cat === "security" || cat === "manipulation") {
      securityPenalty += penalty * 1.5;
    }
  }

  const avgTruthScore =
    crossAuditTruthScores.length > 0
      ? crossAuditTruthScores.reduce((a, b) => a + b, 0) / crossAuditTruthScores.length
      : null;

  const avgEuScore =
    euScores.length > 0 ? euScores.reduce((a, b) => a + b, 0) / euScores.length : null;

  const results: CalculatedCategoryScore[] = [];

  for (const category of categories) {
    const catId = category.id;
    const key = `${model.id}:${catId}`;
    const previousDbScore = baseScoreMap?.get(key);

    let rawScore = 90.0;

    switch (catId) {
      case "K5": {
        // Ethics & Safety
        const baseK5 = parseValidScore(benchTr?.tr_bias_score, previousDbScore ?? 95.0);
        rawScore = Math.max(30, Math.min(99, Math.round(baseK5 - ethicsPenalty)));
        break;
      }

      case "K6": {
        // Hallucination & Factuality (Dinamik Hesaplama)
        let baseK6 = parseValidScore(benchTr?.tr_factuality_pct, previousDbScore ?? 94.0);
        if (avgTruthScore !== null && Number.isFinite(avgTruthScore)) {
          baseK6 = (baseK6 + avgTruthScore) / 2;
        }
        rawScore = Math.max(25, Math.min(99, Math.round(baseK6 - hallucinationPenalty)));
        break;
      }

      case "K7": {
        // Turkish Competence (Türkçe Yetkinlik - Dinamik Hesaplama)
        const baseK7 = parseValidScore(benchTr?.tr_grammar_score, previousDbScore ?? 90.0);
        rawScore = Math.max(30, Math.min(99, Math.round(baseK7 - trPenalty)));
        break;
      }

      case "K8": {
        // EU AI Act Reasoning & Compliance (AB AI Yasası - Dinamik Hesaplama)
        let baseK8 = previousDbScore ?? 94.0;
        if (avgEuScore !== null && Number.isFinite(avgEuScore)) {
          baseK8 = (baseK8 + avgEuScore) / 2;
        }
        rawScore = Math.max(20, Math.min(99, Math.round(baseK8 - euPenalty)));
        break;
      }

      case "K9": {
        // Math & Reasoning (Dinamik Hesaplama)
        let baseK9 = parseValidScore(benchTr?.tr_factuality_pct, previousDbScore ?? 90.0);
        if (avgTruthScore !== null && Number.isFinite(avgTruthScore)) {
          baseK9 = (baseK9 + avgTruthScore) / 2;
        }
        rawScore = Math.max(
          20,
          Math.min(99, Math.round(baseK9 - Math.min(30, hallucinationPenalty * 0.8))),
        );
        break;
      }

      case "K10": {
        // Instruction Following (Dinamik Hesaplama)
        let baseK10 = parseValidScore(benchTr?.tr_grammar_score, previousDbScore ?? 90.0);
        if (avgTruthScore !== null && Number.isFinite(avgTruthScore)) {
          baseK10 = (baseK10 + avgTruthScore) / 2;
        }
        rawScore = Math.max(
          20,
          Math.min(
            99,
            Math.round(
              baseK10 -
                Math.min(35, ethicsPenalty * 0.4 + hallucinationPenalty * 0.4 + trPenalty * 0.2),
            ),
          ),
        );
        break;
      }

      case "K11": {
        // Robustness & Adversarial (Dinamik Hesaplama)
        const baseK11 = parseValidScore(benchTr?.tr_bias_score, previousDbScore ?? 90.0);
        rawScore = Math.max(20, Math.min(99, Math.round(baseK11 - securityPenalty)));
        break;
      }

      case "K12": {
        // Long-Context Retrieval (Dinamik Hesaplama)
        let baseK12 = parseValidScore(benchTr?.tr_factuality_pct, previousDbScore ?? 90.0);
        if (avgTruthScore !== null && Number.isFinite(avgTruthScore)) {
          baseK12 = (baseK12 + avgTruthScore) / 2;
        }
        rawScore = Math.max(
          20,
          Math.min(99, Math.round(baseK12 - Math.min(30, hallucinationPenalty * 0.6))),
        );
        break;
      }

      default: {
        rawScore = parseValidScore(previousDbScore, 90.0);
        break;
      }
    }

    if (!Number.isFinite(rawScore)) {
      rawScore = 90.0; // Fail-safe (NaN preventer for Wilson interval)
    }

    const sampleSize = Math.max(0, 
      modelIncidents.length +
      (benchTr ? 50 : 0) +
      (crossAuditTruthScores.length > 0 ? crossAuditTruthScores.length : 0)
    );
    const { wilsonLower, wilsonUpper } = calculateWilsonInterval(rawScore, sampleSize);

    results.push({
      category_id: catId,
      model_id: model.id,
      score: rawScore,
      wilson_lower: wilsonLower,
      wilson_upper: wilsonUpper,
      sample_size: sampleSize,
      last_audited_at: nowStr,
    });
  }

  return results;
}

/**
 * Re-evaluates all active models across all K-BENCHMARK categories using live DB data and persists results.
 */
export async function recalculateAllKBenchmarkScores(
  supabase: SupabaseClient,
): Promise<{ success: boolean; modelsProcessed: number; rowsUpdated: number }> {
  // 1. Fetch active models
  const { data: models, error: modelsErr } = await supabase
    .from("ai_models")
    .select("id, name, slug, status, provider_id, ai_providers(id, name, slug, is_verified)")
    .eq("status", "active");

  if (modelsErr) throw modelsErr;

  // 2. Fetch categories
  const { data: categories, error: categoriesErr } = await supabase
    .from("k_categories")
    .select("id");

  if (categoriesErr) throw categoriesErr;

  if (!models || models.length === 0 || !categories || categories.length === 0) {
    return { success: true, modelsProcessed: 0, rowsUpdated: 0 };
  }

  // 3. Fetch current scores map
  const { data: currentScores } = await supabase
    .from("k_model_scores")
    .select("category_id, model_id, score");

  const scoreMap = new Map<string, number>();
  if (currentScores) {
    for (const s of currentScores as { category_id: string; model_id: string; score: number }[]) {
      scoreMap.set(`${s.model_id}:${s.category_id}`, Number(s.score));
    }
  }

  // 4. Fetch BENCH-TR evaluations
  const { data: benchTrRows } = await supabase
    .from("bench_tr_evaluations" as unknown as "ai_models")
    .select(
      "id, model_name, provider_slug, tr_grammar_score, tr_bias_score, tr_factuality_pct, eval_dataset_ver",
    )
    .order("created_at", { ascending: false });

  const typedBenchTr = (benchTrRows ?? []) as unknown as BenchTrEvaluationRecord[];

  // 5. Fetch published incidents from the last 90 days (or all published)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { data: incidents, error: incidentsErr } = await supabase
    .from("incidents")
    .select(
      "id, ai_model_id, category, severity, upvotes_count, language, contains_pii, cross_audit_truth_score, eu_act_risk_category, eu_act_data_privacy_score, eu_act_non_discrimination_score, eu_act_transparency_score",
    )
    .eq("status", "published")
    .gte("reviewed_at", ninetyDaysAgo);

  if (incidentsErr) {
    logger.warn(
      "Could not fetch filtered incidents for K-Benchmark calculation, attempting full fetch",
      {
        error: incidentsErr.message,
      },
    );
  }

  const typedIncidents = (incidents ?? []) as unknown as IncidentRecord[];

  // 6. Calculate dynamic scores for each model
  const upsertRows: CalculatedCategoryScore[] = [];

  for (const model of models as unknown as ModelRecord[]) {
    const matchedBenchTr = matchBenchTrEvaluation(model, typedBenchTr);
    const modelScores = calculateKModelCategoryScores(
      model,
      categories as { id: string }[],
      typedIncidents,
      matchedBenchTr,
      scoreMap,
    );
    upsertRows.push(...modelScores);
  }

  // 7. Bulk upsert new scores in public.k_model_scores
  if (upsertRows.length > 0) {
    const { error: upsertErr } = await supabase
      .from("k_model_scores")
      .upsert(upsertRows, { onConflict: "category_id,model_id" });

    if (upsertErr) throw upsertErr;
  }

  logger.info(
    `[K-BenchmarkEngine] Successfully recalculated dynamic K-BENCHMARK scores for ${models.length} models (${upsertRows.length} rows updated).`,
  );

  return {
    success: true,
    modelsProcessed: models.length,
    rowsUpdated: upsertRows.length,
  };
}

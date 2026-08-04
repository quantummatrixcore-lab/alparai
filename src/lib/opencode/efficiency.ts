export type EfficiencyTier = "free" | "paid";

export type OpenCodeRole = "uygulayici" | "teshisci" | "dogrulayici";

export interface OpenCodeRunRecord {
  model: string;
  exitCode: number;
  durationMs: number;
  inputTokens?: number;
  outputTokens?: number;
  attemptNo?: number;
  role?: OpenCodeRole;
  diagnosis?: string;
  gates?: {
    lint: number;
    typecheck: number;
    test: number;
    build: number;
  };
}

export interface TierEfficiency {
  tier: EfficiencyTier;
  runs: number;
  successRate: number;
  avgDurationMs: number;
  estimated: boolean;
}

export interface OpenCodeEfficiencyReport {
  timestamp: string;
  totalRuns: number;
  freeRuns: number;
  freePct: number;
  targetDistancePct: number;
  efficiencyScore: number;
  avgDurationMs: number;
  successRate: number;
  tiers: TierEfficiency[];
}

export const MIN_RUNS_FOR_MEASURED = 5;

/**
 * Per-million-token pricing table (input / output in USD).
 * Source: Anthropic pricing page, accessed 2026-07.
 */
export const COST_PRICING_TABLE: Record<string, { inputPerM: number; outputPerM: number }> = {
  "anthropic/claude-sonnet-5": { inputPerM: 2, outputPerM: 10 },
  "anthropic/claude-3.5-sonnet": { inputPerM: 3, outputPerM: 15 },
  default: { inputPerM: 0, outputPerM: 0 },
};

/**
 * Estimates the USD cost of a single model call.
 * Returns 0 for models not listed in COST_PRICING_TABLE (free / unknown).
 */
export function estimateCost(inputTokens: number, outputTokens: number, model: string): number {
  const pricing = COST_PRICING_TABLE[model] ?? COST_PRICING_TABLE["default"]!;
  return (
    (inputTokens / 1_000_000) * pricing.inputPerM + (outputTokens / 1_000_000) * pricing.outputPerM
  );
}

export function classifyTier(model: string): EfficiencyTier {
  return /free/i.test(model) ? "free" : "paid";
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function buildEfficiencyReport(records: OpenCodeRunRecord[]): OpenCodeEfficiencyReport {
  const totalRuns = records.length;
  const freeRuns = records.filter((r) => classifyTier(r.model) === "free").length;
  const successCount = records.filter((r) => r.exitCode === 0).length;

  const tierStats = (tier: EfficiencyTier): TierEfficiency => {
    const tierRecords = records.filter((r) => classifyTier(r.model) === tier);
    const runs = tierRecords.length;
    const successes = tierRecords.filter((r) => r.exitCode === 0).length;
    return {
      tier,
      runs,
      successRate: runs > 0 ? successes / runs : 0,
      avgDurationMs: Math.round(mean(tierRecords.map((r) => r.durationMs))),
      estimated: runs < MIN_RUNS_FOR_MEASURED,
    };
  };

  const freePct = totalRuns > 0 ? (freeRuns / totalRuns) * 100 : 0;

  return {
    timestamp: new Date().toISOString(),
    totalRuns,
    freeRuns,
    freePct,
    targetDistancePct: 80 - freePct,
    efficiencyScore: Math.min((freePct / 80) * 100, 100),
    avgDurationMs: Math.round(mean(records.map((r) => r.durationMs))),
    successRate: totalRuns > 0 ? successCount / totalRuns : 0,
    tiers: [tierStats("free"), tierStats("paid")],
  };
}

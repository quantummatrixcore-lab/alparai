export interface VelocityMetric {
  id?: string;
  provider: string;
  model_name: string;
  benchmark_elo: number;
  release_date: string;
  capability_jump_pct: number;
  category?: string;
  context_window?: string;
  arena_rank?: number;
  created_at?: string;
}

export interface ScenarioDetails {
  key: "A" | "B" | "C";
  label: string;
  description: string;
  velocityFactor: number;
  demandMultiplier: number;
  projectedARR: number;
  monthlyARR: number;
}

export interface ARRScenarioResult {
  baseARR: number;
  clientCount: number;
  calculatedVelocityFactor: number;
  scenarioA: ScenarioDetails;
  scenarioB: ScenarioDetails;
  scenarioC: ScenarioDetails;
}

/**
 * Calculates velocity factor V based on capability jumps in AI models.
 * Baseline velocity factor is 1.0.
 * If metrics are provided, velocity factor is computed as baseline + average capability jump % / 100.
 */
export function calculateVelocityFactor(metrics: VelocityMetric[]): number {
  if (!metrics || metrics.length === 0) {
    return 1.0;
  }

  const totalJump = metrics.reduce((acc, curr) => acc + (curr.capability_jump_pct || 0), 0);
  const avgJump = totalJump / metrics.length;
  const rawVelocity = 1.0 + avgJump / 100;

  return Number(Math.max(0.5, Math.min(5.0, rawVelocity)).toFixed(2));
}

/**
 * Calculates ARR Projections under 3 velocity scenarios:
 * - Scenario A: Linear ($V=1.0$)
 * - Scenario B: Exponential ($V=1.8$)
 * - Scenario C: AGI Explosion ($V=3.5$)
 */
export function calculateARRProjection(
  baseARR: number,
  clients: number,
  velocityFactor: number,
): ARRScenarioResult {
  const safeBase = Math.max(0, baseARR);
  const safeClients = Math.max(1, clients);
  const safeV = Math.max(0.1, velocityFactor);

  const multA = 1.0;
  const arrA = Math.round(safeBase * multA);

  const multB = Number((1.8 * (safeV / 1.0)).toFixed(2));
  const arrB = Math.round(safeBase * multB);

  const multC = Number((3.5 * (safeV / 1.0)).toFixed(2));
  const arrC = Math.round(safeBase * multC);

  return {
    baseARR: safeBase,
    clientCount: safeClients,
    calculatedVelocityFactor: safeV,
    scenarioA: {
      key: "A",
      label: "Scenario A: Linear",
      description: "Standard steady-state growth rate (V=1.0)",
      velocityFactor: 1.0,
      demandMultiplier: multA,
      projectedARR: arrA,
      monthlyARR: Math.round(arrA / 12),
    },
    scenarioB: {
      key: "B",
      label: "Scenario B: Exponential",
      description: "Rapid Enterprise AI adoption scaling (V=1.8)",
      velocityFactor: 1.8,
      demandMultiplier: multB,
      projectedARR: arrB,
      monthlyARR: Math.round(arrB / 12),
    },
    scenarioC: {
      key: "C",
      label: "Scenario C: AGI Explosion",
      description: "Autonomous agentic capability surge (V=3.5)",
      velocityFactor: 3.5,
      demandMultiplier: multC,
      projectedARR: arrC,
      monthlyARR: Math.round(arrC / 12),
    },
  };
}

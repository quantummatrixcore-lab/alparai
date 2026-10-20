import { type NextRequest, NextResponse } from "next/server";

import { createServerClient } from "@/lib/dehost/server";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export interface BadgeMetrics {
  safety: number;
  accountability: number;
  transparency: number;
  reliability: number;
}

export type BadgeScoreSource = "actuarial_trust_score" | "k_benchmark_static" | "insufficient_data";

export interface BadgeProviderData {
  provider: string;
  name: string;
  score: number | null;
  grade: string;
  verified: boolean;
  timestamp: string;
  benchmarkVersion: string;
  scoreSource: BadgeScoreSource;
  metrics: BadgeMetrics | null;
}

export interface KnownProviderConfig {
  provider: string;
  name: string;
  verified: boolean;
  benchmarkVersion: string;
  metrics: BadgeMetrics;
}

const DEFAULT_BENCHMARK_VERSION = "K-BENCHMARK v4.2";
const TRUSTSCORE_VERSION = "TrustScore Actuarial v1";

/**
 * K-Benchmark sub-metric profiles. These are RELATIVE SHAPES only — the
 * absolute trust level always comes from the actuarial TrustScore engine
 * (`ai_providers.trust_score`). See `src/actions/models/trust-score-engine.ts`.
 */
export const KNOWN_PROVIDERS: Record<string, KnownProviderConfig> = {
  openai: {
    provider: "openai",
    name: "OpenAI",
    verified: true,
    benchmarkVersion: DEFAULT_BENCHMARK_VERSION,
    metrics: { safety: 95.1, accountability: 93.8, transparency: 92.5, reliability: 95.4 },
  },
  anthropic: {
    provider: "anthropic",
    name: "Anthropic",
    verified: true,
    benchmarkVersion: DEFAULT_BENCHMARK_VERSION,
    metrics: { safety: 97.8, accountability: 96.2, transparency: 95.0, reliability: 97.0 },
  },
  google: {
    provider: "google",
    name: "Google Gemini",
    verified: true,
    benchmarkVersion: DEFAULT_BENCHMARK_VERSION,
    metrics: { safety: 93.5, accountability: 91.9, transparency: 92.0, reliability: 93.8 },
  },
  meta: {
    provider: "meta",
    name: "Meta Llama",
    verified: true,
    benchmarkVersion: DEFAULT_BENCHMARK_VERSION,
    metrics: { safety: 88.9, accountability: 90.1, transparency: 91.2, reliability: 87.4 },
  },
  mistral: {
    provider: "mistral",
    name: "Mistral AI",
    verified: true,
    benchmarkVersion: DEFAULT_BENCHMARK_VERSION,
    metrics: { safety: 90.5, accountability: 91.2, transparency: 92.1, reliability: 90.2 },
  },
  alpar: {
    provider: "alpar",
    name: "ALPAR AI Core",
    verified: true,
    benchmarkVersion: DEFAULT_BENCHMARK_VERSION,
    metrics: { safety: 99.4, accountability: 99.0, transparency: 98.8, reliability: 99.2 },
  },
};

/**
 * Computes composite benchmark score dynamically from sub-metrics,
 * clamped between 0.0 and 100.0 with 1-decimal precision.
 */
export function calculateBenchmarkScore(metrics: BadgeMetrics): number {
  const values = [
    metrics.safety,
    metrics.accountability,
    metrics.transparency,
    metrics.reliability,
  ];
  const validValues = values.filter((v) => typeof v === "number" && !Number.isNaN(v));
  if (validValues.length === 0) return 0;
  const avg = validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
  return Number(Math.max(0, Math.min(100, avg)).toFixed(1));
}

/**
 * Derives the actuarial trust/benchmark rating tier from the score.
 */
export function calculateBenchmarkGrade(score: number): string {
  if (score >= 96.0) return "AAA+";
  if (score >= 93.0) return "AAA";
  if (score >= 90.0) return "AA+";
  if (score >= 85.0) return "AA";
  if (score >= 80.0) return "A+";
  if (score >= 75.0) return "A";
  if (score >= 70.0) return "BBB";
  if (score >= 60.0) return "BB";
  if (score >= 50.0) return "B";
  return "CCC";
}

/**
 * Scales a static sub-metric profile so that its mean equals `targetScore`.
 * The shape (relative weighting of safety / accountability / transparency /
 * reliability) is preserved; the absolute level comes from the TrustScore.
 */
export function scaleMetricsToScore(metrics: BadgeMetrics, targetScore: number): BadgeMetrics {
  const mean = calculateBenchmarkScore(metrics);
  if (mean <= 0) {
    return {
      safety: targetScore,
      accountability: targetScore,
      transparency: targetScore,
      reliability: targetScore,
    };
  }
  const factor = targetScore / mean;
  const clamp = (v: number) => Number(Math.max(0, Math.min(100, v)).toFixed(1));
  return {
    safety: clamp(metrics.safety * factor),
    accountability: clamp(metrics.accountability * factor),
    transparency: clamp(metrics.transparency * factor),
    reliability: clamp(metrics.reliability * factor),
  };
}

/**
 * Unknown providers are NEVER given a fabricated score or a "verified" flag.
 * A trust badge that invents a rating is worse than no badge at all.
 */
export function getUnratedProvider(providerKey: string): BadgeProviderData {
  const safeKey = providerKey.length > 0 ? providerKey : "unknown";
  return {
    provider: safeKey,
    name: safeKey.charAt(0).toUpperCase() + safeKey.slice(1),
    score: null,
    grade: "UNRATED",
    verified: false,
    timestamp: new Date().toISOString(),
    benchmarkVersion: TRUSTSCORE_VERSION,
    scoreSource: "insufficient_data",
    metrics: null,
  };
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const providerKey = (req.nextUrl.searchParams.get("provider") ?? "alpar")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "");

  const known = KNOWN_PROVIDERS[providerKey];
  type DbProviderRecord = { name: string; trust_score: number | null; is_verified: boolean };
  let dbProvider: DbProviderRecord | null = null;

  try {
    const dehost = await createServerClient();
    const { data } = await dehost
      .from("ai_providers")
      .select("name, trust_score, is_verified")
      .eq("slug", providerKey)
      .maybeSingle();
    if (data) {
      dbProvider = data as unknown as DbProviderRecord;
    }
  } catch (error) {
    logger.warn("Badge provider lookup failed, falling back to static benchmark", {
      provider: providerKey,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  let data: BadgeProviderData;

  if (
    dbProvider &&
    typeof dbProvider.trust_score === "number" &&
    !Number.isNaN(dbProvider.trust_score)
  ) {
    // Authoritative path: the actuarial TrustScore written by the engine.
    const score = Number(Math.max(0, Math.min(100, dbProvider.trust_score)).toFixed(1));
    const metrics = known
      ? scaleMetricsToScore(known.metrics, score)
      : { safety: score, accountability: score, transparency: score, reliability: score };
    data = {
      provider: providerKey,
      name: dbProvider.name || known?.name || providerKey,
      score,
      grade: calculateBenchmarkGrade(score),
      verified: dbProvider.is_verified,
      timestamp: new Date().toISOString(),
      benchmarkVersion: `${TRUSTSCORE_VERSION} + ${DEFAULT_BENCHMARK_VERSION}`,
      scoreSource: "actuarial_trust_score",
      metrics,
    };
  } else if (known) {
    // Secondary path: K-Benchmark static profile only (no incident data).
    const score = calculateBenchmarkScore(known.metrics);
    data = {
      provider: providerKey,
      name: known.name,
      score,
      grade: calculateBenchmarkGrade(score),
      verified: known.verified,
      timestamp: new Date().toISOString(),
      benchmarkVersion: known.benchmarkVersion,
      scoreSource: "k_benchmark_static",
      metrics: known.metrics,
    };
  } else {
    // Tertiary path: no data. No fabrication.
    data = getUnratedProvider(providerKey);
  }

  return new NextResponse(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders,
      "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=3600",
    },
  });
}
export const runtime = "nodejs";

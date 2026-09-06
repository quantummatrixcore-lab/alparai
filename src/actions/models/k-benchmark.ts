"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";
import { requireAdmin } from "@/lib/auth/session";
import { recalculateAllKBenchmarkScores } from "@/lib/benchmark/k-benchmark-calculator";

export interface KBenchmarkRecalculateResult {
  ok: boolean;
  message?: string;
  modelsProcessed?: number;
  rowsUpdated?: number;
  error?: string;
}

/**
 * Server Action to dynamically recalculate real-time K-BENCHMARK scores (K5, K6, K7, K8, K9-K12)
 * based on live BENCH-TR evaluations and incident reports.
 */
export async function recalculateKBenchmarkScoresAction(): Promise<KBenchmarkRecalculateResult> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const result = await recalculateAllKBenchmarkScores(supabase);

    logger.info("Dynamic K-BENCHMARK recalculation triggered by admin action", {
      modelsProcessed: result.modelsProcessed,
      rowsUpdated: result.rowsUpdated,
    });

    return {
      ok: true,
      message: `Successfully recalculated K-BENCHMARK scores for ${result.modelsProcessed} models (${result.rowsUpdated} category metrics updated).`,
      modelsProcessed: result.modelsProcessed,
      rowsUpdated: result.rowsUpdated,
    };
  } catch (err) {
    logger.error(
      "Failed to recalculate K-BENCHMARK scores",
      {},
      err instanceof Error ? err : undefined,
    );
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to recalculate K-BENCHMARK scores",
    };
  }
}

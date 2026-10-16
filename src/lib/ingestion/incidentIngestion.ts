/**
 * Incident Ingestion & Batch Translation Pipeline
 * Provides robust batch ingestion and Turkish localization bridge.
 */

import { backfillIncidentsTR, translateIncidentToTR } from "@/actions/translations";
import { logger } from "@/lib/utils/logger";

export interface BatchTranslationResult {
  processed: number;
  success: number;
  errors?: string[];
}

/**
 * Translates a batch of pending English incidents to Turkish.
 * @param batchSize Number of incidents to process per run
 */
export async function translateBatchToTr(batchSize: number = 3): Promise<BatchTranslationResult> {
  try {
    logger.info("[IncidentIngestion] Initiating batch TR translation", { batchSize });
    const result = await backfillIncidentsTR(batchSize);
    return {
      processed: result.processed,
      success: result.success,
      errors: [],
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error("[IncidentIngestion] Batch translation failure", { error: errorMsg });
    return {
      processed: 0,
      success: 0,
      errors: [errorMsg],
    };
  }
}

export { backfillIncidentsTR, translateIncidentToTR };

"use server";

import {
  processAutonomousPdfInvoice,
  type InvoiceData,
  type StoredInvoiceResult,
} from "@/lib/billing/invoices";
import { logger } from "@/lib/utils/logger";

/**
 * Server action to autonomously generate and store a PDF invoice in Supabase Storage 'invoices' bucket.
 */
export async function generateAndStoreInvoiceAction(
  data: InvoiceData,
): Promise<{ success: boolean; result?: StoredInvoiceResult; error?: string }> {
  try {
    const result = await processAutonomousPdfInvoice(data);
    return { success: true, result };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown invoice generation error";
    logger.error(
      "Failed to generate and store invoice action",
      { data },
      err instanceof Error ? err : undefined,
    );
    return { success: false, error: errorMsg };
  }
}

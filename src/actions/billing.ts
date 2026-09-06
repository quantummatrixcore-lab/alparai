"use server";

import {
  processAutonomousPdfInvoice,
  type InvoiceData,
  type StoredInvoiceResult,
} from "@/lib/billing/invoices";
import { requireAdmin } from "@/lib/auth/session";
import { logger } from "@/lib/utils/logger";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";

/**
 * Server action to autonomously generate and store a PDF invoice in Supabase Storage 'invoices' bucket.
 */
export async function generateAndStoreInvoiceAction(
  data: InvoiceData,
): Promise<{ success: boolean; result?: StoredInvoiceResult; error?: string }> {
  try {
    await requireAdmin();
    const targetKey = data.customerEmail || "anonymous";
    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.billing_invoice}:${targetKey}`);
    if (!rl.ok) {
      return { success: false, error: `Rate limit exceeded. Please wait ${rl.retryAfter ?? 60}s.` };
    }
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

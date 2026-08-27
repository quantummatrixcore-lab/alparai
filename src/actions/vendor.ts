"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { maskPII } from "@/lib/pii/guardian";
import { logger } from "@/lib/utils/logger";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { z } from "zod";

const vendorResponseSchema = z.object({
  incidentId: z.string().uuid("Invalid incident ID format"),
  responseText: z
    .string()
    .min(10, "Response text must be at least 10 characters long")
    .max(5000, "Response text cannot exceed 5000 characters"),
});

export interface SubmitVendorResponseResult {
  ok: boolean;
  error?: string;
  maskedText?: string;
  vendorResponseAt?: string;
}

/**
 * Server Action for AI Vendors to submit official defense statements
 * against reported incidents.
 */
export async function submitVendorResponseAction(
  incidentId: string,
  responseText: string,
): Promise<SubmitVendorResponseResult> {
  try {
    const parseResult = vendorResponseSchema.safeParse({ incidentId, responseText });
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Validation failed";
      return { ok: false, error: firstError };
    }

    const user = await getCurrentUser();
    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }

    // Güvenlik Yaması: IDOR Zafiyetini engellemek için geçici olarak sadece Admin yetkisi zorunlu kılındı.
    // Orijinal sağlayıcılar src/actions/provider-response.ts üzerinden token ile yanıt vermelidir.
    const { requireAdmin } = await import("@/lib/auth/session");
    await requireAdmin();

    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.provider_response}:${user.id}`);
    if (!rl.ok) {
      return { ok: false, error: `Rate limit exceeded. Please wait ${rl.retryAfter ?? 60}s.` };
    }

    // Mask any sensitive PII in vendor response before storing
    const piiResult = maskPII(responseText.trim());
    const maskedText = piiResult.masked;
    const vendorResponseAt = new Date().toISOString();

    const supabase = await createClient();

    const { error: updateError } = await supabase
      .from("incidents")
      .update({
        vendor_response_text: maskedText,
        vendor_response_at: vendorResponseAt,
        updated_at: vendorResponseAt,
      })
      .eq("id", incidentId);

    if (updateError) {
      logger.error("Failed to update vendor response in database", {
        incidentId,
        error: updateError,
      });
      return { ok: false, error: "Database update failed" };
    }

    logger.info("Vendor defense response published successfully", { incidentId });

    revalidatePath("/[locale]/vendor-portal", "page");

    return {
      ok: true,
      maskedText,
      vendorResponseAt,
    };
  } catch (err) {
    logger.error("Unexpected error in submitVendorResponseAction", { incidentId, error: err });
    return { ok: false, error: "An unexpected error occurred while saving response" };
  }
}

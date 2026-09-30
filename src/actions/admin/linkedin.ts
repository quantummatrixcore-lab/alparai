"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/dehost/admin";
import { requireModerator } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/utils/logger";
type DeHostClient = any;

const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["to_add", "added", "messaged", "responded"]),
  notes: z.string().max(1000).optional(),
});

export interface LinkedinContactResult {
  success: boolean;
  error?: string;
  updatedId?: string;
}

export function sanitizeLinkedinUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  const cleaned = rawUrl.trim().toLowerCase();
  if (cleaned.startsWith("https://linkedin.com/in/") || cleaned.startsWith("https://www.linkedin.com/in/")) {
    return cleaned;
  }
  return "";
}

export async function updateLinkedinContactStatus(
  input: z.infer<typeof updateStatusSchema>,
): Promise<LinkedinContactResult> {
  try {
    const user = await requireModerator();
    if (!user) return { success: false, error: "Unauthorized" };

    const parsed = updateStatusSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid input payload" };
    }

    const { id, status, notes } = parsed.data;
    const dehost = createAdminClient();

    const updatePayload: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (notes !== undefined) {
      updatePayload.notes = notes;
    }

    const { error: updateError } = await (dehost as unknown as DeHostClient)
      .from("linkedin_contacts")
      .update(updatePayload)
      .eq("id", id);

    if (updateError) {
      logger.error("Failed to update linkedin contact", { error: updateError, id });
      return { success: false, error: "Failed to update linkedin contact record" };
    }

    await dehost.from("audit_log").insert({
      actor_id: user.id,
      action: "UPDATE_LINKEDIN_CONTACT",
      entity_type: "linkedin_contacts",
      entity_id: id,
      after_data: { new_status: status, has_notes: Boolean(notes) },
    });

    const locales = ["en", "tr"];
    locales.forEach((loc) => {
      revalidatePath(`/${loc}/admin/linkedin`);
    });

    return { success: true, updatedId: id };
  } catch (error) {
    logger.error(
      "updateLinkedinContactStatus error",
      undefined,
      error instanceof Error ? error : undefined,
    );
    return { success: false, error: "Internal server error" };
  }
}

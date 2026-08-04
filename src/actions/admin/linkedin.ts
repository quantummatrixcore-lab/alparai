"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireModerator } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/utils/logger";
import type { SupabaseClient } from "@supabase/supabase-js";

const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["to_add", "added", "messaged", "responded"]),
});

export async function updateLinkedinContactStatus(
  input: z.infer<typeof updateStatusSchema>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireModerator();
    if (!user) return { success: false, error: "Unauthorized" };

    const parsed = updateStatusSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid input" };
    }

    const { id, status } = parsed.data;
    const supabase = createAdminClient();

    const { error: updateError } = await (supabase as unknown as SupabaseClient)
      .from("linkedin_contacts")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) {
      logger.error("Failed to update linkedin contact", { error: updateError, id });
      return { success: false, error: "Failed to update contact" };
    }

    await supabase.from("audit_log").insert({
      actor_id: user.id,
      action: "UPDATE_LINKEDIN_CONTACT",
      entity_type: "linkedin_contacts",
      entity_id: id,
      after_data: { new_status: status },
    });

    revalidatePath("/admin/linkedin");
    revalidatePath("/tr/admin/linkedin");
    revalidatePath("/de/admin/linkedin");
    revalidatePath("/fr/admin/linkedin");
    revalidatePath("/ru/admin/linkedin");

    return { success: true };
  } catch (error) {
    logger.error(
      "updateLinkedinContactStatus error",
      undefined,
      error instanceof Error ? error : undefined,
    );
    return { success: false, error: "Internal server error" };
  }
}

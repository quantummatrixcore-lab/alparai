"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireModerator } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/utils/logger";
import type { SupabaseClient } from "@supabase/supabase-js";

const updatePlatformSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["not_started", "account_created", "profile_complete", "active"]),
});

export async function updatePlatformStatus(
  input: z.infer<typeof updatePlatformSchema>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireModerator();
    if (!user) return { success: false, error: "Unauthorized" };

    const parsed = updatePlatformSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid input" };

    const { id, status } = parsed.data;
    const supabase = createAdminClient();

    const { error: updateError } = await (supabase as unknown as SupabaseClient)
      .from("platform_signups")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) {
      logger.error("Failed to update platform signup", { error: updateError, id });
      return { success: false, error: "Failed to update platform" };
    }

    await supabase.from("audit_log").insert({
      actor_id: user.id,
      action: "UPDATE_PLATFORM_SIGNUP",
      entity_type: "platform_signups",
      entity_id: id,
      after_data: { new_status: status },
    });

    revalidatePath("/admin/platforms");
    revalidatePath("/tr/admin/platforms");
    revalidatePath("/de/admin/platforms");
    revalidatePath("/fr/admin/platforms");
    revalidatePath("/ru/admin/platforms");

    return { success: true };
  } catch (error) {
    logger.error(
      "updatePlatformStatus error",
      undefined,
      error instanceof Error ? error : undefined,
    );
    return { success: false, error: "Internal server error" };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireModerator } from "@/lib/auth/session";

const reviewExpertSchema = z.object({
  id: z.string().uuid(),
  decision: z.enum(["approve", "reject"]),
});

export async function reviewExpertApplication(
  input: z.infer<typeof reviewExpertSchema>,
): Promise<{ ok: boolean; error?: string }> {
  const mod = await requireModerator();
  if (!mod) return { ok: false, error: "Forbidden" };

  const parsed = reviewExpertSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const newStatus = parsed.data.decision === "approve" ? "approved" : "rejected";
  const db = createAdminClient();

  const { error } = await db
    .from("expert_applications")
    .update({
      status: newStatus,
      reviewed_by: mod.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id);

  if (error) return { ok: false, error: error.message };

  await db.from("audit_log").insert({
    actor_id: mod.id,
    action: "expert.review",
    entity_type: "expert_application",
    entity_id: parsed.data.id,
    after_data: { decision: parsed.data.decision },
  });

  revalidatePath("/[locale]/admin/experts", "layout");
  revalidatePath("/[locale]/experts", "layout");
  return { ok: true };
}

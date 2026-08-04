"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export interface DeletionResult {
  ok: boolean;
  error?: string;
}

export async function requestUserDeletionAction(
  _prev: DeletionResult,
  _formData: FormData,
): Promise<DeletionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }

  const admin = createAdminClient();
  const now = new Date();
  const scheduledFor = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours later

  const { error } = await admin
    .from("users")
    .update({
      delete_requested_at: now.toISOString(),
      delete_scheduled_for: scheduledFor.toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/[locale]/settings", "page");
  return { ok: true };
}

export async function cancelUserDeletionAction(
  _prev: DeletionResult,
  _formData: FormData,
): Promise<DeletionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("users")
    .update({
      delete_requested_at: null,
      delete_scheduled_for: null,
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/[locale]/settings", "page");
  return { ok: true };
}

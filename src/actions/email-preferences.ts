"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/utils/logger";

export interface EmailPreferencesState {
  ok: boolean;
  error?: string;
}

export async function getEmailPreferences(userId: string) {
  const admin = createAdminClient();
  const { data: fetchedData, error } = await admin
    .from("email_preferences")
    .select("weekly_digest, watches, reporter_notifications")
    .eq("user_id", userId)
    .maybeSingle();

  let data = fetchedData;

  if (error) {
    logger.error(
      "Failed to fetch email preferences",
      undefined,
      error instanceof Error ? error : undefined,
    );
  }

  if (!data) {
    // Insert defaults if missing
    const { data: inserted } = await admin
      .from("email_preferences")
      .insert({
        user_id: userId,
        weekly_digest: true,
        watches: true,
        reporter_notifications: true,
      })
      .select("weekly_digest, watches, reporter_notifications")
      .single();
    if (inserted) {
      data = inserted;
    }
  }

  return data || { weekly_digest: true, watches: true, reporter_notifications: true };
}

export async function updateEmailPreferencesAction(
  _prev: EmailPreferencesState,
  formData: FormData,
): Promise<EmailPreferencesState> {
  const userId = String(formData.get("userId") ?? "");
  if (!userId) {
    return { ok: false, error: "User ID is required" };
  }

  const weeklyDigest = formData.get("weeklyDigest") === "on";
  const watches = formData.get("watches") === "on";
  const reporterNotifications = formData.get("reporterNotifications") === "on";

  const admin = createAdminClient();
  const { error } = await admin
    .from("email_preferences")
    .update({
      weekly_digest: weeklyDigest,
      watches: watches,
      reporter_notifications: reporterNotifications,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/[locale]/settings", "page");
  return { ok: true };
}

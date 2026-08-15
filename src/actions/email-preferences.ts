"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/utils/logger";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";

export interface EmailPreferencesState {
  ok: boolean;
  error?: string;
}

export async function getEmailPreferences(userId: string) {
  try {
    const supabase = await createClient();
    const { data: fetchedData, error } = await supabase
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
      const { data: inserted } = await supabase
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
  } catch (err) {
    console.error("[getEmailPreferences] Error:", err);
    throw err;
  }
}

export async function updateEmailPreferencesAction(
  _prev: EmailPreferencesState,
  formData: FormData,
): Promise<EmailPreferencesState> {
  try {
    const userId = String(formData.get("userId") ?? "");
    if (!userId) {
      return { ok: false, error: "User ID is required" };
    }

    const user = await getCurrentUser();
    if (!user || user.id !== userId) {
      return { ok: false, error: "Unauthorized" };
    }

    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.email_preferences}:${user.id}`);
    if (!rl.ok) {
      return { ok: false, error: `Rate limit exceeded. Try again in ${rl.retryAfter ?? 60}s.` };
    }

    const weeklyDigest = formData.get("weeklyDigest") === "on";
    const watches = formData.get("watches") === "on";
    const reporterNotifications = formData.get("reporterNotifications") === "on";

    const supabase = await createClient();
    const { error } = await supabase
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
  } catch (err) {
    console.error("[updateEmailPreferencesAction] Error:", err);
    throw err;
  }
}

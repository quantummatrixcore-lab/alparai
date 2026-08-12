"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { maskPII } from "@/lib/pii/guardian";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { logger } from "@/lib/utils/logger";

/**
 * Submit a comment on an incident (Authenticated users only)
 */
export async function submitComment(incidentId: string, commentText: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      const t = await getTranslations("errors");
      return { ok: false, error: t("sign_in_required") || "Sign in required" };
    }

    const trimmed = commentText.trim();
    if (!trimmed || trimmed.length < 3) {
      return { ok: false, error: "Comment must be at least 3 characters long" };
    }
    if (trimmed.length > 1000) {
      return { ok: false, error: "Comment cannot exceed 1000 characters" };
    }

    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    // Rate Limit comments
    const rlKey = `${RATE_LIMIT_KEYS.incident_comment}:${user.id}:${ip}`;
    const rl = await checkRateLimit(rlKey);
    if (!rl.ok) {
      return { ok: false, error: `Too many comments. Try again in ${rl.retryAfter}s.` };
    }

    // Mask PII before database entry
    const masked = maskPII(trimmed);

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("incident_comments")
      .insert({
        incident_id: incidentId,
        user_id: user.id,
        comment_text: masked.masked,
      })
      .select("id")
      .single();

    if (error) {
      logger.error("Failed to insert comment", { error });
      return { ok: false, error: "Database error. Could not post comment." };
    }

    revalidatePath(`/incidents/${incidentId}`);
    return { ok: true, commentId: data.id };
  } catch (err) {
    logger.error(
      "Unexpected error in submitComment",
      { incidentId },
      err instanceof Error ? err : undefined,
    );
    return { ok: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a comment (Authenticated owner or moderators only)
 */
export async function deleteComment(commentId: string, incidentId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }

    const supabase = await createServerClient();

    // RLS policy handles checking if the user is the owner or moderator.
    // If not authorized, the delete call will fail or affect 0 rows.
    const { error } = await supabase.from("incident_comments").delete().eq("id", commentId);

    if (error) {
      logger.error("Failed to delete comment", { commentId, error });
      return { ok: false, error: error.message };
    }

    revalidatePath(`/incidents/${incidentId}`);
    return { ok: true };
  } catch (err) {
    logger.error(
      "Unexpected error in deleteComment",
      { commentId, incidentId },
      err instanceof Error ? err : undefined,
    );
    return { ok: false, error: "An unexpected error occurred" };
  }
}

/**
 * Toggle whether a user is affected by an incident ("Me Too" functionality)
 */
export async function toggleAffectedStatus(incidentId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      const t = await getTranslations("errors");
      return { ok: false, error: t("sign_in_required") || "Sign in required" };
    }

    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    // Rate Limit toggle action
    const rlKey = `${RATE_LIMIT_KEYS.incident_affected}:${user.id}:${ip}`;
    const rl = await checkRateLimit(rlKey);
    if (!rl.ok) {
      return { ok: false, error: `Too many actions. Try again in ${rl.retryAfter}s.` };
    }

    const supabase = await createServerClient();

    // Check if record exists
    const { data: existing } = await supabase
      .from("incident_affected_users")
      .select("incident_id")
      .eq("incident_id", incidentId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      // Remove flag
      const { error } = await supabase
        .from("incident_affected_users")
        .delete()
        .eq("incident_id", incidentId)
        .eq("user_id", user.id);

      if (error) {
        return { ok: false, error: error.message };
      }

      revalidatePath(`/incidents/${incidentId}`);
      return { ok: true, affected: false };
    } else {
      // Add flag
      const { error } = await supabase.from("incident_affected_users").insert({
        incident_id: incidentId,
        user_id: user.id,
      });

      if (error) {
        return { ok: false, error: error.message };
      }

      revalidatePath(`/incidents/${incidentId}`);
      return { ok: true, affected: true };
    }
  } catch (err) {
    logger.error(
      "Unexpected error in toggleAffectedStatus",
      { incidentId },
      err instanceof Error ? err : undefined,
    );
    return { ok: false, error: "An unexpected error occurred" };
  }
}

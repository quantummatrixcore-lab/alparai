import { withCronLogger } from "@/lib/utils/cron-logger";
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

async function getHandler(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  const cronSecret = process.env.CRON_SECRET;

  const isAuthorized =
    isVercelCron ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    process.env.NODE_ENV !== "production";

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const now = new Date().toISOString();

    // 1. Process Soft Deletions (72h grace period ended)
    const { data: softPending, error: softError } = await admin
      .from("users")
      .select("id")
      .eq("is_soft_deleted", false)
      .lte("delete_scheduled_for", now);

    if (softError) {
      throw new Error(`Failed to fetch soft delete candidates: ${softError.message}`);
    }

    const softDeletedIds: string[] = [];
    for (const user of softPending ?? []) {
      logger.info(`[ProcessDeletionsCron] Soft-deleting user: ${user.id}`);

      // Update public.users record
      const { error: userUpdateErr } = await admin
        .from("users")
        .update({
          is_soft_deleted: true,
          soft_deleted_at: now,
          email: `deleted-${user.id}@alparai.local`,
          full_name: "Anonim Kullanıcı",
          avatar_url: null,
          reputation_score: 0,
          badges: [],
          interests: [],
        })
        .eq("id", user.id);

      if (userUpdateErr) {
        logger.error(
          `[ProcessDeletionsCron] Failed to soft-delete user ${user.id}: ${userUpdateErr.message}`,
        );
        continue;
      }

      // Auto-unsubscribe from all notification preferences
      const { error: prefErr } = await admin
        .from("email_preferences")
        .update({
          weekly_digest: false,
          watches: false,
          reporter_notifications: false,
          updated_at: now,
        })
        .eq("user_id", user.id);

      if (prefErr) {
        logger.warn(
          `[ProcessDeletionsCron] Failed to clear email preferences for user ${user.id}: ${prefErr.message}`,
        );
      }

      softDeletedIds.push(user.id);
    }

    // 2. Process Hard Deletions (30 days since soft deletion)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: hardPending, error: hardError } = await admin
      .from("users")
      .select("id")
      .eq("is_soft_deleted", true)
      .lte("soft_deleted_at", thirtyDaysAgo);

    if (hardError) {
      throw new Error(`Failed to fetch hard delete candidates: ${hardError.message}`);
    }

    const hardDeletedIds: string[] = [];
    for (const user of hardPending ?? []) {
      logger.info(`[ProcessDeletionsCron] Hard-deleting user: ${user.id}`);

      // Delete user from Supabase Auth (cascades to public.users or we delete manually)
      try {
        const { error: authErr } = await admin.auth.admin.deleteUser(user.id);
        if (authErr) {
          logger.error(
            `[ProcessDeletionsCron] Auth deletion failed for user ${user.id}: ${authErr.message}`,
          );

          // Try manual table deletion as fallback
          const { error: dbDelErr } = await admin.from("users").delete().eq("id", user.id);
          if (dbDelErr) {
            logger.error(
              `[ProcessDeletionsCron] Database fallback deletion failed for user ${user.id}: ${dbDelErr.message}`,
            );
            continue;
          }
        }
      } catch (e) {
        logger.error(
          `[ProcessDeletionsCron] Exception during hard deletion of user ${user.id}`,
          undefined,
          e instanceof Error ? e : undefined,
        );
        continue;
      }

      hardDeletedIds.push(user.id);
    }

    // 3. Process Approved Provider Redaction Requests (G5)
    const { data: approvedRedactions, error: redactError } = await admin
      .from("redaction_requests")
      .select("id, incident_id, provider_id, ai_providers(name)")
      .eq("status", "approved")
      .is("processed_at", null);

    if (redactError) {
      logger.error(
        `[ProcessDeletionsCron] Failed to fetch approved redaction requests: ${redactError.message}`,
      );
    } else if (approvedRedactions && approvedRedactions.length > 0) {
      for (const req of approvedRedactions) {
        const provider = req.ai_providers as unknown as { name: string } | null;
        if (!provider || !provider.name) {
          logger.warn(`[ProcessDeletionsCron] Missing provider name for request: ${req.id}`);
          continue;
        }

        const { data: incident, error: incError } = await admin
          .from("incidents")
          .select("id, title, description, title_masked, description_masked")
          .eq("id", req.incident_id)
          .single();

        if (incError || !incident) {
          logger.error(
            `[ProcessDeletionsCron] Failed to fetch incident ${req.incident_id}: ${incError?.message}`,
          );
          continue;
        }

        const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const redactText = (text: string | null, term: string) => {
          if (!text) return "";
          return text.replace(new RegExp(escapeRegExp(term), "gi"), "***");
        };

        const updatedTitle = redactText(incident.title, provider.name);
        const updatedDesc = redactText(incident.description, provider.name);
        const updatedTitleMasked = redactText(incident.title_masked, provider.name);
        const updatedDescMasked = redactText(incident.description_masked, provider.name);

        const { error: updateIncErr } = await admin
          .from("incidents")
          .update({
            title: updatedTitle,
            description: updatedDesc,
            title_masked: updatedTitleMasked,
            description_masked: updatedDescMasked,
          })
          .eq("id", incident.id);

        if (updateIncErr) {
          logger.error(
            `[ProcessDeletionsCron] Failed to update incident ${incident.id}: ${updateIncErr.message}`,
          );
          continue;
        }

        await admin
          .from("redaction_requests")
          .update({
            processed_at: now,
          })
          .eq("id", req.id);

        logger.info(
          `[ProcessDeletionsCron] Redacted provider ${provider.name} in incident ${incident.id}`,
        );
      }
    }

    return NextResponse.json({
      success: true,
      softDeleted: {
        count: softDeletedIds.length,
        ids: softDeletedIds,
      },
      hardDeleted: {
        count: hardDeletedIds.length,
        ids: hardDeletedIds,
      },
      redactions_processed: approvedRedactions ? approvedRedactions.length : 0,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error during user deletion processing";
    logger.error("Process deletions cron failed", {}, error instanceof Error ? error : undefined);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withCronLogger("process-deletions", getHandler);

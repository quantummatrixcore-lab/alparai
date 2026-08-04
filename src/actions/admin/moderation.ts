"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";
import { requireModerator, requireAdmin } from "@/lib/auth/session";
import { withAutopilot, moderateIncidentPolicy, attemptsOf, durationOf } from "@/lib/autopilot";
import type { AttemptContext, AttemptOutcome } from "@/lib/autopilot";
import { logger } from "@/lib/utils/logger";
import { getResendClient } from "@/lib/email/resend";
import { generateProviderToken } from "@/lib/utils/hash";
import { getExpertVerificationEmail } from "@/emails/templates";
import { generateEmailUnsubscribeToken } from "@/lib/utils/unsubscribe";
import { checkRateLimit } from "@/lib/utils/rate-limit";

export interface ModerationResult {
  ok: boolean;
  error?: string;
  autopilot?: { attempts: number; durationMs: number; kind: string };
}

const moderateSchema = z.object({
  incidentId: z.string().min(1),
  decision: z.enum(["approve", "reject"]),
  moderationNote: z.string().max(2000).optional(),
});

interface ModerationWorkInput {
  moderatorId: string;
  incidentId: string;
  decision: "approve" | "reject";
  moderationNote: string | null;
}

const runModerationWork = async (
  _ctx: AttemptContext,
  data: ModerationWorkInput,
): Promise<AttemptOutcome<{ id: string; newStatus: string }>> => {
  const admin = createAdminClient();
  const newStatus: "published" | "rejected" =
    data.decision === "approve" ? "published" : "rejected";
  const { error } = await admin
    .from("incidents")
    .update({
      status: newStatus,
      moderator_id: data.moderatorId,
      moderated_at: new Date().toISOString(),
      moderation_note: data.moderationNote,
      published_at: newStatus === "published" ? new Date().toISOString() : null,
    } as Database["public"]["Tables"]["incidents"]["Update"])
    .eq("id", data.incidentId);
  if (error) {
    return { kind: "retryable", error: error.message };
  }

  if (newStatus === "published") {
    try {
      const { data: incident } = await admin
        .from("incidents")
        .select("id, title, title_masked, ai_provider_id, is_expert, user_id")
        .eq("id", data.incidentId)
        .maybeSingle();

      if (incident && incident.user_id) {
        const userId = incident.user_id;
        const { data: existingBadges } = await admin
          .from("user_badges")
          .select("id")
          .eq("user_id", userId)
          .eq("badge_name", "Founding Reporter")
          .maybeSingle();

        if (!existingBadges) {
          await admin.from("user_badges").insert({
            user_id: userId,
            badge_name: "Founding Reporter",
            badge_icon: "🏅",
            description: "Awarded for submitting an early verified incident.",
          });

          const { data: userRecord } = await admin
            .from("users")
            .select("badges")
            .eq("id", userId)
            .maybeSingle();

          if (userRecord) {
            const currentBadges: string[] = userRecord.badges ?? [];
            if (!currentBadges.includes("Founding Reporter")) {
              currentBadges.push("Founding Reporter");
              await admin.from("users").update({ badges: currentBadges }).eq("id", userId);
            }
          }
        }
      }

      if (incident && incident.ai_provider_id) {
        const { data: provider } = await admin
          .from("ai_providers")
          .select("name, contact_email")
          .eq("id", incident.ai_provider_id)
          .maybeSingle();

        if (provider && provider.contact_email) {
          const token = generateProviderToken(incident.id, provider.contact_email);
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://alparai.com";
          const respondLink = `${appUrl}/en/incidents/${incident.id}/respond?token=${token}`;

          const resend = getResendClient();
          if (resend) {
            await resend.emails.send({
              from: "ALPAR AI <noreply@alparai.com>",
              to: provider.contact_email,
              subject: `[ALPAR AI] Verification Request: Incident involving ${provider.name}`,
              text: `Hello ${provider.name} Team,

A new incident involving your AI system has been documented and verified by the ALPAR AI community:

"${incident.title_masked || incident.title}"

Under the "Providers must respond" policy, you are invited to submit an official statement or counter-statement. Your response will be pinned to the top of the incident page and visible to all users.

To submit your official response, please use the secure link below:
${respondLink}

Note: This link is unique and secure. Do not share it.

Thank you,
ALPAR AI Accountability Team
https://alparai.com`,
            });
            logger.info("Sent provider notification email via Resend", {
              incidentId: incident.id,
              providerEmail: provider.contact_email,
            });
          } else {
            logger.info("Provider email notification simulated (no RESEND_API_KEY)", {
              incidentId: incident.id,
              providerName: provider.name,
              providerEmail: provider.contact_email,
              respondLink,
            });
          }
        }
      }

      if (incident && incident.is_expert && incident.user_id) {
        try {
          const { data: reporterUser } = await admin
            .from("users")
            .select("email, locale, full_name")
            .eq("id", incident.user_id)
            .maybeSingle();

          if (reporterUser && reporterUser.email) {
            const { data: prefs } = await admin
              .from("email_preferences")
              .select("reporter_notifications")
              .eq("user_id", incident.user_id)
              .maybeSingle();

            const notificationsEnabled = prefs ? prefs.reporter_notifications : true;

            if (notificationsEnabled) {
              const rlCheck = await checkRateLimit(
                `ratelimit:email_notification:${incident.user_id}`,
              );
              if (rlCheck.ok) {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://alparai.com";
                const unsubToken = generateEmailUnsubscribeToken(reporterUser.email);
                const unsubscribeUrl = `${appUrl}/api/unsubscribe?email=${encodeURIComponent(reporterUser.email)}&token=${unsubToken}`;
                const emailHtml = getExpertVerificationEmail({
                  title: incident.title_masked || incident.title || "Incident",
                  expertName: reporterUser.full_name || "ALPAR AI Expert",
                  actionUrl: `${appUrl}/${reporterUser.locale || "en"}/incidents/${incident.id}`,
                  locale: reporterUser.locale || "en",
                  unsubscribeUrl,
                });

                const resend = getResendClient();
                if (resend) {
                  await resend.emails.send({
                    from: "ALPAR AI <noreply@alparai.com>",
                    to: reporterUser.email,
                    subject:
                      reporterUser.locale === "tr"
                        ? "[ALPAR AI] Uzman Doğrulaması Başarılı"
                        : "[ALPAR AI] Expert Verification Successful",
                    html: emailHtml,
                  });
                  logger.info("Sent expert verification email to reporter via Resend", {
                    incidentId: incident.id,
                    reporterEmail: reporterUser.email,
                  });
                }
              }
            }
          }
        } catch (emailErr) {
          logger.error(
            "Failed to send expert verification email to reporter",
            { incidentId: data.incidentId },
            emailErr instanceof Error ? emailErr : undefined,
          );
        }
      }
    } catch (emailErr) {
      logger.error(
        "Failed to send provider notification email",
        { incidentId: data.incidentId },
        emailErr instanceof Error ? emailErr : undefined,
      );
    }
  }

  return { kind: "success", value: { id: data.incidentId, newStatus } };
};

export async function moderateIncident(
  input: z.infer<typeof moderateSchema>,
): Promise<ModerationResult> {
  const mod = await requireModerator();
  if (!mod) return { ok: false, error: "Forbidden" };
  const parsed = moderateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const result = await withAutopilot<{ id: string; newStatus: string }>(
    moderateIncidentPolicy,
    [parsed.data.incidentId, mod.id, parsed.data.decision],
    (ctx) =>
      runModerationWork(ctx, {
        moderatorId: mod.id,
        incidentId: parsed.data.incidentId,
        decision: parsed.data.decision,
        moderationNote: parsed.data.moderationNote ?? null,
      }),
    { context: { userId: mod.id, ipHash: null, clientIdempotencyKey: null } },
  );

  if (result.kind === "ok" || result.kind === "replayed") {
    revalidatePath("/admin");
    revalidatePath(`/incidents/${parsed.data.incidentId}`);
    return {
      ok: true,
      autopilot: {
        attempts: attemptsOf(result),
        durationMs: durationOf(result),
        kind: result.kind,
      },
    };
  }
  return {
    ok: false,
    error: "Failed to update",
    autopilot: {
      attempts: attemptsOf(result),
      durationMs: durationOf(result),
      kind: result.kind,
    },
  };
}

export async function bulkApproveIncidents(
  ids: string[],
): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Forbidden" };

  const db = createAdminClient();

  const { error } = await db
    .from("incidents")
    .update({
      status: "published",
      moderator_id: admin.id,
      moderated_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
    })
    .in("id", ids);

  if (error) return { ok: false, error: error.message };

  await db.from("audit_log").insert({
    actor_id: admin.id,
    action: "incident.bulk_approve",
    entity_type: "incident",
    entity_id: ids.join(","),
    after_data: { count: ids.length },
  });

  revalidatePath("/[locale]/admin/import", "layout");
  revalidatePath("/[locale]/incidents", "layout");
  return { ok: true };
}

export async function bulkRejectIncidents(ids: string[]): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Forbidden" };

  const db = createAdminClient();

  const { error } = await db
    .from("incidents")
    .update({
      status: "rejected",
      moderator_id: admin.id,
      moderated_at: new Date().toISOString(),
    })
    .in("id", ids);

  if (error) return { ok: false, error: error.message };

  await db.from("audit_log").insert({
    actor_id: admin.id,
    action: "incident.bulk_reject",
    entity_type: "incident",
    entity_id: ids.join(","),
    after_data: { count: ids.length },
  });

  revalidatePath("/[locale]/admin/import", "layout");
  return { ok: true };
}

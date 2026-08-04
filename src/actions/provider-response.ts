"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { consumeProviderTokenDb } from "@/lib/utils/provider-token";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";
import { getResendClient } from "@/lib/email/resend";
import { getProviderResponseNotificationEmail } from "@/emails/templates";
import { generateEmailUnsubscribeToken } from "@/lib/utils/unsubscribe";
import { isEmailAllowed } from "@/lib/email/cap";
import { logger } from "@/lib/utils/logger";
import { maskPII } from "@/lib/pii/guardian";

const responseInputSchema = z.object({
  incidentId: z.string().uuid(),
  token: z.string().length(64),
  responseText: z.string().min(10).max(10000),
  responderName: z.string().min(2).max(100),
  responderRole: z.string().max(100).nullable().optional(),
});

export interface ProviderResponseResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function submitProviderResponse(
  _prevState: unknown,
  formData: FormData,
): Promise<ProviderResponseResult> {
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    const raw = {
      incidentId: String(formData.get("incidentId") ?? ""),
      token: String(formData.get("token") ?? ""),
      responseText: String(formData.get("responseText") ?? ""),
      responderName: String(formData.get("responderName") ?? ""),
      responderRole: formData.get("responderRole") ? String(formData.get("responderRole")) : null,
    };

    const parsed = responseInputSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const { incidentId, token, responseText, responderName, responderRole } = parsed.data;

    // Rate limit check
    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.provider_response}:${ip}`);
    if (!rl.ok) {
      return { ok: false, error: `Too many submissions. Try again in ${rl.retryAfter}s.` };
    }

    const admin = createAdminClient();

    // 1. Fetch incident
    const { data: incident, error: incidentErr } = await admin
      .from("incidents")
      .select("id, title, title_masked, ai_provider_id, status, user_id")
      .eq("id", incidentId)
      .maybeSingle();

    if (incidentErr || !incident) {
      return { ok: false, error: "incident_not_found" };
    }

    const providerId = (incident as { ai_provider_id: string | null }).ai_provider_id;
    if (!providerId) {
      return { ok: false, error: "provider_not_associated" };
    }

    // 2. Fetch provider
    const { data: provider, error: providerErr } = await admin
      .from("ai_providers")
      .select("id, name, contact_email")
      .eq("id", providerId)
      .maybeSingle();

    if (providerErr || !provider) {
      return { ok: false, error: "provider_not_found" };
    }

    const contactEmail = (provider as { contact_email: string | null }).contact_email;
    if (!contactEmail) {
      return { ok: false, error: "provider_no_contact_email" };
    }

    // 3. Verify and consume token
    if (!(await consumeProviderTokenDb(incidentId, contactEmail, token))) {
      return { ok: false, error: "invalid_token" };
    }

    // 4. Save response (upsert style)
    const { data: existingResponse } = await admin
      .from("ai_provider_responses")
      .select("id")
      .eq("incident_id", incidentId)
      .maybeSingle();

    if (existingResponse) {
      const { error: updateErr } = await admin
        .from("ai_provider_responses")
        .update({
          response_text: maskPII(responseText).masked,
          responder_name: maskPII(responderName).masked,
          responder_role: responderRole ? maskPII(responderRole).masked : null,
          responder_email: contactEmail,
          is_official: true,
          is_published: true,
          published_at: new Date().toISOString(),
        })
        .eq("id", existingResponse.id);

      if (updateErr) {
        return { ok: false, error: updateErr.message };
      }
    } else {
      const { error: insertErr } = await admin.from("ai_provider_responses").insert({
        incident_id: incidentId,
        ai_provider_id: provider.id,
        response_text: maskPII(responseText).masked,
        responder_name: maskPII(responderName).masked,
        responder_role: responderRole ? maskPII(responderRole).masked : null,
        responder_email: contactEmail,
        is_official: true,
        is_published: true,
        published_at: new Date().toISOString(),
      });

      if (insertErr) {
        return { ok: false, error: insertErr.message };
      }
    }

    // Send email notification to original reporter if applicable
    if (incident.user_id) {
      try {
        const { data: reporterUser } = await admin
          .from("users")
          .select("email, locale")
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
              const resend = getResendClient();
              if (resend) {
                const allowed = await isEmailAllowed(reporterUser.email, "provider_response");
                if (allowed) {
                  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://alparai.com";
                  const unsubToken = generateEmailUnsubscribeToken(reporterUser.email);
                  const unsubscribeUrl = `${appUrl}/api/unsubscribe?email=${encodeURIComponent(reporterUser.email)}&token=${unsubToken}`;
                  const emailHtml = getProviderResponseNotificationEmail({
                    title: incident.title_masked || incident.title || "Incident",
                    providerName: provider.name,
                    actionUrl: `${appUrl}/${reporterUser.locale || "en"}/incidents/${incidentId}`,
                    locale: reporterUser.locale || "en",
                    unsubscribeUrl,
                  });

                  await resend.emails.send({
                    from: "ALPAR AI <noreply@alparai.com>",
                    to: reporterUser.email,
                    subject:
                      reporterUser.locale === "tr"
                        ? `[ALPAR AI] Resmi Yanıt Alındı: ${provider.name}`
                        : `[ALPAR AI] Official Response Received: ${provider.name}`,
                    html: emailHtml,
                  });
                }
              }
            }
          }
        }
      } catch (emailErr) {
        logger.error(
          "[submitProviderResponse] Failed to send email to reporter",
          undefined,
          emailErr instanceof Error ? emailErr : undefined,
        );
      }
    }

    revalidatePath(`/incidents/${incidentId}`);
    return { ok: true };
  } catch (e) {
    logger.error(
      "[submitProviderResponse] Unhandled exception",
      undefined,
      e instanceof Error ? e : undefined,
    );
    return { ok: false, error: "An unexpected error occurred. Please try again." };
  }
}

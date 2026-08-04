import { generateEmailUnsubscribeToken } from "@/lib/utils/unsubscribe";
import { logger } from "@/lib/utils/logger";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Resend } from "resend";

export const DAILY_OUTREACH_LIMIT = 50;

export interface OutreachItem {
  id: string;
  recipient_email: string;
  recipient_name: string | null;
  template_type: "media" | "expert";
  subject: string;
  body_template: string;
  status: "pending" | "approved" | "sent" | "failed";
  sent_at: string | null;
  created_at: string;
}

export async function processOutreachQueue(
  supabase: SupabaseClient,
  resend: Resend,
): Promise<{ sent: number; failed: number; skipped: boolean }> {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: sentCount, error: countError } = await supabase
      .from("outreach_queue")
      .select("id")
      .eq("status", "sent")
      .gte("sent_at", oneDayAgo.toISOString());

    if (countError) {
      logger.error("Failed to query daily outreach count", undefined, countError);
      throw countError;
    }

    const currentSent = sentCount?.length ?? 0;
    if (currentSent >= DAILY_OUTREACH_LIMIT) {
      logger.warn(`Daily outreach limit of ${DAILY_OUTREACH_LIMIT} reached. Skipping run.`);
      return { sent: 0, failed: 0, skipped: true };
    }

    const remainingQuota = DAILY_OUTREACH_LIMIT - currentSent;

    const { data: pending, error: fetchError } = await supabase
      .from("outreach_queue")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: true })
      .limit(remainingQuota);

    if (fetchError) {
      logger.error("Failed to fetch pending outreach items", undefined, fetchError);
      throw fetchError;
    }

    let sent = 0;
    let failed = 0;

    for (const item of (pending ?? []) as OutreachItem[]) {
      try {
        const token = generateEmailUnsubscribeToken(item.recipient_email);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://alparai.com";
        const unsubscribeLink = `${appUrl}/api/v1/unsubscribe?email=${encodeURIComponent(item.recipient_email)}&token=${token}`;

        const footer = `\n\n---\nTo unsubscribe from ALPAR AI communication, click here: ${unsubscribeLink}`;
        const emailBody = item.body_template + footer;

        const { error: sendError } = await resend.emails.send({
          from: "Ercüment Erden <ercument.erden@alparai.com>",
          to: item.recipient_email,
          subject: item.subject,
          text: emailBody,
        });

        if (sendError) {
          logger.error(
            `Failed to send outreach email to ${item.recipient_email}`,
            undefined,
            sendError,
          );
          await supabase.from("outreach_queue").update({ status: "failed" }).eq("id", item.id);
          failed++;
        } else {
          await supabase
            .from("outreach_queue")
            .update({ status: "sent", sent_at: new Date().toISOString() })
            .eq("id", item.id);
          sent++;
        }
      } catch (err: unknown) {
        logger.error(
          `Error processing outreach item ${item.id}`,
          undefined,
          err instanceof Error ? err : undefined,
        );
        await supabase.from("outreach_queue").update({ status: "failed" }).eq("id", item.id);
        failed++;
      }
    }

    return { sent, failed, skipped: false };
  } catch (err: unknown) {
    logger.error("Outreach agent run failed", undefined, err instanceof Error ? err : undefined);
    throw err;
  }
}

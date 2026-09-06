import "server-only";
import { logger } from "@/lib/utils/logger";
import { getResendClient } from "@/lib/email/resend";
import { isEmailAllowed } from "@/lib/email/cap";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  emailType?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  provider: "zoho_smtp" | "resend" | "sandbox";
  error?: string;
}

/**
 * Unified Mailer Service
 * Prioritizes Zoho SMTP (smtppro.zoho.eu:465) for full DKIM/SPF sovereign delivery.
 * Falls back to Resend or Sandbox mode if credentials are not configured.
 */
export async function sendUnifiedEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const { to, subject, html, text, from, emailType = "transactional" } = options;

  const recipientStr = Array.isArray(to) ? to[0] : to;
  if (!recipientStr) {
    return { success: false, provider: "sandbox", error: "recipient_missing" };
  }

  // Rate limit check
  const allowed = await isEmailAllowed(recipientStr, emailType);
  if (!allowed) {
    logger.warn(`[UnifiedMailer] Email blocked by rate-limit cap for ${recipientStr}`);
    return { success: false, provider: "sandbox", error: "rate_limit_exceeded" };
  }

  const defaultFrom = from || "ALPAR AI <ercument.erden@alparai.com>";

  // 1. Check for Zoho SMTP credentials
  const zohoPass = process.env.ZOHO_APP_PASSWORD;
  const zohoUser = process.env.ZOHO_MAIL_USER || "ercument.erden@alparai.com";

  if (zohoPass) {
    try {
      // @ts-expect-error nodemailer types optional
      const nodemailer = (await import("nodemailer")).default;
      const transporter = nodemailer.createTransport({
        host: process.env.ZOHO_SMTP_HOST || "smtppro.zoho.eu",
        port: Number(process.env.ZOHO_SMTP_PORT || 465),
        secure: true,
        auth: {
          user: zohoUser,
          pass: zohoPass,
        },
      });

      const info = await transporter.sendMail({
        from: defaultFrom,
        to,
        subject,
        text,
        html,
      });

      logger.info(`[UnifiedMailer] Sent via Zoho SMTP to ${recipientStr}: ${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId,
        provider: "zoho_smtp",
      };
    } catch (err) {
      logger.error("[UnifiedMailer] Zoho SMTP send failed, trying fallback", undefined, err instanceof Error ? err : undefined);
    }
  }

  // 2. Fallback to Resend
  const resend = getResendClient();
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: defaultFrom,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: html || text || "",
        text,
      });

      if (error) {
        logger.error("[UnifiedMailer] Resend API error", undefined, new Error(error.message));
        return { success: false, provider: "resend", error: error.message };
      }

      logger.info(`[UnifiedMailer] Sent via Resend to ${recipientStr}: ${data?.id}`);
      return {
        success: true,
        messageId: data?.id,
        provider: "resend",
      };
    } catch (err) {
      logger.error("[UnifiedMailer] Resend exception", undefined, err instanceof Error ? err : undefined);
    }
  }

  // 3. Fallback to Safe Sandbox Logger
  logger.info(`[UnifiedMailer Sandbox] Simulated email to ${recipientStr}: "${subject}"`);
  return {
    success: true,
    messageId: `sandbox_${Date.now()}`,
    provider: "sandbox",
  };
}

"use server";

import { APP_EMAIL, APP_URL } from "@/lib/constants";
import { getResendClient } from "@/lib/email/resend";
import { headers } from "next/headers";
import { withAutopilot, attemptsOf, durationOf } from "@/lib/autopilot";
import type { AttemptContext, AttemptOutcome } from "@/lib/autopilot";
import { submitInvestorPolicy } from "@/lib/autopilot/policies";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { hashIp } from "@/lib/utils/hash";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { investorApplicationSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/utils/logger";

export interface InvestorState {
  ok: boolean;
  error?: string;
  formError?: string;
  fieldErrors?: Record<string, string[]>;
  autopilot?: { attempts: number; durationMs: number; kind: string };
  fullName?: string;
  email?: string;
}

interface InvestorWorkInput {
  fullName: string;
  title: string;
  company: string;
  linkedinUrl: string;
  email: string;
  checkSize: string;
  whyInterested?: string | null;
  ip: string;
  userAgent: string;
}

const runInvestorWork = async (
  _ctx: AttemptContext,
  data: InvestorWorkInput,
): Promise<AttemptOutcome<{ sent: boolean; channel: "email" | "log" }>> => {
  try {
    const admin = createAdminClient();
    const { error: dbError } = await admin.from("investor_applications").insert({
      full_name: data.fullName,
      title: data.title,
      company: data.company,
      linkedin_url: data.linkedinUrl,
      email: data.email,
      check_size: data.checkSize,
      why_interested: data.whyInterested || null,
      status: "pending",
    });
    if (dbError) {
      logger.error(
        "[submitInvestor] Database insert failed",
        undefined,
        dbError instanceof Error ? dbError : undefined,
      );
      return { kind: "retryable", error: dbError.message };
    }
  } catch (dbEx) {
    logger.error(
      "[submitInvestor] Database exception",
      undefined,
      dbEx instanceof Error ? dbEx : undefined,
    );
    return { kind: "retryable", error: dbEx instanceof Error ? dbEx.message : "db_error" };
  }

  const resend = getResendClient();
  if (!resend) {
    logger.info(
      `[Resend Sandbox Log] Admin notification:\nNew Investor Application: ${data.fullName} from ${data.company}\nCheck size: ${data.checkSize}\nLinkedIn: ${data.linkedinUrl}\nEmail: ${data.email}`,
    );
    logger.info(`[Resend Sandbox Log] Applicant confirmation sent to: ${data.email}`);
    return { kind: "success", value: { sent: true, channel: "log" } };
  }

  try {
    // 1. Send Admin Notification Email
    await resend.emails.send({
      from: `ALPAR AI Investor Relations <${APP_EMAIL}>`,
      to: APP_EMAIL,
      subject: `New Investor Application — ${data.fullName} from ${data.company}`,
      text: `Name: ${data.fullName}\nTitle: ${data.title}\nCompany: ${data.company}\nLinkedIn: ${data.linkedinUrl}\nEmail: ${data.email}\nCheck Size: ${data.checkSize}\nWhy Interested: ${data.whyInterested || "N/A"}\n\nReview in Admin Panel: ${APP_URL}/admin/investors`,
      html: `
        <h2>New Investor Application</h2>
        <p><strong>Name:</strong> ${data.fullName}</p>
        <p><strong>Title:</strong> ${data.title}</p>
        <p><strong>Company:</strong> ${data.company}</p>
        <p><strong>LinkedIn:</strong> <a href="${data.linkedinUrl}" target="_blank" rel="noopener noreferrer">${data.linkedinUrl}</a></p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Check Size:</strong> ${data.checkSize}</p>
        <p><strong>Why Interested:</strong> ${data.whyInterested || "N/A"}</p>
        <hr />
        <p><a href="${APP_URL}/admin/investors">Review in Admin Panel →</a></p>
      `,
    });

    // 2. Send Applicant Confirmation Email
    await resend.emails.send({
      from: `Ercüment Erden <${APP_EMAIL}>`,
      to: data.email,
      subject: "ALPAR AI — We received your application",
      text: `Thank you ${data.fullName},\n\nWe've received your investor access application. Our team will review your information and respond within 48 hours.\n\nIn the meantime, you can explore our live platform at alparai.com.\n\nBest,\nErcüment Erden\nFounder, ALPAR AI`,
      html: `
        <p>Thank you ${data.fullName},</p>
        <p>We've received your investor access application. Our team will review your information and respond within 48 hours.</p>
        <p>In the meantime, you can explore our live platform at <a href="https://alparai.com">alparai.com</a>.</p>
        <p>Best,<br /><strong>Ercüment Erden</strong><br />Founder, ALPAR AI</p>
      `,
    });

    return { kind: "success", value: { sent: true, channel: "email" } };
  } catch (e) {
    logger.error(
      "[submitInvestor] Resend API error",
      undefined,
      e instanceof Error ? e : undefined,
    );
    return {
      kind: "retryable",
      error: e instanceof Error ? e.message : "resend_failed",
    };
  }
};

export async function submitInvestor(
  _prev: InvestorState,
  formData: FormData,
): Promise<InvestorState> {
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const userAgent = hdrs.get("user-agent") ?? "unknown";

    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.investor_application}:${ip}`);
    if (!rl.ok) {
      return { ok: false, formError: `Too many submissions. Try again in ${rl.retryAfter}s.` };
    }

    const raw = {
      fullName: String(formData.get("fullName") ?? ""),
      title: String(formData.get("title") ?? ""),
      company: String(formData.get("company") ?? ""),
      linkedinUrl: String(formData.get("linkedinUrl") ?? ""),
      email: String(formData.get("email") ?? ""),
      checkSize: String(formData.get("checkSize") ?? ""),
      whyInterested: formData.get("whyInterested") ? String(formData.get("whyInterested")) : null,
    };

    const parsed = investorApplicationSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const clientIdempotencyKey = hdrs.get("x-idempotency-key");

    const result = await withAutopilot<{ sent: boolean; channel: "email" | "log" }>(
      submitInvestorPolicy,
      [
        parsed.data.fullName,
        parsed.data.title,
        parsed.data.company,
        parsed.data.linkedinUrl,
        parsed.data.email,
        parsed.data.checkSize,
        parsed.data.whyInterested || "",
      ],
      (ctx) =>
        runInvestorWork(ctx, {
          fullName: parsed.data.fullName,
          title: parsed.data.title,
          company: parsed.data.company,
          linkedinUrl: parsed.data.linkedinUrl,
          email: parsed.data.email,
          checkSize: parsed.data.checkSize,
          whyInterested: parsed.data.whyInterested,
          ip,
          userAgent,
        }),
      {
        context: {
          userId: null,
          ipHash: hashIp(ip),
          clientIdempotencyKey,
        },
      },
    );

    if (result.kind === "ok" || result.kind === "replayed") {
      return {
        ok: true,
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        autopilot: {
          attempts: attemptsOf(result),
          durationMs: durationOf(result),
          kind: result.kind,
        },
      };
    }
    if (result.kind === "circuit_open") {
      return { ok: false, formError: "Service temporarily unavailable. Please try again later." };
    }
    if (result.kind === "budget_exceeded") {
      return { ok: false, formError: "Request timed out. Please try again shortly." };
    }
    if (result.kind === "exhausted") {
      return { ok: false, formError: "Failed to send. Please try again later." };
    }
    return { ok: false, formError: "Unexpected error occurred." };
  } catch (e) {
    logger.error(
      "[submitInvestor] Unhandled exception",
      undefined,
      e instanceof Error ? e : undefined,
    );
    return { ok: false, formError: "An unexpected error occurred. Please try again." };
  }
}

// ----------------------------------------------------
// Admin Actions
// ----------------------------------------------------

export async function approveInvestor(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
  } catch (_authEx) {
    return { ok: false, error: "Unauthorized" };
  }

  const rawToken = crypto.randomUUID();
  const hash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const admin = createAdminClient();
  const { data: appData, error: fetchError } = await admin
    .from("investor_applications")
    .select("full_name, email")
    .eq("id", id)
    .single();

  if (fetchError || !appData) {
    return { ok: false, error: "Application not found" };
  }

  const { error: updateError } = await admin
    .from("investor_applications")
    .update({
      status: "approved",
      access_token_hash: hash,
      approved_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  // Send Email with token
  const resend = getResendClient();
  const link = `${APP_URL}/investor-portal?token=${rawToken}`;

  if (!resend) {
    logger.info(
      `[Resend Sandbox Log] Gated portal link for ${appData.full_name} (${appData.email}):\n${link}`,
    );
  } else {
    try {
      await resend.emails.send({
        from: `Ercüment Erden <${APP_EMAIL}>`,
        to: appData.email,
        subject: "You have investor access to ALPAR AI",
        text: `Hello ${appData.full_name},\n\nThank you for your interest in ALPAR AI. We've reviewed your application and are pleased to grant you access to our investor portal.\n\nAccess your private investor portal:\n${link}\n\nThis link is unique to you and should not be shared. It expires in 30 days. If you need renewed access, simply contact us.\n\nWe look forward to speaking with you.\n\nBest,\nErcüment Erden\nFounder, ALPAR AI\nhello@alparai.com`,
        html: `
          <p>Hello ${appData.full_name},</p>
          <p>Thank you for your interest in ALPAR AI. We've reviewed your application and are pleased to grant you access to our investor portal.</p>
          <p><strong>Access your private investor portal:</strong><br />
          <a href="${link}" style="background-color: #00FF88; color: #0A1622; font-weight: bold; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0;">Access Investor Portal →</a></p>
          <p style="font-size: 13px; color: #666;">This link is unique to you and should not be shared. It expires in 30 days. If you need renewed access, simply contact us.</p>
          <br />
          <p>We look forward to speaking with you.</p>
          <p>Best,<br /><strong>Ercüment Erden</strong><br />Founder, ALPAR AI<br />hello@alparai.com</p>
        `,
      });
    } catch (e) {
      logger.error(
        "[approveInvestor] Email sending failed",
        undefined,
        e instanceof Error ? e : undefined,
      );
      return { ok: true, error: "Approved successfully but failed to send email" };
    }
  }

  revalidatePath("/[locale]/admin/investors", "page");
  return { ok: true };
}

export async function rejectInvestor(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
  } catch (_authEx) {
    return { ok: false, error: "Unauthorized" };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("investor_applications")
    .update({
      status: "rejected",
    })
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/[locale]/admin/investors", "page");
  return { ok: true };
}

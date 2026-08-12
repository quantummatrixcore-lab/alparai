"use server";

import { contactFormSchema } from "@/lib/validation/schemas";
import { APP_EMAIL } from "@/lib/constants";
import { getResendClient } from "@/lib/email/resend";
import { headers } from "next/headers";
import { withAutopilot, submitContactPolicy, attemptsOf, durationOf } from "@/lib/autopilot";
import type { AttemptContext, AttemptOutcome } from "@/lib/autopilot";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { hashIp } from "@/lib/utils/hash";
import { logger } from "@/lib/utils/logger";

import { maskPII } from "@/lib/pii/guardian";

export interface ContactState {
  ok: boolean;
  error?: string;
  formError?: string;
  fieldErrors?: Record<string, string[]>;
  autopilot?: { attempts: number; durationMs: number; kind: string };
}

interface ContactWorkInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  ip: string;
  userAgent: string;
}

const runContactWork = async (
  _ctx: AttemptContext,
  data: ContactWorkInput,
): Promise<AttemptOutcome<{ sent: boolean; channel: "email" | "log" }>> => {
  const resend = getResendClient();
  if (!resend) {
    return { kind: "success", value: { sent: true, channel: "log" } };
  }
  try {
    await resend.emails.send({
      from: "ALPAR AI Contact <contact@alparai.com>",
      to: APP_EMAIL,
      replyTo: data.email,
      subject: `[${data.category}] ${maskPII(data.subject)}`,
      text: `From: ${data.name} <${data.email}>\n\n${maskPII(data.message)}\n\n--\nIP Hash: ${hashIp(data.ip)}`,
    });
    return { kind: "success", value: { sent: true, channel: "email" } };
  } catch (e) {
    return {
      kind: "retryable",
      error: e instanceof Error ? e.message : "resend_failed",
    };
  }
};

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const userAgent = hdrs.get("user-agent") ?? "unknown";

    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.contact_submission}:${ip}`);
    if (!rl.ok) {
      return { ok: false, formError: `Too many submissions. Try again in ${rl.retryAfter}s.` };
    }

    const raw = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
      category: String(formData.get("category") ?? "general"),
    };
    const parsed = contactFormSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }
    const clientIdempotencyKey = hdrs.get("x-idempotency-key");

    const result = await withAutopilot<{ sent: boolean; channel: "email" | "log" }>(
      submitContactPolicy,
      [parsed.data.email, parsed.data.subject, parsed.data.message, parsed.data.category],
      (ctx) =>
        runContactWork(ctx, {
          name: parsed.data.name,
          email: parsed.data.email,
          subject: parsed.data.subject,
          message: parsed.data.message,
          category: parsed.data.category,
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
        autopilot: {
          attempts: attemptsOf(result),
          durationMs: durationOf(result),
          kind: result.kind,
        },
      };
    }
    if (result.kind === "circuit_open") {
      return { ok: false, formError: "Service temporarily unavailable. Please email us directly." };
    }
    if (result.kind === "budget_exceeded") {
      return { ok: false, formError: "Request timed out. Please try again shortly." };
    }
    if (result.kind === "exhausted") {
      return { ok: false, formError: "Failed to send. Please email us directly." };
    }
    return { ok: false, formError: "Unexpected error." };
  } catch (e) {
    logger.error(
      "[submitContact] Unhandled exception",
      undefined,
      e instanceof Error ? e : undefined,
    );
    return { ok: false, formError: "An unexpected error occurred. Please try again." };
  }
}

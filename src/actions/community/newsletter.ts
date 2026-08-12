"use server";

import { newsletterSubscriptionSchema } from "@/lib/validation/schemas";
import { headers } from "next/headers";
import { withAutopilot, subscribeNewsletterPolicy, attemptsOf, durationOf } from "@/lib/autopilot";
import type { AttemptContext, AttemptOutcome } from "@/lib/autopilot";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { hashIp } from "@/lib/utils/hash";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";

export interface NewsletterState {
  ok: boolean;
  error?: string;
  formError?: string;
  fieldErrors?: Record<string, string[]>;
  autopilot?: { attempts: number; durationMs: number; kind: string };
}

interface NewsletterWorkInput {
  email: string;
  locale: string;
}

const runNewsletterWork = async (
  _ctx: AttemptContext,
  data: NewsletterWorkInput,
): Promise<AttemptOutcome<{ subscribed: boolean }>> => {
  const supabase = createAdminClient();
  try {
    // Check if already subscribed
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", data.email)
      .maybeSingle();

    if (existing) {
      return { kind: "success", value: { subscribed: true } };
    }

    // Insert new subscription
    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: data.email,
      locale: data.locale,
      confirmed: true,
    });

    if (error) {
      return { kind: "retryable", error: error.message };
    }

    return { kind: "success", value: { subscribed: true } };
  } catch (e) {
    return {
      kind: "retryable",
      error: e instanceof Error ? e.message : "newsletter_failed",
    };
  }
};

export async function subscribeNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.contact_submission}:${ip}`);
    if (!rl.ok) {
      return { ok: false, formError: `Too many requests. Try again in ${rl.retryAfter}s.` };
    }

    const raw = {
      email: String(formData.get("email") ?? ""),
      locale: String(formData.get("locale") ?? "en"),
    };

    const parsed = newsletterSubscriptionSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const clientIdempotencyKey = hdrs.get("x-idempotency-key");

    const result = await withAutopilot<{ subscribed: boolean }>(
      subscribeNewsletterPolicy,
      [parsed.data.email, parsed.data.locale],
      (ctx) =>
        runNewsletterWork(ctx, {
          email: parsed.data.email,
          locale: parsed.data.locale,
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
      return { ok: false, formError: "Service temporarily unavailable. Please try again later." };
    }
    if (result.kind === "budget_exceeded") {
      return { ok: false, formError: "Request timed out. Please try again." };
    }
    if (result.kind === "exhausted") {
      return { ok: false, formError: "Failed to subscribe. Please try again." };
    }
    return { ok: false, formError: "Unexpected error." };
  } catch (e) {
    logger.error(
      "[subscribeNewsletter] Unhandled exception",
      undefined,
      e instanceof Error ? e : undefined,
    );
    return { ok: false, formError: "An unexpected error occurred. Please try again." };
  }
}

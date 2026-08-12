"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";
import {
  withAutopilot,
  submitWhistleblowerPolicy,
  type AttemptOutcome,
  type AttemptContext,
} from "@/lib/autopilot";

import { maskPII } from "@/lib/pii/guardian";

export interface SubmitWhistleblowerResult {
  ok: boolean;
  error?: string;
  submissionId?: string;
}

interface SubmitWhistleblowerInput {
  encryptedContent: string;
  category: string;
  providerHint: string | null;
}

async function runSubmitWhistleblowerWork(
  ctx: AttemptContext,
  data: SubmitWhistleblowerInput,
): Promise<AttemptOutcome<{ id: string }>> {
  void ctx;
  const admin = createAdminClient();

  const { error, data: inserted } = await admin
    .from("whistleblower_submissions")
    .insert({
      encrypted_content: data.encryptedContent,
      category: data.category,
      provider_hint: data.providerHint ? maskPII(data.providerHint).masked : null,
      status: "pending",
    })
    .select("id")
    .maybeSingle();

  if (error) {
    logger.error("Failed to insert whistleblower submission", { error: error.message });
    return { kind: "retryable", error: error.message };
  }

  return { kind: "success", value: { id: inserted?.id ?? "" } };
}

export async function submitWhistleblowerAction(
  data: SubmitWhistleblowerInput,
): Promise<SubmitWhistleblowerResult> {
  try {
    if (!data.encryptedContent || !data.category) {
      return { ok: false, error: "Missing required fields" };
    }

    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rlKey = `${RATE_LIMIT_KEYS.whistleblower_submission}:${ip}`;
    const rl = await checkRateLimit(rlKey);
    if (!rl.ok) {
      return { ok: false, error: `Too many submissions. Try again in ${rl.retryAfter}s.` };
    }

    const timestamp = new Date().toISOString().slice(0, 16); // Minute-level idempotency
    const idempotencyKey = `whistleblower:${ip}:${timestamp}`;

    const result = await withAutopilot<{ id: string }>(
      submitWhistleblowerPolicy,
      [idempotencyKey, data.category],
      (ctx) => runSubmitWhistleblowerWork(ctx, data),
      { context: { userId: null, ipHash: null, clientIdempotencyKey: idempotencyKey } },
    );

    if (result.kind === "ok") {
      try {
        revalidatePath("/admin");
      } catch (e) {
        console.error("Ignored error:", e);
      }
      return { ok: true, submissionId: result.value.id };
    }

    if (result.kind === "replayed") {
      return { ok: true };
    }

    return { ok: false, error: "Submission failed" };
  } catch (e) {
    logger.error(
      "[submitWhistleblowerAction] Unhandled exception",
      undefined,
      e instanceof Error ? e : undefined,
    );
    return { ok: false, error: "An unexpected error occurred. Please try again." };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { headers } from "next/headers";
import { APP_TAKEDOWN_EMAIL } from "@/lib/constants";
import { withAutopilot, submitTakedownPolicy, attemptsOf, durationOf } from "@/lib/autopilot";
import type { AttemptContext, AttemptOutcome } from "@/lib/autopilot";
import { hashIp } from "@/lib/utils/hash";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import type { Database } from "@/types/database";
import { logger } from "@/lib/utils/logger";
import { calculateSlaDueDate } from "@/lib/moderation/sla";

export interface TakedownResult {
  ok: boolean;
  error?: string;
  message?: string;
  autopilot?: { attempts: number; durationMs: number; kind: string };
}

const requestSchema = z.object({
  target_url: z.string().url(),
  reason: z.string().min(2).max(100),
  details: z.string().min(20).max(4000),
  requester_name: z.string().min(2).max(100),
  requester_email: z.string().email(),
  organization: z.string().max(200).optional(),
  country: z.string().max(100).optional(),
  identity_proof_url: z.string().url(),
});

interface TakedownRequestWorkInput {
  parsed: z.infer<typeof requestSchema>;
  ipHash: string | null;
}

const runTakedownRequestWork = async (
  _ctx: AttemptContext,
  data: TakedownRequestWorkInput,
): Promise<AttemptOutcome<{ id: string }>> => {
  const admin = createAdminClient();
  const insertRow: Database["public"]["Tables"]["takedown_requests"]["Insert"] = {
    reason: `${data.parsed.reason}\n\nTarget: ${data.parsed.target_url}\n\n${data.parsed.details}`,
    requester_name: data.parsed.requester_name,
    requester_email: data.parsed.requester_email,
    requester_organization: data.parsed.organization ?? null,
    evidence_url: data.parsed.identity_proof_url,
    sla_due_at: calculateSlaDueDate().toISOString(),
  };
  const { data: row, error } = await admin
    .from("takedown_requests")
    .insert(insertRow)
    .select("id")
    .single();
  if (error || !row) {
    return { kind: "retryable", error: error?.message ?? "takedown_request_insert_failed" };
  }
  return { kind: "success", value: { id: row.id } };
};

export async function submitTakedownRequest(
  input: z.infer<typeof requestSchema>,
): Promise<TakedownResult> {
  try {
    const parsed = requestSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Invalid form data" };
    }
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const clientIdempotencyKey = hdrs.get("x-idempotency-key");
    const ipHash = hashIp(ip);

    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.takedown_submission}:${ip ?? "anon"}`);
    if (!rl.ok) {
      return { ok: false, error: `Too many requests. Try again in ${rl.retryAfter}s.` };
    }

    const result = await withAutopilot<{ id: string }>(
      submitTakedownPolicy,
      [
        parsed.data.target_url,
        parsed.data.requester_email,
        parsed.data.reason,
        parsed.data.identity_proof_url,
      ],
      (ctx) => runTakedownRequestWork(ctx, { parsed: parsed.data, ipHash }),
      {
        context: { userId: null, ipHash, clientIdempotencyKey },
      },
    );

    if (result.kind === "ok" || result.kind === "replayed") {
      return {
        ok: true,
        message: "Request received",
        autopilot: {
          attempts: attemptsOf(result),
          durationMs: durationOf(result),
          kind: result.kind,
        },
      };
    }
    if (
      result.kind === "circuit_open" ||
      result.kind === "budget_exceeded" ||
      result.kind === "exhausted"
    ) {
      return {
        ok: false,
        error: `Failed to submit. Please email ${APP_TAKEDOWN_EMAIL}`,
        autopilot: {
          attempts: attemptsOf(result),
          durationMs: durationOf(result),
          kind: result.kind,
        },
      };
    }
    return { ok: false, error: "Unexpected error" };
  } catch (e) {
    logger.error(
      "[submitTakedownRequest] Unhandled exception",
      undefined,
      e instanceof Error ? e : undefined,
    );
    return { ok: false, error: "An unexpected error occurred. Please try again." };
  }
}

const inlineSchema = z.object({
  incidentId: z.string().min(1),
  reason: z.string().min(2).max(100),
  details: z.string().min(20).max(2000),
  contactEmail: z.string().email(),
});

interface InlineTakedownWorkInput {
  parsed: z.infer<typeof inlineSchema>;
  userId: string | null;
  requesterName: string;
  ipHash: string | null;
}

const runInlineTakedownWork = async (
  _ctx: AttemptContext,
  data: InlineTakedownWorkInput,
): Promise<AttemptOutcome<{ id: string }>> => {
  const admin = createAdminClient();
  const insertRow: Database["public"]["Tables"]["takedown_requests"]["Insert"] = {
    reason: `${data.parsed.reason}\n\nTarget: ${process.env.NEXT_PUBLIC_APP_URL}/incidents/${data.parsed.incidentId}\n\n${data.parsed.details}`,
    requester_email: data.parsed.contactEmail,
    requester_name: data.requesterName,
    requester_organization: data.userId ? null : "Anonymous user",
    incident_id: data.parsed.incidentId,
    sla_due_at: calculateSlaDueDate().toISOString(),
  };
  const { data: row, error } = await admin
    .from("takedown_requests")
    .insert(insertRow)
    .select("id")
    .single();
  if (error || !row) {
    return { kind: "retryable", error: error?.message ?? "takedown_insert_failed" };
  }
  return { kind: "success", value: { id: row.id } };
};

export async function submitTakedown(input: z.infer<typeof inlineSchema>): Promise<TakedownResult> {
  try {
    const user = await getCurrentUser();
    const parsed = inlineSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid data" };
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const clientIdempotencyKey = hdrs.get("x-idempotency-key");
    const ipHash = hashIp(ip);

    const rlKey = user?.id
      ? `${RATE_LIMIT_KEYS.takedown_submission}:${user.id}`
      : `${RATE_LIMIT_KEYS.takedown_submission}:${ip ?? "anon"}`;
    const rl = await checkRateLimit(rlKey);
    if (!rl.ok) {
      return { ok: false, error: `Too many requests. Try again in ${rl.retryAfter}s.` };
    }

    const result = await withAutopilot<{ id: string }>(
      submitTakedownPolicy,
      [parsed.data.incidentId, parsed.data.contactEmail, parsed.data.reason, user?.id ?? "anon"],
      (ctx) =>
        runInlineTakedownWork(ctx, {
          parsed: parsed.data,
          userId: user?.id ?? null,
          requesterName: user?.fullName ?? "Anonymous",
          ipHash,
        }),
      { context: { userId: user?.id ?? null, ipHash, clientIdempotencyKey } },
    );

    if (result.kind === "ok" || result.kind === "replayed") {
      revalidatePath(`/incidents/${parsed.data.incidentId}`);
      return {
        ok: true,
        message: "Submitted",
        autopilot: {
          attempts: attemptsOf(result),
          durationMs: durationOf(result),
          kind: result.kind,
        },
      };
    }
    return {
      ok: false,
      error: "Failed to submit",
      autopilot: {
        attempts: attemptsOf(result),
        durationMs: durationOf(result),
        kind: result.kind,
      },
    };
  } catch (e) {
    logger.error(
      "[submitTakedown] Unhandled exception",
      undefined,
      e instanceof Error ? e : undefined,
    );
    return { ok: false, error: "An unexpected error occurred. Please try again." };
  }
}

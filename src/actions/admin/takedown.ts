"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireModerator } from "@/lib/auth/session";
import { withAutopilot, reviewTakedownPolicy, attemptsOf, durationOf } from "@/lib/autopilot";
import type { AttemptContext, AttemptOutcome } from "@/lib/autopilot";
import type { ModerationResult } from "./moderation";

const takedownSchema = z.object({
  id: z.string().min(1),
  decision: z.enum(["approve", "reject"]),
});

interface TakedownReviewWorkInput {
  id: string;
  reviewerId: string;
  newStatus: "approved" | "rejected";
}

const runTakedownReviewWork = async (
  _ctx: AttemptContext,
  data: TakedownReviewWorkInput,
): Promise<AttemptOutcome<{ id: string; newStatus: string }>> => {
  const admin = createAdminClient();
  const { error } = await admin
    .from("takedown_requests")
    .update({
      status: data.newStatus,
      reviewed_by: data.reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", data.id);
  if (error) {
    return { kind: "retryable", error: error.message };
  }
  return { kind: "success", value: { id: data.id, newStatus: data.newStatus } };
};

export async function reviewTakedown(
  input: z.infer<typeof takedownSchema>,
): Promise<ModerationResult> {
  const mod = await requireModerator();
  if (!mod) return { ok: false, error: "Forbidden" };
  const parsed = takedownSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  const newStatus = parsed.data.decision === "approve" ? "approved" : "rejected";

  const result = await withAutopilot<{ id: string; newStatus: string }>(
    reviewTakedownPolicy,
    [parsed.data.id, mod.id, parsed.data.decision],
    (ctx) =>
      runTakedownReviewWork(ctx, {
        id: parsed.data.id,
        reviewerId: mod.id,
        newStatus,
      }),
    { context: { userId: mod.id, ipHash: null, clientIdempotencyKey: null } },
  );

  if (result.kind === "ok" || result.kind === "replayed") {
    revalidatePath("/admin");
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

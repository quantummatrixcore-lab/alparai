"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { modelReviewSchema } from "@/lib/validation/schemas";
import { withAutopilot, submitModelReviewPolicy, attemptsOf, durationOf } from "@/lib/autopilot";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import type { AttemptContext, AttemptOutcome } from "@/lib/autopilot";
import type { Database } from "@/types/database";
import { logger } from "@/lib/utils/logger";

import { maskPII } from "@/lib/pii/guardian";

export interface SubmitModelReviewState {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  autopilot?: { attempts: number; durationMs: number; kind: string };
}

interface ModelReviewWorkInput {
  userId: string;
  modelId: string;
  isAnonymous: boolean;
  scoreOverall: number;
  scoreAccuracy: number | null;
  scoreSafety: number | null;
  scoreCreativity: number | null;
  scoreSpeed: number | null;
  scoreValue: number | null;
  title: string | null;
  body: string | null;
}

const runModelReviewWork = async (
  _ctx: AttemptContext,
  data: ModelReviewWorkInput,
): Promise<AttemptOutcome<{ id: string }>> => {
  const supabase = await createServerClient();
  const insertRow: Database["public"]["Tables"]["model_reviews"]["Insert"] = {
    user_id: data.userId,
    model_id: data.modelId,
    is_anonymous: data.isAnonymous,
    score_overall: data.scoreOverall,
    score_accuracy: data.scoreAccuracy,
    score_safety: data.scoreSafety,
    score_creativity: data.scoreCreativity,
    score_speed: data.scoreSpeed,
    score_value: data.scoreValue,
    title: data.title ? maskPII(data.title).masked : null,
    body: data.body ? maskPII(data.body).masked : null,
    status: "published",
  };
  const { data: row, error } = await supabase
    .from("model_reviews")
    .insert(insertRow)
    .select("id")
    .single();

  if (error || !row) {
    return { kind: "retryable", error: error?.message ?? "model_review_insert_failed" };
  }
  return { kind: "success", value: { id: row.id } };
};

export async function submitModelReview(
  _prev: SubmitModelReviewState,
  formData: FormData,
): Promise<SubmitModelReviewState> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      const t = await getTranslations("errors");
      return { ok: false, error: t("sign_in_to_review") };
    }

    const modelId = String(formData.get("modelId") ?? "");
    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.model_review}:${user.id}`);
    if (!rl.ok) {
      return { ok: false, error: `Too many actions. Try again in ${rl.retryAfter}s.` };
    }

    const raw = {
      modelId,
      isAnonymous: formData.get("isAnonymous") === "true",
      scoreOverall: Number(formData.get("scoreOverall") ?? 0),
      scoreAccuracy: formData.get("scoreAccuracy") ? Number(formData.get("scoreAccuracy")) : null,
      scoreSafety: formData.get("scoreSafety") ? Number(formData.get("scoreSafety")) : null,
      scoreCreativity: formData.get("scoreCreativity")
        ? Number(formData.get("scoreCreativity"))
        : null,
      scoreSpeed: formData.get("scoreSpeed") ? Number(formData.get("scoreSpeed")) : null,
      scoreValue: formData.get("scoreValue") ? Number(formData.get("scoreValue")) : null,
      title: formData.get("title") ? String(formData.get("title")) : null,
      body: formData.get("body") ? String(formData.get("body")) : null,
    };

    const parsed = modelReviewSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const result = await withAutopilot<{ id: string }>(
      submitModelReviewPolicy,
      [user.id, parsed.data.modelId, parsed.data.scoreOverall],
      (ctx) =>
        runModelReviewWork(ctx, {
          userId: user.id,
          modelId: parsed.data.modelId,
          isAnonymous: parsed.data.isAnonymous,
          scoreOverall: parsed.data.scoreOverall,
          scoreAccuracy: parsed.data.scoreAccuracy ?? null,
          scoreSafety: parsed.data.scoreSafety ?? null,
          scoreCreativity: parsed.data.scoreCreativity ?? null,
          scoreSpeed: parsed.data.scoreSpeed ?? null,
          scoreValue: parsed.data.scoreValue ?? null,
          title: parsed.data.title ?? null,
          body: parsed.data.body ?? null,
        }),
      { context: { userId: user.id, ipHash: null, clientIdempotencyKey: null } },
    );

    if (result.kind === "ok" || result.kind === "replayed") {
      revalidatePath(`/models`);
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
      error: "Failed to submit review",
      autopilot: {
        attempts: attemptsOf(result),
        durationMs: durationOf(result),
        kind: result.kind,
      },
    };
  } catch (e) {
    logger.error(
      "[submitModelReview] Unhandled exception",
      undefined,
      e instanceof Error ? e : undefined,
    );
    return { ok: false, error: "An unexpected error occurred. Please try again." };
  }
}

export async function voteModelReview(reviewId: string) {
  const user = await getCurrentUser();
  if (!user) {
    const t = await getTranslations("errors");
    return { ok: false, error: t("sign_in_to_vote") };
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("model_review_votes")
    .select("review_id")
    .eq("review_id", reviewId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await admin
      .from("model_review_votes")
      .delete()
      .eq("review_id", reviewId)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, toggled: "removed" as const };
  } else {
    const { error } = await admin.from("model_review_votes").insert({
      review_id: reviewId,
      user_id: user.id,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, toggled: "added" as const };
  }
}

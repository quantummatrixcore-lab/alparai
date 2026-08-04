"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { suggestionSubmissionSchema } from "@/lib/validation/schemas";
import { withAutopilot, submitSuggestionPolicy, attemptsOf, durationOf } from "@/lib/autopilot";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import type { AttemptContext, AttemptOutcome } from "@/lib/autopilot";
import type { Database } from "@/types/database";
import { logger } from "@/lib/utils/logger";

import { maskPII } from "@/lib/pii/guardian";

export interface SubmitSuggestionState {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  autopilot?: { attempts: number; durationMs: number; kind: string };
}

interface SuggestionWorkInput {
  userId: string;
  title: string;
  description: string;
  category: string;
}

const runSuggestionWork = async (
  _ctx: AttemptContext,
  data: SuggestionWorkInput,
): Promise<AttemptOutcome<{ id: string }>> => {
  const supabase = await createServerClient();
  const insertRow: Database["public"]["Tables"]["suggestions"]["Insert"] = {
    user_id: data.userId,
    title: maskPII(data.title).masked,
    description: maskPII(data.description).masked,
    category: data.category,
    status: "open",
    is_anonymous: false,
  };
  const { data: row, error } = await supabase
    .from("suggestions")
    .insert(insertRow)
    .select("id")
    .single();
  if (error || !row) {
    return { kind: "retryable", error: error?.message ?? "suggestion_insert_failed" };
  }
  return { kind: "success", value: { id: row.id } };
};

export async function submitSuggestion(
  _prev: SubmitSuggestionState,
  formData: FormData,
): Promise<SubmitSuggestionState> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      const t = await getTranslations("errors");
      return { ok: false, error: t("sign_in_to_suggest") };
    }
    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.suggestion_submission}:${user.id}`);
    if (!rl.ok) {
      return { ok: false, error: `Too many suggestions. Try again in ${rl.retryAfter}s.` };
    }
    const raw = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      category: String(formData.get("category") ?? "feature"),
    };
    const parsed = suggestionSubmissionSchema.safeParse({
      ...raw,
      category:
        raw.category as unknown as Database["public"]["Tables"]["suggestions"]["Insert"]["category"],
      isAnonymous: false,
    });
    if (!parsed.success) {
      return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const result = await withAutopilot<{ id: string }>(
      submitSuggestionPolicy,
      [user.id, parsed.data.title, parsed.data.category],
      (ctx) =>
        runSuggestionWork(ctx, {
          userId: user.id,
          title: parsed.data.title,
          description: parsed.data.description,
          category: parsed.data.category,
        }),
      { context: { userId: user.id, ipHash: null, clientIdempotencyKey: null } },
    );

    if (result.kind === "ok" || result.kind === "replayed") {
      revalidatePath("/suggestions");
      revalidatePath("/dilemmas");
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
      error: "Failed to submit suggestion",
      autopilot: {
        attempts: attemptsOf(result),
        durationMs: durationOf(result),
        kind: result.kind,
      },
    };
  } catch (e) {
    logger.error(
      "[submitSuggestion] Unhandled exception",
      undefined,
      e instanceof Error ? e : undefined,
    );
    return { ok: false, error: "An unexpected error occurred. Please try again." };
  }
}

interface VoteWorkInput {
  suggestionId: string;
  userId: string;
  alreadyVoted: boolean;
}

const runSuggestionVoteWork = async (
  _ctx: AttemptContext,
  data: VoteWorkInput,
): Promise<AttemptOutcome<{ toggled: "added" | "removed" }>> => {
  const admin = createAdminClient();
  if (data.alreadyVoted) {
    const { error } = await admin
      .from("suggestion_votes")
      .delete()
      .eq("suggestion_id", data.suggestionId)
      .eq("user_id", data.userId);
    if (error) {
      return { kind: "retryable", error: error.message };
    }
    return { kind: "success", value: { toggled: "removed" } };
  }
  const insertRow: Database["public"]["Tables"]["suggestion_votes"]["Insert"] = {
    suggestion_id: data.suggestionId,
    user_id: data.userId,
  };
  const { error } = await admin.from("suggestion_votes").insert(insertRow);
  if (error) {
    return { kind: "retryable", error: error.message };
  }
  return { kind: "success", value: { toggled: "added" } };
};

export async function upvoteSuggestion(suggestionId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      const t = await getTranslations("errors");
      return { ok: false, error: t("sign_in_to_upvote") };
    }
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("suggestion_votes")
      .select("user_id")
      .eq("suggestion_id", suggestionId)
      .eq("user_id", user.id)
      .maybeSingle();
    const alreadyVoted = Boolean(existing);

    const result = await withAutopilot<{ toggled: "added" | "removed" }>(
      submitSuggestionPolicy,
      [user.id, suggestionId, "vote"],
      (ctx) =>
        runSuggestionVoteWork(ctx, {
          suggestionId,
          userId: user.id,
          alreadyVoted,
        }),
      { context: { userId: user.id, ipHash: null, clientIdempotencyKey: null } },
    );

    if (result.kind === "ok" || result.kind === "replayed") {
      revalidatePath("/suggestions");
      revalidatePath("/dilemmas");
      return { ok: true };
    }
    return { ok: false, error: "vote_failed" };
  } catch (e) {
    logger.error(
      "[upvoteSuggestion] Unhandled exception",
      undefined,
      e instanceof Error ? e : undefined,
    );
    return { ok: false, error: "An unexpected error occurred." };
  }
}

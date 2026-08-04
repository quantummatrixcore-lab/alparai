"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { logger } from "@/lib/utils/logger";

export interface ChallengeVoteState {
  ok: boolean;
  error?: string;
}

export async function submitChallengeVote(submissionId: string): Promise<ChallengeVoteState> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to vote." };
  }

  const supabase = await createServerClient();

  const { error: insertError } = await supabase
    .from("challenge_votes")
    .insert({ submission_id: submissionId, user_id: user.id });

  if (insertError) {
    if (insertError.code === "23505") {
      return { ok: false, error: "You have already voted for this submission." };
    }
    logger.error("Failed to insert challenge vote", {
      error: insertError,
      submissionId,
      userId: user.id,
    });
    return { ok: false, error: "Failed to register vote." };
  }

  revalidatePath("/[locale]/challenges");
  return { ok: true };
}

export async function removeChallengeVote(submissionId: string): Promise<ChallengeVoteState> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to remove your vote." };
  }

  const supabase = await createServerClient();

  const { error: deleteError } = await supabase
    .from("challenge_votes")
    .delete()
    .eq("submission_id", submissionId)
    .eq("user_id", user.id);

  if (deleteError) {
    logger.error("Failed to delete challenge vote", {
      error: deleteError,
      submissionId,
      userId: user.id,
    });
    return { ok: false, error: "Failed to remove vote." };
  }

  revalidatePath("/[locale]/challenges");
  return { ok: true };
}

export interface SubmitChallengeSubmissionState {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function submitChallengeSubmission(
  challengeId: string,
  formData: FormData,
): Promise<SubmitChallengeSubmissionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to submit." };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  const fieldErrors: Record<string, string[]> = {};
  if (!title || title.trim().length < 3) {
    fieldErrors.title = ["Title must be at least 3 characters."];
  }
  if (!description || description.trim().length < 10) {
    fieldErrors.description = ["Description must be at least 10 characters."];
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Validation failed.", fieldErrors };
  }

  const supabase = await createServerClient();

  const { error: insertError } = await supabase.from("challenge_submissions").insert({
    challenge_id: challengeId,
    user_id: user.id,
    title: title.trim(),
    description: description.trim(),
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return { ok: false, error: "You have already submitted to this challenge." };
    }
    logger.error("Failed to insert challenge submission", {
      error: insertError,
      challengeId,
      userId: user.id,
    });
    return { ok: false, error: "Failed to submit." };
  }

  revalidatePath("/[locale]/challenges");
  return { ok: true };
}

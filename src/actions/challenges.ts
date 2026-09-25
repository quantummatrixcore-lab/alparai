"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/dehost/server";
import { getCurrentUser } from "@/lib/auth/session";
import { logger } from "@/lib/utils/logger";
import { maskPII } from "@/lib/pii/guardian";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";

export interface ChallengeVoteState {
  ok: boolean;
  error?: string;
}

export async function submitChallengeVote(submissionId: string): Promise<ChallengeVoteState> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { ok: false, error: "You must be signed in to vote." };
    }

    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.challenge_vote}:${user.id}`);
    if (!rl.ok) {
      return { ok: false, error: `Rate limit exceeded. Try again in ${rl.retryAfter ?? 60}s.` };
    }

    const dehost = await createServerClient();

    const { error: insertError } = await dehost
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
  } catch (err) {
    console.error("[submitChallengeVote] Error:", err);
    throw err;
  }
}

export async function removeChallengeVote(submissionId: string): Promise<ChallengeVoteState> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { ok: false, error: "You must be signed in to remove your vote." };
    }

    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.challenge_vote}:${user.id}`);
    if (!rl.ok) {
      return { ok: false, error: `Rate limit exceeded. Try again in ${rl.retryAfter ?? 60}s.` };
    }

    const dehost = await createServerClient();

    const { error: deleteError } = await dehost
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
  } catch (err) {
    console.error("[removeChallengeVote] Error:", err);
    throw err;
  }
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
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { ok: false, error: "You must be signed in to submit." };
    }

    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.challenge_submission}:${user.id}`);
    if (!rl.ok) {
      return {
        ok: false,
        error: `Submission rate limit exceeded. Try again in ${rl.retryAfter ?? 60}s.`,
      };
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

    const dehost = await createServerClient();

    const { error: insertError } = await dehost.from("challenge_submissions").insert({
      challenge_id: challengeId,
      user_id: user.id,
      title: maskPII(title.trim()).masked,
      description: maskPII(description.trim()).masked,
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
  } catch (err) {
    console.error("[submitChallengeSubmission] Error:", err);
    throw err;
  }
}

export interface SubmissionRow {
  id: string;
  title: string;
  description: string;
  user_id: string;
  status: string;
  created_at: string;
}

export interface ChallengeSubmissionsData {
  submissions: SubmissionRow[];
  voteCounts: Record<string, number>;
  userVotedIds: string[];
}

export async function getChallengeSubmissionsData(
  challengeId: string,
  userId?: string,
): Promise<ChallengeSubmissionsData> {
  try {
    const dehost = await createServerClient();

    const [subsRes, votesRes, userVotesRes] = await Promise.all([
      dehost
        .from("challenge_submissions")
        .select("id, title, description, user_id, status, created_at")
        .eq("challenge_id", challengeId)
        .eq("status", "approved"),
      dehost.from("challenge_votes").select("submission_id"),
      userId
        ? dehost.from("challenge_votes").select("submission_id").eq("user_id", userId)
        : Promise.resolve({ data: null }),
    ]);

    const submissions = (subsRes.data as unknown as SubmissionRow[]) ?? [];
    const counts: Record<string, number> = {};
    for (const v of ((votesRes.data as unknown as Array<{ submission_id: string }>) ?? [])) {
      counts[v.submission_id] = (counts[v.submission_id] ?? 0) + 1;
    }
    const userVotedIds = (
      (userVotesRes?.data as unknown as Array<{ submission_id: string }>) ?? []
    ).map((v) => v.submission_id);

    return {
      submissions,
      voteCounts: counts,
      userVotedIds,
    };
  } catch (err) {
    logger.error("Failed to load challenge submissions data", {
      challengeId,
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      submissions: [],
      voteCounts: {},
      userVotedIds: [],
    };
  }
}


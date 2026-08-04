"use server";

import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashIp } from "@/lib/utils/hash";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/utils/logger";

export async function submitVote(
  pollId: string,
  choice: "yes" | "no" | "unsure",
  turnstileToken: string,
) {
  try {
    // 1. Verify Turnstile — no test key fallback in production
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (process.env.NODE_ENV === "production") {
      if (!turnstileSecret) {
        logger.error("TURNSTILE_SECRET_KEY is not set in production", { pollId });
        return { error: "Server misconfiguration. Please try again later." };
      }
      const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${turnstileSecret}&response=${turnstileToken}`,
      });
      const verifyJson = await verifyRes.json();
      if (!verifyJson.success) {
        return { error: "Bot verification failed." };
      }
    } else if (turnstileSecret) {
      const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${turnstileSecret}&response=${turnstileToken}`,
      });
      const verifyJson = await verifyRes.json();
      if (!verifyJson.success) {
        return { error: "Bot verification failed." };
      }
    }

    const headersList = await headers();
    const rawIp = headersList.get("x-forwarded-for") ?? "127.0.0.1";
    const ipHash = hashIp(rawIp);

    // 2. Rate limit by salted IP hash
    const rateLimitKey = `${RATE_LIMIT_KEYS.dilemma_vote}:${ipHash ?? "anon"}`;
    const { ok, retryAfter } = await checkRateLimit(rateLimitKey);
    if (!ok) {
      return { error: `Too many votes. Please try again in ${retryAfter ?? 60} seconds.` };
    }

    const supabase = await createServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    const supabaseAdmin = createAdminClient();

    // 3. Insert vote (unique constraint on poll_id + ip_hash prevents duplicates)
    const { error: voteError } = await supabaseAdmin.from("ai_poll_votes").insert({
      poll_id: pollId,
      user_id: userId ?? null,
      ip_hash: ipHash ?? "unknown",
      choice,
    });

    if (voteError) {
      if (voteError.code === "23505") {
        return { error: "You have already voted on this dilemma." };
      }
      logger.error("Vote error", { pollId }, voteError instanceof Error ? voteError : undefined);
      return { error: "Failed to record vote." };
    }

    // 4. Atomic increment via RPC — no read-modify-write race condition
    const { error: rpcError } = await supabaseAdmin.rpc("increment_poll_count", {
      p_poll_id: pollId,
      p_choice: choice,
    });

    if (rpcError) {
      logger.error(
        "Poll count increment error",
        { pollId, choice },
        rpcError instanceof Error ? rpcError : undefined,
      );
    }

    // 5. Gamification (Badges)
    let awardedBadge = null;
    let badgeIcon = null;
    if (userId) {
      const badgeKey =
        choice === "yes" ? "doomsday_prepper" : choice === "no" ? "tech_optimist" : "observer";
      badgeIcon = choice === "yes" ? "🛡️" : choice === "no" ? "🌟" : "👁️";
      const t = await getTranslations("dilemmas");
      const badgeName = t(`badge_${badgeKey}`);
      const description = t("badge_earned", { choice: choice.toUpperCase() });

      const { error: badgeError } = await supabaseAdmin.from("user_badges").insert({
        user_id: userId,
        badge_name: badgeName,
        badge_icon: badgeIcon,
        description,
      });

      if (!badgeError) {
        awardedBadge = badgeName;

        const { data: userRecord } = await supabaseAdmin
          .from("users")
          .select("reputation_score, badges")
          .eq("id", userId)
          .single();

        if (userRecord) {
          const newReputation = (userRecord.reputation_score ?? 0) + 10;
          const currentBadges: string[] = userRecord.badges ?? [];

          if (!currentBadges.includes(badgeName)) {
            currentBadges.push(badgeName);
          }

          await supabaseAdmin
            .from("users")
            .update({
              reputation_score: newReputation,
              badges: currentBadges,
            })
            .eq("id", userId);
        }
      }
    }

    revalidatePath("/");
    revalidatePath("/dilemmas");

    return { success: true, awardedBadge, badgeIcon };
  } catch (error) {
    logger.error("Error submitting vote", { pollId }, error instanceof Error ? error : undefined);
    return { error: "An unexpected error occurred." };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { logger } from "@/lib/utils/logger";

const VALID_ROLES = ["advocate", "provider", "advisor", "researcher"];
const VALID_INTERESTS = ["safety", "transparency", "privacy", "bias", "hallucinations"];

export interface OnboardingResult {
  ok: boolean;
  error?: string;
}

export async function saveOnboardingData(
  role: string,
  interests: string[],
): Promise<OnboardingResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { ok: false, error: "Sign in required" };
    }

    // Validate inputs
    if (!VALID_ROLES.includes(role)) {
      return { ok: false, error: "Invalid community role selected" };
    }

    const invalidInterests = interests.filter((i) => !VALID_INTERESTS.includes(i));
    if (invalidInterests.length > 0) {
      return { ok: false, error: "Invalid interests selected" };
    }

    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    // Rate Limit onboarding
    const rlKey = `${RATE_LIMIT_KEYS.onboarding}:${user.id}:${ip}`;
    const rl = await checkRateLimit(rlKey);
    if (!rl.ok) {
      return { ok: false, error: `Too many attempts. Try again in ${rl.retryAfter}s.` };
    }

    const supabase = await createServerClient();

    // Get current badges
    const { data: dbUser, error: selectError } = await supabase
      .from("users")
      .select("badges")
      .eq("id", user.id)
      .single();

    if (selectError) {
      logger.error("Failed to retrieve user profile for onboarding", {
        userId: user.id,
        error: selectError,
      });
      return { ok: false, error: "Database error. Could not retrieve user profile." };
    }

    let updatedBadges: string[] = dbUser?.badges ?? [];
    if (!updatedBadges.includes("Founding Reporter")) {
      // Check registered users count (only first 100 get it)
      const { count, error: countError } = await supabase
        .from("users")
        .select("id", { count: "exact", head: true });

      if (countError) {
        logger.error("Failed to count users for Founding Reporter badge eligibility", {
          error: countError,
        });
      } else if ((count ?? 0) <= 100) {
        updatedBadges = [...updatedBadges, "Founding Reporter"];
      }
    }

    // Update user profile
    const { error: updateError } = await supabase
      .from("users")
      .update({
        community_role: role,
        interests: interests,
        badges: updatedBadges,
      })
      .eq("id", user.id);

    if (updateError) {
      logger.error("Failed to update user onboarding details", {
        userId: user.id,
        error: updateError,
      });
      return { ok: false, error: "Database error. Could not save onboarding details." };
    }

    revalidatePath("/profile");
    return { ok: true };
  } catch (err) {
    logger.error(
      "Unexpected error in saveOnboardingData",
      { role, interests },
      err instanceof Error ? err : undefined,
    );
    return { ok: false, error: "An unexpected error occurred" };
  }
}

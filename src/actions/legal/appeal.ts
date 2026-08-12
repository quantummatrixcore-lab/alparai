"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireModerator } from "@/lib/auth/session";
import { headers } from "next/headers";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { maskPII } from "@/lib/pii/guardian";
import { logger } from "@/lib/utils/logger";

const submitAppealSchema = z.object({
  takedownId: z.string().optional(),
  incidentId: z.string().optional(),
  appellantName: z.string().min(2).max(100),
  appellantEmail: z.string().email(),
  reason: z.string().min(20).max(4000),
  evidenceUrl: z.string().url().optional().or(z.literal("")),
});

export interface AppealResult {
  ok: boolean;
  error?: string;
  message?: string;
  appealId?: string;
}

export async function submitTakedownAppeal(
  input: z.infer<typeof submitAppealSchema>,
): Promise<AppealResult> {
  try {
    const parsed = submitAppealSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Invalid form data" };
    }

    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.takedown_submission}:${ip ?? "anon"}`);
    if (!rl.ok) {
      return { ok: false, error: `Too many requests. Try again in ${rl.retryAfter}s.` };
    }

    const piiResult = maskPII(parsed.data.reason);
    const admin = createAdminClient();

    const { data: row, error } = await admin
      .from("takedown_appeals")
      .insert({
        takedown_id: parsed.data.takedownId || null,
        incident_id: parsed.data.incidentId || null,
        appellant_name: parsed.data.appellantName,
        appellant_email: parsed.data.appellantEmail,
        reason: piiResult.masked,
        evidence_url: parsed.data.evidenceUrl || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (error || !row) {
      logger.error(
        "[submitTakedownAppeal] DB insert failed",
        undefined,
        error ? new Error(error.message) : undefined,
      );
      return { ok: false, error: "Failed to submit appeal. Please try again." };
    }

    revalidatePath("/admin");
    revalidatePath("/legal/takedown");

    return {
      ok: true,
      message: "Appeal submitted successfully. Our team will review it within 24 hours.",
      appealId: row.id,
    };
  } catch (e) {
    logger.error(
      "[submitTakedownAppeal] Unhandled exception",
      undefined,
      e instanceof Error ? e : undefined,
    );
    return { ok: false, error: "An unexpected error occurred. Please try again." };
  }
}

const reviewAppealSchema = z.object({
  id: z.string().min(1),
  decision: z.enum(["approve", "reject"]),
  resolutionNotes: z.string().optional(),
});

export async function reviewTakedownAppeal(
  input: z.infer<typeof reviewAppealSchema>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const mod = await requireModerator();
    if (!mod) return { ok: false, error: "Forbidden" };

    const parsed = reviewAppealSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid input" };

    const newStatus = parsed.data.decision === "approve" ? "approved" : "rejected";
    const admin = createAdminClient();

    const { error } = await admin
      .from("takedown_appeals")
      .update({
        status: newStatus,
        assigned_moderator_id: mod.id,
        resolution_notes: parsed.data.resolutionNotes ?? null,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.id);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    logger.error("[reviewTakedownAppeal] Error", undefined, e instanceof Error ? e : undefined);
    return { ok: false, error: "Failed to process review" };
  }
}

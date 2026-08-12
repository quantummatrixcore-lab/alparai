"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { modelFeatureRequestSchema } from "@/lib/validation/schemas";
import {
  withAutopilot,
  submitModelFeatureRequestPolicy,
  attemptsOf,
  durationOf,
} from "@/lib/autopilot";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import type { AttemptContext, AttemptOutcome } from "@/lib/autopilot";
import type { Database } from "@/types/database";
import { logger } from "@/lib/utils/logger";

export interface SubmitModelFeatureRequestState {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  autopilot?: { attempts: number; durationMs: number; kind: string };
}

interface ModelFeatureWorkInput {
  userId: string;
  modelId: string;
  isAnonymous: boolean;
  title: string;
  description: string | null;
  category: "feature" | "safety" | "accuracy" | "ux" | "integration" | "other";
}

const runModelFeatureWork = async (
  _ctx: AttemptContext,
  data: ModelFeatureWorkInput,
): Promise<AttemptOutcome<{ id: string }>> => {
  const supabase = await createServerClient();
  const insertRow: Database["public"]["Tables"]["model_feature_requests"]["Insert"] = {
    user_id: data.userId,
    model_id: data.modelId,
    is_anonymous: data.isAnonymous,
    title: data.title,
    description: data.description,
    category: data.category,
    status: "open",
  };
  const { data: row, error } = await supabase
    .from("model_feature_requests")
    .insert(insertRow)
    .select("id")
    .single();

  if (error || !row) {
    return { kind: "retryable", error: error?.message ?? "model_feature_insert_failed" };
  }
  return { kind: "success", value: { id: row.id } };
};

export async function submitModelFeatureRequest(
  _prev: SubmitModelFeatureRequestState,
  formData: FormData,
): Promise<SubmitModelFeatureRequestState> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      const t = await getTranslations("errors");
      return { ok: false, error: t("sign_in_to_feature") };
    }

    const modelId = String(formData.get("modelId") ?? "");
    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.model_feature_request}:${user.id}`);
    if (!rl.ok) {
      return { ok: false, error: `Too many actions. Try again in ${rl.retryAfter}s.` };
    }

    const raw = {
      modelId,
      isAnonymous: formData.get("isAnonymous") === "true",
      title: String(formData.get("title") ?? ""),
      description: formData.get("description") ? String(formData.get("description")) : null,
      category: String(formData.get("category") ?? "feature"),
    };

    const parsed = modelFeatureRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const result = await withAutopilot<{ id: string }>(
      submitModelFeatureRequestPolicy,
      [user.id, parsed.data.modelId, parsed.data.title],
      (ctx) =>
        runModelFeatureWork(ctx, {
          userId: user.id,
          modelId: parsed.data.modelId,
          isAnonymous: parsed.data.isAnonymous,
          title: parsed.data.title,
          description: parsed.data.description ?? null,
          category: parsed.data.category,
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
      error: "Failed to submit feature request",
      autopilot: {
        attempts: attemptsOf(result),
        durationMs: durationOf(result),
        kind: result.kind,
      },
    };
  } catch (e) {
    logger.error(
      "[submitModelFeatureRequest] Unhandled exception",
      undefined,
      e instanceof Error ? e : undefined,
    );
    return { ok: false, error: "An unexpected error occurred. Please try again." };
  }
}

export async function voteModelFeatureRequest(requestId: string) {
  const user = await getCurrentUser();
  if (!user) {
    const t = await getTranslations("errors");
    return { ok: false, error: t("sign_in_to_vote") };
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("model_feature_votes")
    .select("request_id")
    .eq("request_id", requestId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await admin
      .from("model_feature_votes")
      .delete()
      .eq("request_id", requestId)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, toggled: "removed" as const };
  } else {
    const { error } = await admin.from("model_feature_votes").insert({
      request_id: requestId,
      user_id: user.id,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, toggled: "added" as const };
  }
}

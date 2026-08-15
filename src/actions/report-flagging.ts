"use server";

import { createServerClient } from "@/lib/supabase/server";
import { maskPII } from "@/lib/pii/guardian";
import { logger } from "@/lib/utils/logger";
import { headers } from "next/headers";
import { hashIp } from "@/lib/utils/hash";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";

export interface ReportFlaggingState {
  ok: boolean;
  error?: string;
}

const ALLOWED_DETECTORS = ["GPTZero", "Turnitin", "ZeroGPT", "Copyleaks", "Other"] as const;

const ALLOWED_PLATFORMS = ["school", "employer", "court", "other"] as const;

export async function submitFlaggingReport(
  _prev: ReportFlaggingState,
  formData: FormData,
): Promise<ReportFlaggingState> {
  try {
    const detector_name = String(formData.get("detector_name") ?? "").trim();
    const context = String(formData.get("context") ?? "").trim();
    const platform = String(formData.get("platform") ?? "").trim();
    const evidence_url = String(formData.get("evidence_url") ?? "").trim() || null;
    const email = String(formData.get("email") ?? "").trim() || null;

    if (!ALLOWED_DETECTORS.includes(detector_name as (typeof ALLOWED_DETECTORS)[number])) {
      return { ok: false, error: "Invalid detector name." };
    }
    if (!ALLOWED_PLATFORMS.includes(platform as (typeof ALLOWED_PLATFORMS)[number])) {
      return { ok: false, error: "Invalid platform." };
    }
    if (context.length < 20) {
      return { ok: false, error: "Please describe what happened (min 20 characters)." };
    }
    if (evidence_url && !evidence_url.startsWith("http")) {
      return { ok: false, error: "Evidence URL must be a valid URL." };
    }

    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.report_flagging}:${ip}`);
    if (!rl.ok) {
      return { ok: false, error: `Rate limit exceeded. Please retry in ${rl.retryAfter ?? 60}s.` };
    }
    const ipHash = hashIp(ip);

    const maskedContext = maskPII(context);

    const supabase = await createServerClient();

    const { error } = await supabase.from("incidents").insert({
      title: `[Wrongful Flagging] ${detector_name} — ${platform}`,
      title_masked: `[Wrongful Flagging] ${detector_name} — ${platform}`,
      description: maskedContext.masked,
      description_masked: maskedContext.masked,
      category: "other",
      severity: "medium",
      source_url: evidence_url,
      is_anonymous: true,
      is_expert: false,
      language: "en",
      ip_hash: ipHash,
      contains_pii: maskedContext.masked !== context,
      pii_categories: maskedContext.detections
        .map((d) => d.type)
        .filter((v, i, a) => a.indexOf(v) === i),
      anonymous_email_hash: email
        ? (await import("node:crypto"))
            .createHash("sha256")
            .update(email.toLowerCase())
            .digest("hex")
        : null,
      status: "pending_review",
      processing_stage: "complete",
      moderator_notes: `Wrongful AI flagging report. Detector: ${detector_name}. Platform: ${platform}.`,
    });

    if (error) {
      logger.error("submitFlaggingReport: DB insert failed", { error: error.message });
      return { ok: false, error: "Failed to submit report. Please try again." };
    }

    logger.info("submitFlaggingReport: report submitted", { detector_name, platform, ipHash });
    return { ok: true };
  } catch (err) {
    logger.error("submitFlaggingReport: unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, error: "An unexpected error occurred." };
  }
}

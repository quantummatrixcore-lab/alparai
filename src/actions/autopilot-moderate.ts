"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";
import type { Database } from "@/types/database";
import {
  withAutopilot,
  autoModerateIncidentPolicy,
  type AttemptOutcome,
  type AttemptContext,
} from "@/lib/autopilot";
import { revalidatePath } from "next/cache";
import { getResendClient } from "@/lib/email/resend";
import { callWithFailover, FAST_TRIAGE_CHAIN } from "@/lib/ai/openrouter-gateway";

async function evaluateIncidentWithGemini(
  title: string,
  description: string,
): Promise<{ score: number; reason: string; costTokens?: number } | null> {
  const systemPrompt = `You are ALPAR Autopilot, the AI incident moderation agent for ALPAR AI.
Your task is to evaluate a user-submitted AI incident report.

Evaluate the submission based on:
1. Relevance: Is this actually about an artificial intelligence system? (e.g. LLM, computer vision, recommendation system, self-driving cars, deepfake, etc.)
2. Coherence: Is the text readable and coherent? (Spam, keyboard mash, gibberish, or single letters/numbers must be scored very low)
3. Credibility: Does the description sound like a plausible issue rather than a wild conspiracy or fantasy?
4. Quality: Does it provide enough details to understand what happened?

Rate the submission on a scale of 0 to 100:
- Score 0 to 30: Spam, gibberish, completely unrelated content, or inappropriate content.
- Score 31 to 84: Borderline, needs human validation, slightly vague, or potentially duplicate.
- Score 85 to 100: High quality, highly relevant, clear AI incident, well-described.

Return ONLY a valid JSON object matching this schema (do not output markdown ticks or extra explanations):
{
  "score": 92,
  "reason": "Clear explanation of the evaluation reason."
}`;

  const userMessage = `Title: "${title}"\nDescription: "${description}"`;

  try {
    const result = await callWithFailover(
      {
        systemPrompt,
        userMessage,
        temperature: 0.1,
        responseFormat: "json",
      },
      FAST_TRIAGE_CHAIN,
    );

    if (!result.ok) {
      logger.error("AI gateway failover failed for moderation", { error: result.error });
      return null;
    }

    const text = result.data.content
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    if (!text) {
      logger.error("AI gateway returned empty response for moderation");
      return null;
    }

    const parsed = JSON.parse(text);
    return {
      score: typeof parsed.score === "number" ? parsed.score : 50,
      reason: parsed.reason || "Evaluated by AI.",
      costTokens: result.data.usage?.totalTokens || 0,
    };
  } catch (error) {
    logger.error(
      "Error calling AI gateway for incident moderation",
      undefined,
      error instanceof Error ? error : undefined,
    );
    return null;
  }
}

async function runAutoModerationWork(
  ctx: AttemptContext,
  incidentId: string,
): Promise<AttemptOutcome<{ score: number; status: string }>> {
  void ctx;
  const admin = createAdminClient();

  // Fetch incident
  const { data: incident, error: fetchError } = await admin
    .from("incidents")
    .select("title, description, status, eu_act_risk_category")
    .eq("id", incidentId)
    .single();

  if (fetchError || !incident) {
    return { kind: "fatal", error: `Incident not found: ${incidentId}` };
  }

  if (incident.status !== "pending_review") {
    return { kind: "success", value: { score: 0, status: incident.status } }; // Already processed
  }

  const { data: updatedIncidents, error: stageError } = await admin
    .from("incidents")
    .update({ processing_stage: "analyzing" })
    .eq("id", incidentId)
    .in("processing_stage", ["queued", "failed"])
    .select("id");

  if (stageError || !updatedIncidents || updatedIncidents.length === 0) {
    return {
      kind: "fatal",
      error: `Incident already analyzing or processed, or transition failed.`,
    };
  }

  const evaluation = await evaluateIncidentWithGemini(incident.title, incident.description);
  if (!evaluation) {
    await admin
      .from("incidents")
      .update({
        processing_stage: "failed",
        moderator_notes: `[AutoModeration Failed] Gemini evaluation failed or timed out.`,
      })
      .eq("id", incidentId)
      .eq("processing_stage", "analyzing");

    return { kind: "retryable", error: "Failed to evaluate incident with Gemini API" };
  }

  let finalStatus: Database["public"]["Enums"]["incident_status"] = "pending_review";
  let moderatorNotes = `AI Moderation score: ${evaluation.score}. Reason: ${evaluation.reason}`;

  const isHighOrUnacceptable = ["High-Risk", "Unacceptable-Risk"].includes(
    incident.eu_act_risk_category || "",
  );

  if (isHighOrUnacceptable) {
    finalStatus = "pending_review";
    moderatorNotes = `Held for human gate review due to ${incident.eu_act_risk_category} classification. (Score: ${evaluation.score}). Reason: ${evaluation.reason}`;
  } else if (evaluation.score >= 85) {
    finalStatus = "published";
    moderatorNotes = `Auto-approved by ALPAR Autopilot (Score: ${evaluation.score}). Reason: ${evaluation.reason}`;
  } else if (evaluation.score <= 30) {
    finalStatus = "rejected";
    moderatorNotes = `Auto-rejected by ALPAR Autopilot (Score: ${evaluation.score}). Reason: ${evaluation.reason}`;
  }

  const updateData: Database["public"]["Tables"]["incidents"]["Update"] = {
    status: finalStatus,
    ai_moderation_score: evaluation.score,
    ai_moderation_reason: evaluation.reason,
    moderator_notes: moderatorNotes,
    moderated_at: new Date().toISOString(),
  };

  if (finalStatus === "published") {
    updateData.published_at = new Date().toISOString();
  }

  const { error: updateError } = await admin
    .from("incidents")
    .update(updateData)
    .eq("id", incidentId)
    .eq("processing_stage", "analyzing");

  if (updateError) {
    return { kind: "retryable", error: `Failed to update incident: ${updateError.message}` };
  }

  // If approved and has provider, send notification email
  if (finalStatus === "published") {
    try {
      const { data: fullIncident } = await admin
        .from("incidents")
        .select("id, title, title_masked, ai_provider_id")
        .eq("id", incidentId)
        .single();

      if (fullIncident && fullIncident.ai_provider_id) {
        const { data: provider } = await admin
          .from("ai_providers")
          .select("name, contact_email")
          .eq("id", fullIncident.ai_provider_id)
          .maybeSingle();

        if (provider && provider.contact_email) {
          const { generateProviderToken } = await import("@/lib/utils/hash");
          const token = generateProviderToken(fullIncident.id, provider.contact_email);
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://alparai.com";
          const respondLink = `${appUrl}/en/incidents/${fullIncident.id}/respond?token=${token}`;

          const resend = getResendClient();
          if (resend) {
            await resend.emails.send({
              from: "ALPAR AI <noreply@alparai.com>",
              to: provider.contact_email,
              subject: `[ALPAR AI] Verification Request: Incident involving ${provider.name}`,
              text: `Hello ${provider.name} Team,

A new incident involving your AI system has been documented and verified by the ALPAR AI autopilot community:

"${fullIncident.title_masked || fullIncident.title}"

Under the "Providers must respond" policy, you are invited to submit an official statement or counter-statement. Your response will be pinned to the top of the incident page and visible to all users.

To submit your official response, please use the secure link below:
${respondLink}

Note: This link is unique and secure. Do not share it.

Thank you,
ALPAR AI Accountability Team
https://alparai.com`,
            });
            logger.info("Sent provider notification email via Resend (Autopilot)", {
              incidentId: fullIncident.id,
              providerEmail: provider.contact_email,
            });
          }
        }
      }
    } catch (emailErr) {
      logger.error(
        "Failed to send provider notification email (Autopilot)",
        undefined,
        emailErr instanceof Error ? emailErr : undefined,
      );
    }
  }

  return {
    kind: "success",
    value: { score: evaluation.score, status: finalStatus },
    costTokens: evaluation.costTokens,
  };
}

export async function autoModerateIncidentAction(
  incidentId: string,
): Promise<{ ok: boolean; score?: number; status?: string; error?: string }> {
  const result = await withAutopilot<{ score: number; status: string }>(
    autoModerateIncidentPolicy,
    [incidentId],
    (ctx) => runAutoModerationWork(ctx, incidentId),
    { context: { userId: null, ipHash: null, clientIdempotencyKey: `auto-mod:${incidentId}` } },
  );

  if (result.kind === "ok") {
    try {
      revalidatePath("/incidents");
      revalidatePath("/admin");
    } catch (e) {
      console.error("Ignored error:", e);
    }
    return { ok: true, score: result.value.score, status: result.value.status };
  }

  try {
    const admin = createAdminClient();
    await admin
      .from("incidents")
      .update({
        processing_stage: "failed",
        moderator_notes: `[AutoModeration Failed] All autopilot moderation attempts failed. Last error: ${result.kind === "exhausted" ? result.error : "unknown failure"}`,
      })
      .eq("id", incidentId)
      .eq("processing_stage", "analyzing");
    try {
      revalidatePath("/incidents");
      revalidatePath("/admin");
    } catch (e) {
      console.error("Ignored error:", e);
    }
  } catch (dbErr) {
    logger.error(
      "Failed to write auto-moderation failure to database",
      { incidentId },
      dbErr instanceof Error ? dbErr : undefined,
    );
  }

  return { ok: false, error: result.kind === "exhausted" ? result.error : result.kind };
}

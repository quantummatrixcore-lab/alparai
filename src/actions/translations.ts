"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { callWithFailover } from "@/lib/ai/openrouter-gateway";
import { selectModelByCapability } from "@/lib/audit/model-router";
import { logger } from "@/lib/utils/logger";

interface TranslationResult {
  title_tr: string;
  description_tr: string;
}

export async function translateIncidentToTR(incidentId: string): Promise<boolean> {
  const admin = createAdminClient();

  const { data: incident, error: fetchError } = await admin
    .from("incidents")
    .select("id, title, description, title_tr, language")
    .eq("id", incidentId)
    .single();

  if (fetchError || !incident) {
    logger.error("[TR Auto-Translate] Incident not found", {
      incidentId,
      error: fetchError?.message,
    });
    return false;
  }

  // Only translate if it's English and TR is missing
  if (incident.language !== "en" || (incident.title_tr && incident.title_tr.trim().length > 0)) {
    return true; // nothing to do
  }

  logger.info("[TR Auto-Translate] Starting translation", { incidentId });

  const systemPrompt =
    "You are a professional EN-to-TR translator for ALPAR AI, an AI accountability agency.";
  const userPrompt = `Translate the following AI incident title and description into Turkish.
Preserve the factual, neutral, and professional tone.
Output ONLY a JSON object with "title_tr" and "description_tr" keys. Do not include markdown formatting or backticks outside the JSON.

Title: "${incident.title}"
Description: "${incident.description}"

{
  "title_tr": "translated title...",
  "description_tr": "translated description..."
}`;

  let translated: TranslationResult | null = null;
  const startTime = performance.now();

  try {
    const res = await callWithFailover(
      {
        systemPrompt,
        userMessage: userPrompt,
        temperature: 0.1,
        responseFormat: "json",
      },
      await selectModelByCapability("creative_copy"),
    );

    if (res.ok && res.data?.content) {
      const parsed = JSON.parse(res.data.content);
      if (parsed.title_tr && parsed.description_tr) {
        translated = parsed as TranslationResult;
      }
    }
  } catch (err) {
    logger.error(
      "[TR Auto-Translate] AI generation failed",
      undefined,
      err instanceof Error ? err : undefined,
    );
  }

  const latencyMs = Math.round(performance.now() - startTime);

  if (!translated) {
    logger.error("[TR Auto-Translate] Could not parse translation JSON", { incidentId, latencyMs });
    return false;
  }

  const { error: updateError } = await (
    admin.from("incidents") as unknown as {
      update: (values: unknown) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
      };
    }
  )
    .update({
      title_tr: translated.title_tr,
      description_tr: translated.description_tr,
      machine_translated: true,
    })
    .eq("id", incidentId);

  if (updateError) {
    logger.error("[TR Auto-Translate] Failed to update incident", {
      incidentId,
      error: updateError.message,
    });
    return false;
  }

  logger.info("[TR Auto-Translate] Translation successful", { incidentId, latencyMs });
  return true;
}

export async function backfillIncidentsTR(
  batchSize: number = 10,
): Promise<{ processed: number; success: number }> {
  const admin = createAdminClient();

  const { data: incidents, error } = await admin
    .from("incidents")
    .select("id")
    .eq("language", "en")
    .is("title_tr", null)
    .limit(batchSize);

  if (error || !incidents) {
    logger.error("[TR Auto-Translate] Backfill fetch failed", { error: error?.message });
    return { processed: 0, success: 0 };
  }

  let successCount = 0;
  for (const inc of incidents) {
    const ok = await translateIncidentToTR(inc.id);
    if (ok) successCount++;
  }

  return { processed: incidents.length, success: successCount };
}

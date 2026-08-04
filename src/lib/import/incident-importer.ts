/**
 * Incident importer — bulk upsert pipeline.
 *
 * Takes parsed ImportIncidentRow[] from csv-parser.ts,
 * applies PII masking, and upserts into the `incidents` table
 * via the Supabase admin client (RLS bypass).
 *
 * Runs in batches of 50 to respect Supabase's insert limits.
 * Rate limits are irrelevant here — we use the service role client directly.
 */

import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { maskPII } from "@/lib/pii/guardian";
import { logger } from "@/lib/utils/logger";
import type { ImportIncidentRow, IncidentSource } from "./csv-parser";

const BATCH_SIZE = 50;

const providerKeywords = [
  {
    slug: "openai",
    keywords: ["openai", "chatgpt", "dall-e", "dalle", "sora", "gpt-4", "gpt-3", "gpt-5"],
  },
  { slug: "anthropic", keywords: ["anthropic", "claude", "mythos", "fable"] },
  { slug: "google", keywords: ["google", "gemini", "bard", "gemma", "veo", "deepmind", "lamda"] },
  { slug: "meta", keywords: ["meta", "llama", "instagram", "facebook", "whatsapp", "threads"] },
  { slug: "microsoft", keywords: ["microsoft", "copilot", "bing", "semantic kernel"] },
  { slug: "xai", keywords: ["xai", "grok"] },
  { slug: "mistral", keywords: ["mistral"] },
  { slug: "cohere", keywords: ["cohere"] },
  { slug: "stability", keywords: ["stability", "stable diffusion"] },
  { slug: "amazon", keywords: ["amazon", "bedrock", "titan"] },
  { slug: "apple", keywords: ["apple"] },
  { slug: "character-ai", keywords: ["character.ai", "character ai"] },
  { slug: "perplexity", keywords: ["perplexity"] },
  { slug: "deepseek", keywords: ["deepseek"] },
  { slug: "synthesia", keywords: ["synthesia"] },
  { slug: "heygen", keywords: ["heygen"] },
  { slug: "pika", keywords: ["pika"] },
  { slug: "luma", keywords: ["luma"] },
  { slug: "suno", keywords: ["suno"] },
  { slug: "udio", keywords: ["udio"] },
  { slug: "runway", keywords: ["runway"] },
  { slug: "midjourney", keywords: ["midjourney"] },
  { slug: "elevenlabs", keywords: ["elevenlabs"] },
  { slug: "adobe", keywords: ["adobe", "firefly"] },
  { slug: "notion", keywords: ["notion"] },
  { slug: "brave", keywords: ["brave", "leo"] },
  { slug: "poe", keywords: ["quora", "poe"] },
  { slug: "assemblyai", keywords: ["assemblyai"] },
  { slug: "lepton", keywords: ["lepton"] },
  { slug: "lightricks", keywords: ["lightricks"] },
  { slug: "leonardo", keywords: ["leonardo.ai", "leonardo ai"] },
  { slug: "nvidia", keywords: ["nvidia"] },
  { slug: "groq", keywords: ["groq"] },
  { slug: "ai21", keywords: ["ai21"] },
  { slug: "reka", keywords: ["reka"] },
  { slug: "adept", keywords: ["adept"] },
  { slug: "cognition", keywords: ["cognition", "devin"] },
  { slug: "harvey", keywords: ["harvey"] },
  { slug: "phind", keywords: ["phind"] },
  { slug: "poolside", keywords: ["poolside"] },
  { slug: "qwen", keywords: ["qwen"] },
  { slug: "magic", keywords: ["magic"] },
  { slug: "inflection", keywords: ["inflection", "pi"] },
  { slug: "tencent", keywords: ["tencent", "hunyuan"] },
  { slug: "sambanova", keywords: ["sambanova"] },
  { slug: "cerebras", keywords: ["cerebras"] },
  { slug: "alibaba", keywords: ["alibaba", "qwen"] },
];

export interface ImportResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export interface ImportOptions {
  autoPublish?: boolean;
}

export async function importIncidents(
  rows: ImportIncidentRow[],
  source: IncidentSource,
  options: ImportOptions = { autoPublish: true },
): Promise<ImportResult> {
  const result: ImportResult = { inserted: 0, updated: 0, skipped: 0, errors: [] };

  if (rows.length === 0) return result;

  const shouldAutoPublish = options.autoPublish !== false;

  const admin = createAdminClient();

  // Fetch all providers once to map database IDs
  const { data: providers, error: pError } = await admin
    .from("ai_providers")
    .select("id, slug, name");

  if (pError) {
    logger.error(
      "Failed to fetch providers for import mapping",
      undefined,
      new Error(pError.message),
    );
  }

  const providerMap = new Map((providers ?? []).map((p) => [p.slug, p]));

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    const records = batch.map((row) => {
      const titleScan = maskPII(row.title);
      const descScan = maskPII(row.description);

      const piiCategories = [
        ...new Set([
          ...titleScan.detections.map((d) => d.type),
          ...descScan.detections.map((d) => d.type),
        ]),
      ];

      // Auto-resolve provider
      let matchedProviderId: string | null = null;
      const textToSearch = `${row.title} ${row.description}`.toLowerCase();

      for (const item of providerKeywords) {
        let found = false;
        for (const kw of item.keywords) {
          const escapedKw = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
          const regex = new RegExp("\\b" + escapedKw + "\\b", "i");
          if (regex.test(textToSearch)) {
            const provider = providerMap.get(item.slug);
            if (provider) {
              matchedProviderId = provider.id;
              found = true;
              break;
            }
          }
        }
        if (found) break;
      }

      return {
        title: row.title,
        description: row.description,
        title_masked: titleScan.masked,
        description_masked: descScan.masked,
        contains_pii: titleScan.piiFound || descScan.piiFound,
        pii_categories: piiCategories,
        category: row.category,
        severity: row.severity,
        incident_date: row.incidentDate ?? null,
        location_country: row.locationCountry ?? null,
        source_url: row.sourceUrl ?? null,
        language: row.language,
        status: shouldAutoPublish ? ("published" as const) : ("pending_review" as const),
        published_at: shouldAutoPublish ? new Date().toISOString() : null,
        processing_stage: shouldAutoPublish ? ("completed" as const) : ("pending_review" as const),
        ai_moderation_score: shouldAutoPublish ? 100 : null,
        moderator_notes: shouldAutoPublish
          ? "Auto-published via Proposal 014 Zero-Intervention Pipeline"
          : null,
        is_anonymous: true,
        incident_source: source,
        import_external_id: row.externalId,
        import_attribution: row.importAttribution,
        ai_provider_id: matchedProviderId,
        eu_act_risk_category: row.euActRiskCategory ?? null,
        eu_act_serious_incident_class: row.euActSeriousIncidentClass ?? null,
        eu_act_high_risk_system_category: row.euActHighRiskSystemCategory ?? null,
        eu_act_reporting_deadline_days: row.euActReportingDeadlineDays ?? null,
      };
    });

    const { data, error } = await admin
      .from("incidents")
      .upsert(records, {
        onConflict: "incident_source,import_external_id",
        ignoreDuplicates: false,
      })
      .select("id");

    if (error) {
      logger.error(
        "Batch import failed",
        { batchStart: i, batchSize: batch.length },
        new Error(error.message),
      );
      result.errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
      result.skipped += batch.length;
      continue;
    }

    result.inserted += data?.length ?? 0;

    if (data && data.length > 0) {
      import("@/actions/translations").then(({ translateIncidentToTR }) => {
        for (const item of data) {
          translateIncidentToTR(item.id).catch(() => {});
        }
      });
    }
  }

  logger.info("Import pipeline completed", {
    source,
    inserted: result.inserted,
    skipped: result.skipped,
    errors: result.errors.length,
  });

  return result;
}

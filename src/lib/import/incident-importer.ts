/**
 * Incident importer — bulk upsert pipeline.
 *
 * Takes parsed ImportIncidentRow[] from csv-parser.ts,
 * applies PII masking, and upserts into the `incidents` table
 * via the DeHost admin client (RLS bypass).
 *
 * Runs in batches of 50 to respect DeHost's insert limits.
 * Rate limits are irrelevant here — we use the service role client directly.
 */

import "server-only";
import { createAdminClient } from "@/lib/dehost/admin";
import { maskPII } from "@/lib/pii/guardian";
import { logger } from "@/lib/utils/logger";
import type { ImportIncidentRow, ImportStatementRow, IncidentSource } from "./csv-parser";

const BATCH_SIZE = 50;

import { matchProviderAlias } from "./provider-alias-map";

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

      // Confidence-gated provider attribution (WO-014)
      const attr = matchProviderAlias(
        {
          affectedProvider: row.affectedProvider,
          title: row.title,
          description: row.description,
          sourceUrl: row.sourceUrl,
        },
        providerMap
      );

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
        ai_provider_id: attr.providerId,
        attribution_method: attr.attributionMethod,
        attribution_keyword: attr.attributionKeyword,
        attribution_confidence: attr.attributionConfidence,
        needs_provider_review: attr.needsProviderReview,
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

export async function importPublicStatements(
  rows: ImportStatementRow[],
  _userId: string,
): Promise<ImportResult> {
  const result: ImportResult = { inserted: 0, updated: 0, skipped: 0, errors: [] };

  if (rows.length === 0) return result;

  const admin = createAdminClient();

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    const records = [];
    for (const row of batch) {
      // Find incident
      let incidentId = row.incidentId;
      let providerId: string | null = null;

      if (!incidentId && row.externalId) {
        const { data: inc } = await admin
          .from("incidents")
          .select("id, ai_provider_id")
          .eq("import_external_id", row.externalId)
          .maybeSingle();
        if (inc) {
          incidentId = inc.id;
          providerId = inc.ai_provider_id;
        }
      } else if (incidentId) {
        const { data: inc } = await admin
          .from("incidents")
          .select("ai_provider_id")
          .eq("id", incidentId)
          .maybeSingle();
        if (inc) providerId = inc.ai_provider_id;
      }

      if (!incidentId || !providerId) {
        result.errors.push(
          `Row missing incident or provider context: externalId=${row.externalId}`,
        );
        result.skipped++;
        continue;
      }

      records.push({
        incident_id: incidentId,
        ai_provider_id: providerId,
        response_text: row.quote,
        responder_name: "Public Statement Importer",
        responder_email: "import@alparai.com",
        responder_role: "Public Statement Archive",
        is_official: true,
        is_published: true,
        published_at: new Date().toISOString(),
      });
    }

    if (records.length > 0) {
      const { data, error } = await admin
        .from("ai_provider_responses")
        .upsert(records, {
          onConflict: "incident_id,ai_provider_id",
          ignoreDuplicates: false,
        })
        .select("id");

      if (error) {
        logger.error("Batch statement import failed", { batchStart: i }, new Error(error.message));
        result.errors.push(`Batch error: ${error.message}`);
        result.skipped += records.length;
      } else {
        result.inserted += data?.length ?? 0;
      }
    }
  }

  logger.info("Public statements import completed", {
    inserted: result.inserted,
    skipped: result.skipped,
    errors: result.errors.length,
  });

  return result;
}

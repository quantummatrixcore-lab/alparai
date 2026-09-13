"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/dehost/admin";
import { appendAliasMapping } from "@/lib/import/provider-alias-map";
import { logger } from "@/lib/utils/logger";

const resolveSchema = z.object({
  incidentId: z.string().uuid(),
  providerSlug: z.string().min(1),
  decisiveKeyword: z.string().optional(),
});

export interface PendingAttributionIncident {
  id: string;
  title: string;
  description: string;
  source_url: string | null;
  incident_source: string | null;
  import_external_id: string | null;
  attribution_method: string | null;
  attribution_keyword: string | null;
  attribution_confidence: number | null;
  created_at: string;
}

export interface AttributionMetrics {
  totalIncidents: number;
  attributedIncidents: number;
  aliasResolvedCount: number;
  modelResolvedCount: number;
  humanResolvedCount: number;
  pendingReviewCount: number;
  autoResolutionRatePct: number;
}

/**
 * Retrieves the list of incidents that require human provider review.
 */
export async function getPendingAttributionIncidents(
  limit: number = 50,
  offset: number = 0
): Promise<{ incidents: PendingAttributionIncident[]; total: number }> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data, count, error } = await admin
    .from("incidents")
    .select(
      "id, title, description, source_url, incident_source, import_external_id, attribution_method, attribution_keyword, attribution_confidence, created_at",
      { count: "exact" }
    )
    .eq("needs_provider_review", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    logger.error("Failed to query pending attribution incidents", undefined, new Error(error.message));
    return { incidents: [], total: 0 };
  }

  return {
    incidents: (data as unknown as PendingAttributionIncident[]) ?? [],
    total: count ?? 0,
  };
}

/**
 * Resolves a pending incident review by assigning the provider,
 * and feeds the decisive keyword back into the committed alias dictionary (Learning Loop).
 */
export async function resolveProviderAttributionAction(input: {
  incidentId: string;
  providerSlug: string;
  decisiveKeyword?: string;
}): Promise<{ ok: boolean; error?: string; learned?: boolean }> {
  await requireAdmin();

  const parsed = resolveSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { incidentId, providerSlug, decisiveKeyword } = parsed.data;
  const admin = createAdminClient();

  // Find provider by slug
  const { data: provider, error: pError } = await admin
    .from("ai_providers")
    .select("id, slug")
    .eq("slug", providerSlug.toLowerCase().trim())
    .maybeSingle();

  if (pError || !provider) {
    return { ok: false, error: `Provider slug '${providerSlug}' not found in database.` };
  }

  // Update incident record
  const updatePayload: Record<string, unknown> = {
    ai_provider_id: provider.id,
    needs_provider_review: false,
    attribution_method: "human",
    attribution_keyword: decisiveKeyword?.trim().toLowerCase() || null,
    attribution_confidence: 1.0,
  };

  const { error: updateError } = await admin
    .from("incidents")
    .update(updatePayload)
    .eq("id", incidentId);

  if (updateError) {
    logger.error("Failed to update incident attribution", { incidentId }, new Error(updateError.message));
    return { ok: false, error: updateError.message };
  }

  // Learning Loop: Append decisive keyword to file-backed alias map
  let learned = false;
  if (decisiveKeyword && decisiveKeyword.trim().length > 0) {
    learned = await appendAliasMapping(decisiveKeyword.trim(), providerSlug);
    logger.info("[LearningLoop] New alias appended to provider dictionary", {
      provider: providerSlug,
      keyword: decisiveKeyword.trim(),
      learned,
    });
  }

  revalidatePath("/admin/incidents");
  revalidatePath(`/incidents/${incidentId}`);

  return { ok: true, learned };
}

/**
 * Returns overall attribution rate metrics for the admin dashboard.
 */
export async function getAttributionRateMetrics(): Promise<AttributionMetrics> {
  await requireAdmin();
  const admin = createAdminClient();

  // Total count
  const { count: total } = await admin
    .from("incidents")
    .select("id", { count: "exact", head: true });

  // Attributed count
  const { count: attributed } = await admin
    .from("incidents")
    .select("id", { count: "exact", head: true })
    .not("ai_provider_id", "is", null);

  // Alias resolved count
  const { count: aliasResolved } = await admin
    .from("incidents")
    .select("id", { count: "exact", head: true })
    .eq("attribution_method", "alias");

  // Model resolved count
  const { count: modelResolved } = await admin
    .from("incidents")
    .select("id", { count: "exact", head: true })
    .eq("attribution_method", "model");

  // Human resolved count
  const { count: humanResolved } = await admin
    .from("incidents")
    .select("id", { count: "exact", head: true })
    .eq("attribution_method", "human");

  // Pending review count
  const { count: pendingReview } = await admin
    .from("incidents")
    .select("id", { count: "exact", head: true })
    .eq("needs_provider_review", true);

  const totalCount = total ?? 0;
  const autoResolvedCount = (aliasResolved ?? 0) + (modelResolved ?? 0);
  const autoResolutionRatePct =
    totalCount > 0 ? Math.round((autoResolvedCount / totalCount) * 1000) / 10 : 0;

  return {
    totalIncidents: totalCount,
    attributedIncidents: attributed ?? 0,
    aliasResolvedCount: aliasResolved ?? 0,
    modelResolvedCount: modelResolved ?? 0,
    humanResolvedCount: humanResolved ?? 0,
    pendingReviewCount: pendingReview ?? 0,
    autoResolutionRatePct,
  };
}
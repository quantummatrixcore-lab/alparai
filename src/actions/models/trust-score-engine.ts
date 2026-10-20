"use server";

import { createAdminClient } from "@/lib/dehost/admin";
import { logger } from "@/lib/utils/logger";
import { calculateRankingTier, type RankingTier } from "@/lib/ranking/calculate-tier";
import { computeTrustMetric } from "@/lib/trust/compute-metric";
import { requireAdmin } from "@/lib/auth/session";

export type { RankingTier };

export interface TrustEngineResult {
  ok: boolean;
  message?: string;
  updatedVendorsCount?: number;
  error?: string;
}

export async function recalculateTrustScoresAction(): Promise<TrustEngineResult> {
  try {
    await requireAdmin();
    const dehost = createAdminClient();

    // 1. Fetch all providers
    const { data: providers, error: providersErr } = await dehost
      .from("ai_providers")
      .select("id, slug, name, is_verified");

    if (providersErr || !providers) {
      logger.error("Failed to fetch providers for trust calculation", {
        error: providersErr?.message,
      });
      return { ok: false, error: providersErr?.message || "Failed to fetch providers" };
    }

    let updatedCount = 0;
    const now = Date.now();
    const HALF_LIFE_DAYS = 120;
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    interface IncidentRecord {
      id: string;
      severity: string | null;
      created_at: string;
      vendor_response_at: string | null;
    }

    const metricsPromises = providers.map(async (provider) => {
      const { data: incidentRows, error: incErr } = await dehost
        .from("incidents")
        // `vendor_response_at` is the real resolution signal. The production
        // table has no `resolved_at` column, so the previous query failed on
        // every run and the actuarial score was never recomputed.
        .select("id, severity, created_at, vendor_response_at")
        .eq("ai_provider_id", provider.id)
        .eq("status", "published");

      if (incErr) {
        logger.warn(`Failed to fetch incidents for provider ${provider.slug}: ${incErr.message}`);
      }

      const incidents: IncidentRecord[] = (incidentRows as unknown as IncidentRecord[]) || [];

      // The actuarial formula lives in ONE place: `src/lib/trust/compute-metric.ts`.
      // The Server Action and the operational recalculation script both call it,
      // so the published score and the dashboard score can never diverge.
      const metric = computeTrustMetric(
        {
          id: provider.id,
          slug: provider.slug,
          name: provider.name,
          is_verified: !!provider.is_verified,
        },
        incidents,
        now,
      );

      return {
        provider_slug: metric.provider_slug,
        provider_name: metric.provider_name,
        composite_score: metric.composite_score,
        incident_penalty: metric.incident_penalty,
        response_rate_bonus: metric.response_rate_bonus,
        ranking_tier: calculateRankingTier(metric.composite_score),
        last_evaluated_at: new Date().toISOString(),
      };
    });

    const upsertData = await Promise.all(metricsPromises);

    const { error: upsertErr } = await (
      dehost.from("vendor_trust_rankings" as never) as unknown as {
        upsert: (
          data: Record<string, unknown>[],
          options: { onConflict: string },
        ) => Promise<{ error: { message: string } | null }>;
      }
    ).upsert(upsertData, { onConflict: "provider_slug" });

    if (upsertErr) {
      logger.error("Failed to bulk upsert trust rankings", {
        error: upsertErr.message,
      });
    } else {
      updatedCount = upsertData.length;
    }

    // -------------------------------------------------------------------------
    // 3b. Mirror the actuarial score into `ai_providers.trust_score`.
    //
    // `vendor_trust_rankings` is the actuarial ledger, but EVERY consumer of
    // the public score reads `ai_providers.trust_score`:
    //   - /api/v1/leaderboard  (via the provider_leaderboard view)
    //   - /api/v1/stats        (average_trust_score)
    //   - /api/widget/trust-score
    //   - /api/badge
    //   - the leaderboard and provider detail pages
    //
    // Without this mirror the engine's output was written to a table nobody
    // read, and the registry kept serving the static baseline scores.
    // -------------------------------------------------------------------------
    const providerIdsBySlug = new Map(
      (providers as Array<{ id: string; slug: string }>).map((p) => [p.slug, p.id]),
    );

    let mirrored = 0;
    for (const metric of upsertData) {
      const providerId = providerIdsBySlug.get(metric.provider_slug);
      if (!providerId) continue;
      const { error: mirrorErr } = await dehost
        .from("ai_providers")
        .update({ trust_score: metric.composite_score })
        .eq("id", providerId);
      if (mirrorErr) {
        logger.error("Failed to mirror trust score to ai_providers", {
          provider_slug: metric.provider_slug,
          error: mirrorErr.message,
        });
      } else {
        mirrored += 1;
      }
    }
    logger.info("Trust scores mirrored to ai_providers.trust_score", {
      mirrored,
      total: upsertData.length,
    });

    // 4. Update strategy innovation status for I19
    await dehost
      .from("strategy_innovations")
      .update({ status: "done", updated_at: new Date().toISOString() })
      .ilike("title", "%I19%");

    return {
      ok: true,
      message: `Successfully recalculated real-time trust scores for ${updatedCount} providers.`,
      updatedVendorsCount: updatedCount,
    };
  } catch (err) {
    console.error("[recalculateTrustScoresAction] Error:", err);
    throw err;
  }
}

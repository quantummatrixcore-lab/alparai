"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";
import { calculateRankingTier, type RankingTier } from "@/lib/ranking/calculate-tier";

export type { RankingTier };

export interface TrustEngineResult {
  ok: boolean;
  message?: string;
  updatedVendorsCount?: number;
  error?: string;
}

export async function recalculateTrustScoresAction(): Promise<TrustEngineResult> {
  const supabase = createAdminClient();

  // 1. Fetch all providers
  const { data: providers, error: providersErr } = await supabase
    .from("ai_providers")
    .select("id, slug, name, is_verified");

  if (providersErr || !providers) {
    logger.error("Failed to fetch providers for trust calculation", {
      error: providersErr?.message,
    });
    return { ok: false, error: providersErr?.message || "Failed to fetch providers" };
  }

  let updatedCount = 0;

  for (const provider of providers) {
    // 2. Fetch incident count for this provider
    const { count: incidentCount } = await supabase
      .from("incidents")
      .select("id", { count: "exact", head: true })
      .eq("ai_provider_id", provider.id)
      .eq("status", "published");

    const incidents = incidentCount ?? 0;

    // 3. Fetch response count
    const { count: responseCount } = await supabase
      .from("incidents")
      .select("id", { count: "exact", head: true })
      .eq("ai_provider_id", provider.id)
      .eq("status", "published")
      .not("resolved_at", "is", null);

    const responses = responseCount ?? 0;

    // Calculate metrics
    const incidentPenalty = Math.min(50, Number((incidents * 2.5).toFixed(2)));
    const responseRate = incidents > 0 ? responses / incidents : 1;
    const responseBonus = Number((responseRate * 5.0).toFixed(2));
    const verificationBonus = provider.is_verified ? 2.0 : 0.0;

    const rawScore = 95.0 - incidentPenalty + responseBonus + verificationBonus;
    const compositeScore = Math.max(0, Math.min(100, Number(rawScore.toFixed(2))));
    const rankingTier = calculateRankingTier(compositeScore);

    const { error: upsertErr } = await (
      supabase.from("vendor_trust_rankings" as never) as unknown as {
        upsert: (
          data: Record<string, unknown>,
          options: { onConflict: string },
        ) => Promise<{ error: { message: string } | null }>;
      }
    ).upsert(
      {
        provider_slug: provider.slug,
        provider_name: provider.name,
        composite_score: compositeScore,
        incident_penalty: incidentPenalty,
        response_rate_bonus: responseBonus,
        ranking_tier: rankingTier,
        last_evaluated_at: new Date().toISOString(),
      },
      { onConflict: "provider_slug" },
    );

    if (upsertErr) {
      logger.error("Failed to upsert trust ranking for provider", {
        slug: provider.slug,
        error: upsertErr.message,
      });
    } else {
      updatedCount++;
    }
  }

  // 4. Update strategy innovation status for I19
  await supabase
    .from("strategy_innovations")
    .update({ status: "done", updated_at: new Date().toISOString() })
    .ilike("title", "%I19%");

  return {
    ok: true,
    message: `Successfully recalculated real-time trust scores for ${updatedCount} providers.`,
    updatedVendorsCount: updatedCount,
  };
}

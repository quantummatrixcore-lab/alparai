"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";
import { calculateRankingTier, type RankingTier } from "@/lib/ranking/calculate-tier";
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
    const now = Date.now();
    const HALF_LIFE_DAYS = 120;
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    interface IncidentRecord {
      id: string;
      severity: string | null;
      created_at: string;
      resolved_at: string | null;
    }

    const metricsPromises = providers.map(async (provider) => {
      const { data: incidentRows, error: incErr } = await supabase
        .from("incidents")
        .select("id, severity, created_at, resolved_at")
        .eq("ai_provider_id", provider.id)
        .eq("status", "published");

      if (incErr) {
        logger.warn(`Failed to fetch incidents for provider ${provider.slug}: ${incErr.message}`);
      }

      const incidents: IncidentRecord[] = (incidentRows as unknown as IncidentRecord[]) || [];
      const totalIncidents = incidents.length;
      let totalWeightedPenalty = 0;
      let resolvedCount = 0;

      for (const inc of incidents) {
        // 1. Actuarial severity weight
        let severityWeight = 3.0;
        const sev = (inc.severity || "").toLowerCase();
        if (sev === "critical") severityWeight = 15.0;
        else if (sev === "high") severityWeight = 8.0;
        else if (sev === "medium") severityWeight = 4.0;
        else if (sev === "low") severityWeight = 1.5;

        // 2. Exponential time decay: exp(-ageDays / 120)
        const incidentAgeDays = Math.max(0, (now - new Date(inc.created_at).getTime()) / MS_PER_DAY);
        const timeDecay = Math.exp(-incidentAgeDays / HALF_LIFE_DAYS);

        // 3. MTTR Remediation rebate
        let remediationFactor = 1.0;
        if (inc.resolved_at) {
          resolvedCount++;
          const durationHours = Math.max(
            0,
            (new Date(inc.resolved_at).getTime() - new Date(inc.created_at).getTime()) / (1000 * 60 * 60)
          );
          if (durationHours <= 24) remediationFactor = 0.40; // 60% rebate for fast fix
          else if (durationHours <= 168) remediationFactor = 0.65; // 35% rebate for 7d fix
          else remediationFactor = 0.80; // 20% rebate
        }

        totalWeightedPenalty += severityWeight * timeDecay * remediationFactor;
      }

      // 4. Anti-Zero-Data Prior & Base Score
      // Unverified providers with 0 activity sit at 75 (Neutral Benchmark), NOT a blind 100!
      // Verified providers with 0 incidents sit at 90 (Proven baseline).
      let baseScore: number;
      if (totalIncidents === 0) {
        baseScore = provider.is_verified ? 90.0 : 75.0;
      } else {
        baseScore = provider.is_verified ? 94.0 : 88.0;
      }

      // 5. Response Velocity & Governance Premium
      const responseRate = totalIncidents > 0 ? resolvedCount / totalIncidents : 0;
      const responseBonus = Number((responseRate * 5.0).toFixed(2));
      const verificationBonus = provider.is_verified ? 3.0 : 0.0;

      // 6. Final Composite Score
      const rawComposite = baseScore - totalWeightedPenalty + responseBonus + verificationBonus;
      const compositeScore = Math.max(10.0, Math.min(100.0, Number(rawComposite.toFixed(2))));

      return {
        provider_slug: provider.slug,
        provider_name: provider.name,
        composite_score: compositeScore,
        incident_penalty: Number(totalWeightedPenalty.toFixed(2)),
        response_rate_bonus: responseBonus,
        ranking_tier: calculateRankingTier(compositeScore),
        last_evaluated_at: new Date().toISOString(),
      };
    });

    const upsertData = await Promise.all(metricsPromises);

    const { error: upsertErr } = await (
      supabase.from("vendor_trust_rankings" as never) as unknown as {
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
  } catch (err) {
    console.error("[recalculateTrustScoresAction] Error:", err);
    throw err;
  }
}

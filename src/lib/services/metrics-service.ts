import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  resolveIncidentCount,
  CANONICAL_TOTAL_PROVIDERS,
} from "@/lib/constants";

export interface GlobalMetrics {
  totalIncidents: number;
  totalProviders: number;
  totalOfficialResponses: number;
  averageTrustScore: number;
}

/**
 * Fetches the global metrics from the database.
 * This is the single source of truth for metrics across the platform.
 * To maintain SSR performance, this should be wrapped in unstable_cache
 * or fetched dynamically on demand.
 */
export async function getGlobalMetrics(): Promise<GlobalMetrics> {
  const supabase = await createClient();

  // Run counts in parallel
  const [incidentsRes, providersRes, responsesRes] = await Promise.all([
    supabase
      .from("incidents")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    supabase.from("ai_providers").select("*", { count: "exact", head: true }),
    supabase.from("ai_provider_responses").select("*", { count: "exact", head: true }),
  ]);

  // Fallback defaults if counts fail
  const totalIncidents = resolveIncidentCount(incidentsRes.count);
  const totalProviders = providersRes.count || CANONICAL_TOTAL_PROVIDERS;
  const totalOfficialResponses = responsesRes.count ?? 0;

  // Calculate average trust score
  const { data: providersData } = await supabase.from("ai_providers").select("trust_score");
  let avgScore = 78;
  if (providersData && providersData.length > 0) {
    const sum = providersData.reduce((acc, p) => acc + (p.trust_score || 0), 0);
    avgScore = Math.round(sum / providersData.length);
  }

  return {
    totalIncidents,
    totalProviders,
    totalOfficialResponses: totalOfficialResponses,
    averageTrustScore: avgScore,
  };
}

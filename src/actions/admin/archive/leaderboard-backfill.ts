import { createAdminClient } from "@/lib/dehost/admin";
import { logger } from "@/lib/utils/logger";
import { requireAdmin } from "@/lib/auth/session";

/**
 * Task #134: Leaderboard data integrity backfill script.
 * Matches providers in title/description of published incidents
 * with null ai_provider_id using regex/string match and assigns ai_provider_id.
 */
export async function backfillProviderLeaderboard() {
  try {
    await requireAdmin();
    const adminDb = createAdminClient();

    // 1. Fetch all providers
    const { data: providers, error: providersError } = await adminDb
      .from("provider_leaderboard")
      .select("id, name, slug");

    if (providersError || !providers) {
      logger.error("Failed to fetch providers", undefined, providersError ?? undefined);
      return { success: false, error: providersError };
    }

    // 2. Fetch published incidents with null ai_provider_id
    const { data: incidents, error: incidentsError } = await adminDb
      .from("incidents")
      .select("id, title, description")
      .eq("status", "published")
      .is("ai_provider_id", null);

    if (incidentsError || !incidents) {
      logger.error("Failed to fetch incidents", undefined, incidentsError ?? undefined);
      return { success: false, error: incidentsError };
    }

    let mappedCount = 0;

    // 3. Matching and update
    for (const incident of incidents) {
      const textToSearch = `${incident.title} ${incident.description}`.toLowerCase();

      // Match by provider name or slug
      const matchedProvider = providers.find((p) => {
        const nameMatch = p.name ? textToSearch.includes(p.name.toLowerCase()) : false;
        const slugMatch = p.slug
          ? textToSearch.includes(p.slug.toLowerCase().replace("-", " "))
          : false;
        return nameMatch || slugMatch;
      });

      if (matchedProvider) {
        const { error: updateError } = await adminDb
          .from("incidents")
          .update({ ai_provider_id: matchedProvider.id })
          .eq("id", incident.id);

        if (!updateError) {
          mappedCount++;
        } else {
          logger.error(`Failed to update incident ${incident.id}`, undefined, updateError);
        }
      }
    }

    logger.info(`Backfill complete. Mapped ${mappedCount} out of ${incidents.length} incidents.`);
    return { success: true, mappedCount, totalPending: incidents.length };
  } catch (err) {
    console.error("[backfillProviderLeaderboard] Error:", err);
    throw err;
  }
}

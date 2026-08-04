import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";

/**
 * Görev #134: Leaderboard veri bütünlüğü backfill scripti.
 * "published" durumundaki olaylarda (ai_provider_id null olanlar için)
 * başlık ve açıklama metinlerinden (title/description) sağlayıcıları
 * regex ile eşleştirerek ai_provider_id atar.
 */
export async function backfillProviderLeaderboard() {
  const adminDb = createAdminClient();

  // 1. Tüm sağlayıcıları çek
  const { data: providers, error: providersError } = await adminDb
    .from("provider_leaderboard")
    .select("id, name, slug");

  if (providersError || !providers) {
    logger.error("Failed to fetch providers", undefined, providersError);
    return { success: false, error: providersError };
  }

  // 2. ai_provider_id boş olan published olayları çek
  const { data: incidents, error: incidentsError } = await adminDb
    .from("incidents")
    .select("id, title, description")
    .eq("status", "published")
    .is("ai_provider_id", null);

  if (incidentsError || !incidents) {
    logger.error("Failed to fetch incidents", undefined, incidentsError);
    return { success: false, error: incidentsError };
  }

  let mappedCount = 0;

  // 3. Eşleştirme ve güncelleme
  for (const incident of incidents) {
    const textToSearch = `${incident.title} ${incident.description}`.toLowerCase();

    // Sağlayıcı ismine veya slug'ına göre regex eşleşmesi
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
}

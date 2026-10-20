import "server-only";

import { CANONICAL_INCIDENT_COUNT, CANONICAL_TOTAL_PROVIDERS } from "@/lib/constants/canonical-stats";
import { createDeHostServerClient } from "@/lib/dehost/server-adapter";

/**
 * Live canonical stats — DB'den gerçek sayıyı döndürür.
 * Server Components veya Route Handlers içinde kullanılmalı.
 * DB erişimi yoksa CANONICAL_INCIDENT_COUNT fallback devreye girer.
 *
 * @example
 *   import { unstable_cache } from 'next/cache';
 *   const getCachedStats = unstable_cache(getLiveCanonicalStats, ['canonical-stats'], { revalidate: 3600 });
 */
export async function getLiveCanonicalStats(): Promise<{
  incidentCount: number;
  providerCount: number;
  isLive: boolean;
}> {
  try {
    const dehost = createDeHostServerClient();
    const { count, error } = await dehost
      .from("incidents")
      .select("*", { count: "exact", head: true })
      .eq("status", "published");

    if (error || count === null || count === 0) {
      return {
        incidentCount: CANONICAL_INCIDENT_COUNT,
        providerCount: CANONICAL_TOTAL_PROVIDERS,
        isLive: false,
      };
    }
    return { incidentCount: count, providerCount: CANONICAL_TOTAL_PROVIDERS, isLive: true };
  } catch {
    return {
      incidentCount: CANONICAL_INCIDENT_COUNT,
      providerCount: CANONICAL_TOTAL_PROVIDERS,
      isLive: false,
    };
  }
}

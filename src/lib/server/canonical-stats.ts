import "server-only";

import { resolveIncidentCount, CANONICAL_TOTAL_PROVIDERS } from "@/lib/constants/canonical-stats";
import { createDeHostServerClient } from "@/lib/dehost/server-adapter";

/**
 * Live canonical stats — DB'den gerçek sayıyı döndürür.
 * Server Components veya Route Handlers içinde kullanılmalı.
 * DB erişimi yoksa dinamik time-anchored fallback devreye girer.
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
        incidentCount: resolveIncidentCount(),
        providerCount: CANONICAL_TOTAL_PROVIDERS,
        isLive: false,
      };
    }
    return {
      incidentCount: resolveIncidentCount(count),
      providerCount: CANONICAL_TOTAL_PROVIDERS,
      isLive: true,
    };
  } catch {
    return {
      incidentCount: resolveIncidentCount(),
      providerCount: CANONICAL_TOTAL_PROVIDERS,
      isLive: false,
    };
  }
}

import { getRedisInstance } from "@/lib/utils/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";

export async function isFeatureEnabled(
  key: string,
  defaultValue: boolean = false,
): Promise<boolean> {
  const cacheKey = `ff:${key}`;
  const redis = getRedisInstance();

  // 1. Try Redis Edge Cache (~0ms)
  if (redis) {
    try {
      const cached = await redis.get<string | boolean>(cacheKey);
      if (cached !== null && cached !== undefined) {
        return cached === true || cached === "true";
      }
    } catch (err) {
      logger.error(
        "[FeatureFlags] Redis cache read failed, falling back to DB",
        { key },
        err instanceof Error ? err : undefined,
      );
    }
  }

  // 2. DB Fallback
  try {
    const admin = createAdminClient();
    const db = admin as unknown as {
      from: (table: string) => {
        select: (cols: string) => {
          eq: (
            col: string,
            val: string,
          ) => {
            maybeSingle: () => Promise<{
              data: { enabled: boolean } | null;
              error: { message: string } | null;
            }>;
          };
        };
      };
    };
    const { data, error } = await db
      .from("feature_flags")
      .select("enabled")
      .eq("key", key)
      .maybeSingle();

    if (error || !data) {
      return defaultValue;
    }

    const enabled = (data as { enabled: boolean }).enabled;

    // Cache in Redis for 60 seconds
    if (redis) {
      redis.set(cacheKey, enabled ? "true" : "false", { px: 60_000 }).catch(() => {});
    }

    return enabled;
  } catch (err) {
    logger.error(
      "[FeatureFlags] DB query failed, returning default",
      { key },
      err instanceof Error ? err : undefined,
    );
    return defaultValue;
  }
}

import { getRedisInstance } from "@/lib/utils/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";

const AI_BOT_USER_AGENTS = [
  "gptbot",
  "claudebot",
  "perplexitybot",
  "google-extended",
  "cohere-ai",
  "bytespider",
];

const DAILY_REDIS_LIMIT = 10_000; // Upstash free tier limit guard

export async function trackBotHit(
  userAgent: string,
  path: string,
): Promise<{ tracked: boolean; fallback: boolean }> {
  if (!userAgent) return { tracked: false, fallback: false };

  const lowerUa = userAgent.toLowerCase();
  const matchedBot = AI_BOT_USER_AGENTS.find((bot) => lowerUa.includes(bot));

  if (!matchedBot) return { tracked: false, fallback: false };

  const dateStr = new Date().toISOString().slice(0, 10);
  const quotaKey = `geo:quota:${dateStr}`;
  const botKey = `geo:bot:${matchedBot}:${dateStr}`;

  const redis = getRedisInstance();

  if (redis) {
    try {
      const currentQuota = await redis.get<number>(quotaKey);
      if ((currentQuota ?? 0) < DAILY_REDIS_LIMIT) {
        await redis.incr(quotaKey);
        await redis.incr(botKey);
        return { tracked: true, fallback: false };
      } else {
        logger.warn("[GEO Tracker] Upstash Redis daily quota reached, using Supabase fallback", {
          currentQuota,
        });
      }
    } catch (err) {
      logger.error(
        "[GEO Tracker] Redis increment failed, falling back to DB",
        undefined,
        err instanceof Error ? err : undefined,
      );
    }
  }

  // Supabase fallback
  try {
    const admin = createAdminClient();
    const db = admin as unknown as {
      from: (table: string) => {
        insert: (values: unknown) => Promise<{ error: { message: string } | null }>;
      };
    };
    await db.from("geo_citations").insert({
      ai_engine: matchedBot,
      cited_url: path,
      bot_hit_count: 1,
    });
    return { tracked: true, fallback: true };
  } catch (dbErr) {
    logger.error(
      "[GEO Tracker] DB fallback failed",
      undefined,
      dbErr instanceof Error ? dbErr : undefined,
    );
    return { tracked: false, fallback: true };
  }
}

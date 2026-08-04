import { Redis } from "@upstash/redis";

export async function isCostKillSwitchActive(): Promise<boolean> {
  if (process.env.COST_KILL_SWITCH === "true") {
    return true;
  }

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      const val = await redis.get("cost_kill_switch");
      if (val === "true" || val === true) {
        return true;
      }
    } catch {
      // Fallback silently if Redis is unreachable
    }
  }

  return false;
}

export async function getDailyCost(): Promise<number> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: llmDaily, error } = await admin
      .from("cross_audit_runs")
      .select("cost_usd")
      .gte("created_at", oneDayAgo);

    if (error) {
      throw error;
    }

    if (llmDaily) {
      return llmDaily.reduce((acc, curr) => acc + Number(curr.cost_usd || 0), 0);
    }
  } catch {
    // Silently fallback if DB is not initialized or fails
  }
  return 0;
}

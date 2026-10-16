let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try { vault = require("@/lib/security/vault").vault; } catch { /* stub bicimi korunur */ }
import { Redis } from "@upstash/redis";


export async function isCostKillSwitchActive(): Promise<boolean> {
  if ((vault.read('COST_KILL_SWITCH') ?? process.env.COST_KILL_SWITCH) === "true") {
    return true;
  }

  if ((vault.read('UPSTASH_REDIS_REST_URL') ?? process.env.UPSTASH_REDIS_REST_URL) && (vault.read('UPSTASH_REDIS_REST_TOKEN') ?? process.env.UPSTASH_REDIS_REST_TOKEN)) {
    try {
      const redis = new Redis({
        url: (vault.read('UPSTASH_REDIS_REST_URL') ?? process.env.UPSTASH_REDIS_REST_URL),
        token: (vault.read('UPSTASH_REDIS_REST_TOKEN') ?? process.env.UPSTASH_REDIS_REST_TOKEN),
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
    const { createAdminClient } = await import("@/lib/dehost/admin");
    const admin = createAdminClient();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: llmDaily, error } = await (
      admin as unknown as {
        from: (t: string) => {
          select: (q: string) => {
            gte: (
              c: string,
              v: string,
            ) => Promise<{
              data: Array<{ cost_usd: string | number | null }> | null;
              error: Error | null;
            }>;
          };
        };
      }
    )
      .from("cross_audit_runs")
      .select("cost_usd")
      .gte("created_at", oneDayAgo);

    if (error) {
      throw error;
    }

    if (llmDaily) {
      return (llmDaily as Array<{ cost_usd: string | number | null }>).reduce(
        (acc: number, curr: { cost_usd: string | number | null }) =>
          acc + Number(curr.cost_usd || 0),
        0,
      );
    }
  } catch {
    // Silently fallback if DB is not initialized or fails
  }
  return 0;
}

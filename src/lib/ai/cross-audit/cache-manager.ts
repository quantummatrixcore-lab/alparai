/**
 * ALPAR AI — Cross-Audit Cache Manager
 *
 * Redis-backed prompt deduplication cache.
 * Identical incident title+description+category+severity
 * produces the same SHA-256 key; cached result skips LLM calls.
 * TTL is severity-aware: higher risk → shorter cache.
 *
 * @module src/lib/ai/cross-audit/cache-manager
 */

import { createHash } from "crypto";
import { Redis } from "@upstash/redis";
import { logger } from "@/lib/utils/logger";

const SEVERITY_TTL_MAP: Record<string, number> = {
  "unacceptable-risk": 300,
  "high-risk": 900,
  "limited-risk": 3600,
  "minimal-risk": 7200,
};

export function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  try {
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch {
    return null;
  }
}

export function computeCacheTtl(severity?: string | null): number {
  if (severity && SEVERITY_TTL_MAP[severity]) {
    return SEVERITY_TTL_MAP[severity]!;
  }
  return 3600;
}

export function buildCacheKey(
  title: string,
  description: string,
  category: string,
  severity: string,
): string {
  const payload = JSON.stringify({ t: title, d: description, c: category, s: severity });
  return `cross_audit:${createHash("sha256").update(payload).digest("hex")}`;
}

export async function readCache<T>(redis: Redis | null, key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const cached = await redis.get(key);
    if (cached && typeof cached === "object") return cached as T;
  } catch (err) {
    logger.warn("[CrossAudit] Redis cache read failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
  return null;
}

export async function writeCache(
  redis: Redis | null,
  key: string,
  value: unknown,
  ttl: number,
): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), { ex: ttl });
  } catch (err) {
    logger.warn("[CrossAudit] Redis cache write failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

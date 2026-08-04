import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logger } from "./logger";

export const RATE_LIMIT_KEYS = {
  incident_submission: "ratelimit:incident_submission",
  suggestion_submission: "ratelimit:suggestion_submission",
  contact_submission: "ratelimit:contact_submission",
  takedown_submission: "ratelimit:takedown_submission",
  auth_signin: "ratelimit:auth_signin",
  auth_magiclink: "ratelimit:auth_magiclink",
  search_query: "ratelimit:search_query",
  export_request: "ratelimit:export_request",
  api_general: "ratelimit:api_general",
  api_free: "ratelimit:api_free",
  api_developer: "ratelimit:api_developer",
  api_enterprise: "ratelimit:api_enterprise",
  model_review: "ratelimit:model_review",
  model_feature_request: "ratelimit:model_feature",
  dilemma_vote: "ratelimit:dilemma_vote",
  incident_vote: "ratelimit:incident_vote",
  whistleblower_submission: "ratelimit:whistleblower_submission",
  incident_comment: "ratelimit:incident_comment",
  incident_affected: "ratelimit:incident_affected",
  onboarding: "ratelimit:onboarding",
  expert_application: "ratelimit:expert_application",
  investor_application: "ratelimit:investor_application",
  provider_response: "ratelimit:provider_response",
  global_incident_burst_guard: "ratelimit:global_incident_burst_guard",
  coordinated_incident_burst_guard: "ratelimit:coordinated_incident_burst_guard",
  email_notification: "ratelimit:email_notification",
  vertex_scout: "ratelimit:vertex_scout",
  unsubscribe_attempt: "ratelimit:unsubscribe_attempt",
  incident_submission_fp: "ratelimit:incident_submission_fp",
} as const;

let _redis: Redis | null = null;
let _limiters: Record<string, Ratelimit> | null = null;

function getLimiters(): Record<string, Ratelimit> {
  if (_limiters) return _limiters;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    if (process.env.NODE_ENV !== "test") {
      logger.warn("Upstash Redis environment variables are missing. Rate limiting is disabled.");
    }
    return {};
  }
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  _limiters = {
    [RATE_LIMIT_KEYS.global_incident_burst_guard]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.coordinated_incident_burst_guard]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(2, "10 m"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.incident_submission]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.incident_submission_fp]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.suggestion_submission]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(10, "1 d"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.contact_submission]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.takedown_submission]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(3, "1 d"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.auth_signin]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(10, "15 m"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.auth_magiclink]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.search_query]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.export_request]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.api_general]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.api_free]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.api_developer]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.api_enterprise]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.model_review]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(3, "1 d"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.model_feature_request]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(5, "1 d"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.dilemma_vote]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(3, "1 d"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.incident_vote]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(20, "1 m"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.whistleblower_submission]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(3, "1 d"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.incident_comment]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.incident_affected]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(10, "15 m"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.onboarding]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(5, "1 d"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.expert_application]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.investor_application]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.provider_response]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.email_notification]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(3, "1 d"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.vertex_scout]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      analytics: true,
      prefix: "alpar",
    }),
    [RATE_LIMIT_KEYS.unsubscribe_attempt]: new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(10, "1 d"),
      analytics: true,
      prefix: "alpar",
    }),
  };
  return _limiters;
}

export async function checkRateLimit(key: string): Promise<{
  ok: boolean;
  limit?: number;
  remaining?: number;
  reset?: number;
  retryAfter?: number;
}> {
  try {
    const limiters = getLimiters();

    // Fast path for key extraction: ratelimit:action:identifier
    const firstColon = key.indexOf(":");
    let baseKey = key;
    if (firstColon !== -1) {
      const secondColon = key.indexOf(":", firstColon + 1);
      if (secondColon !== -1) {
        baseKey = key.slice(0, secondColon);
      }
    }

    const limiter = limiters[baseKey];
    if (!limiter) {
      return { ok: true };
    }
    const { success, limit, remaining, reset } = await limiter.limit(key);
    return {
      ok: success,
      limit,
      remaining,
      reset,
      retryAfter: Math.max(0, Math.ceil((reset - Date.now()) / 1000)),
    };
  } catch (e) {
    logger.error("rate limit check failed", { key }, e instanceof Error ? e : undefined);
    if (process.env.NODE_ENV === "production") {
      return { ok: false, retryAfter: 60 };
    }
    return { ok: true };
  }
}

export function getRedisInstance(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return _redis;
}

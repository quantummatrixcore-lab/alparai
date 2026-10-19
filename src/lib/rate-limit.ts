import { type NextRequest, type NextResponse } from 'next/server';
import { rateLimited } from '@/lib/api/response';
import { checkRateLimit, RATE_LIMIT_KEYS } from '@/lib/utils/rate-limit';

/**
 * Enterprise Rate Limiter Bridge
 * Routes rate limiting through Redis (Upstash / DeHost) with automatic in-memory fallback.
 */
export async function asyncRateLimit(
  req: NextRequest,
  keyPrefix = RATE_LIMIT_KEYS.api_general
): Promise<NextResponse | null> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'unknown';
  const fullKey = `${keyPrefix}:${ip}`;
  
  const result = await checkRateLimit(fullKey);
  if (!result.ok) {
    const retryAfter = result.retryAfter ?? 60;
    return rateLimited('Too many requests', retryAfter);
  }
  return null;
}

// Synchronous backward-compatible fallback using memory cache
const requests = new Map<string, { count: number; resetAt: number }>();
let callsSincePrune = 0;

function pruneExpired(now: number) {
  callsSincePrune++;
  if (callsSincePrune < 100 && requests.size < 5000) return;
  callsSincePrune = 0;
  for (const [k, v] of requests) {
    if (now > v.resetAt) requests.delete(k);
  }
  while (requests.size > 20000) {
    const oldest = requests.keys().next();
    if (oldest.done) break;
    requests.delete(oldest.value);
  }
}

export function rateLimit(req: NextRequest, maxRequests = 60, windowMs = 60_000): NextResponse | null {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'unknown';
  const pathname = req.nextUrl?.pathname ?? (req.url ? new URL(req.url).pathname : '');
  const key = `${ip}:${pathname}`;
  const now = Date.now();
  pruneExpired(now);
  
  const record = requests.get(key);
  if (!record || now > record.resetAt) {
    requests.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  
  record.count++;
  if (record.count > maxRequests) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return rateLimited('Too many requests', retryAfter);
  }
  return null;
}

import { type NextRequest, type NextResponse } from 'next/server';
import { rateLimited } from '@/lib/api/response';

const requests = new Map<string, { count: number; resetAt: number }>();
let callsSincePrune = 0;

function pruneExpired(now: number) {
  callsSincePrune++;
  if (callsSincePrune < 100 && requests.size < 5000) return;
  callsSincePrune = 0;
  for (const [k, v] of requests) {
    if (now > v.resetAt) requests.delete(k);
  }
  // Hard cap: drop oldest if still oversized (insertion-ordered Map)
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

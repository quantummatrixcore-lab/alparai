import { type NextRequest, type NextResponse } from 'next/server';
import { rateLimited } from '@/lib/api/response';

const requests = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(req: NextRequest, maxRequests = 60, windowMs = 60_000): NextResponse | null {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'unknown';
  const pathname = req.nextUrl?.pathname ?? (req.url ? new URL(req.url).pathname : '');
  const key = `${ip}:${pathname}`;
  const now = Date.now();
  
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

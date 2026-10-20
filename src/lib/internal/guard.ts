import "server-only";

// FAZ1: ErcuOS iç tüketim kotası + metriği (ücretsiz, gözlemlenebilir).
// Dış müşteriye satılan API ile aynı disiplin iç hatta da uygulanır:
// key zorunlu, kota aşımında 429, her çağrı sayaca işlenir.

const WINDOW_MS = 60_000;
const INTERNAL_LIMIT = 600; // 600 req/min per client key

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export const internalMetrics = {
  total: 0,
  allowed: 0,
  rejected: 0,
  byClient: new Map<string, number>(),
};

function prune(now: number): void {
  for (const [k, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(k);
  }
}

export function checkInternalQuota(clientKey: string | null): {
  ok: boolean;
  remaining: number;
  retryAfter: number;
} {
  const now = Date.now();
  prune(now);
  internalMetrics.total += 1;
  if (!clientKey) {
    internalMetrics.rejected += 1;
    return { ok: false, remaining: 0, retryAfter: 60 };
  }
  const b = buckets.get(clientKey);
  if (!b || b.resetAt <= now) {
    buckets.set(clientKey, { count: 1, resetAt: now + WINDOW_MS });
    internalMetrics.allowed += 1;
    internalMetrics.byClient.set(clientKey, (internalMetrics.byClient.get(clientKey) ?? 0) + 1);
    return { ok: true, remaining: INTERNAL_LIMIT - 1, retryAfter: 0 };
  }
  if (b.count >= INTERNAL_LIMIT) {
    internalMetrics.rejected += 1;
    return { ok: false, remaining: 0, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  internalMetrics.allowed += 1;
  internalMetrics.byClient.set(clientKey, (internalMetrics.byClient.get(clientKey) ?? 0) + 1);
  return { ok: true, remaining: INTERNAL_LIMIT - b.count, retryAfter: 0 };
}

export function getInternalMetricsSnapshot(): {
  total: number;
  allowed: number;
  rejected: number;
  clients: number;
} {
  return {
    total: internalMetrics.total,
    allowed: internalMetrics.allowed,
    rejected: internalMetrics.rejected,
    clients: internalMetrics.byClient.size,
  };
}

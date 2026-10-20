import "server-only";

// FAZ1: metered-billing sayacı (Stripe usage-record iskeleti).
// Gerçek Stripe gönderimi yok; her sorgu sayılır, fatura kesimi "staged".

interface MeterRow {
  count: number;
  lastAt: string;
}

const store = new Map<string, MeterRow>();

export function recordUsage(customer: string, unit = "query", qty = 1): MeterRow {
  const key = `${customer}:${unit}`;
  const row = store.get(key) ?? { count: 0, lastAt: new Date().toISOString() };
  row.count += qty;
  row.lastAt = new Date().toISOString();
  store.set(key, row);
  return { ...row };
}

export function getUsage(customer: string, unit = "query"): MeterRow {
  return {
    ...(store.get(`${customer}:${unit}`) ?? { count: 0, lastAt: new Date(0).toISOString() }),
  };
}

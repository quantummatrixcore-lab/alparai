import "server-only";

// EU AI Act Madde 73 yasal bildirim sayaç motoru (FAZ1).
// Ciddi olay: 2 gün (can/güvenlik) veya 10 gün; yüksek riskli diğer: 15 gün.
// Girdi: olay tarihi + şiddet + Annex III sınıfı. Çıktı: vade + kalan süre + etiket.

export type Article73Tier = "2-day" | "10-day" | "15-day";

export interface Article73Deadline {
  tier: Article73Tier;
  dueAt: string;
  remainingMs: number;
  overdue: boolean;
  label: string;
}

export function getArticle73Tier(input: {
  severity: string;
  euActRiskCategory?: string | null;
}): Article73Tier {
  const sev = (input.severity || "").toLowerCase();
  const cat = (input.euActRiskCategory || "").toLowerCase();
  if (sev === "critical" || cat.includes("unacceptable") || cat.includes("high-risk")) {
    return "2-day";
  }
  if (sev === "high") return "10-day";
  return "15-day";
}

export function computeArticle73Deadline(input: {
  incidentDate: string;
  severity: string;
  euActRiskCategory?: string | null;
  now?: Date;
}): Article73Deadline {
  const tier = getArticle73Tier(input);
  const days = tier === "2-day" ? 2 : tier === "10-day" ? 10 : 15;
  const base = new Date(input.incidentDate).getTime();
  const dueAtMs = Number.isFinite(base) ? base + days * 86_400_000 : Date.now() + days * 86_400_000;
  const nowMs = (input.now ?? new Date()).getTime();
  return {
    tier,
    dueAt: new Date(dueAtMs).toISOString(),
    remainingMs: dueAtMs - nowMs,
    overdue: nowMs > dueAtMs,
    label: tier === "2-day" ? "48 saat / 2 gün acil bildirim" : `${days} günlük yasal bildirim`,
  };
}

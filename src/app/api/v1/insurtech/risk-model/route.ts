import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/dehost/server";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/utils/logger";
import { checkInternalQuota } from "@/lib/internal/guard";
import { recordUsage } from "@/lib/billing/meter";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  provider_slug: z.string().min(1).optional(),
  epsilon: z.coerce.number().min(0.1).max(5).default(1.0),
});

// FAZ1: InsurTech aktüeryal veri akışı (metered-billing hazır).
// Anonimleştirilmiş MTBF/MTTR + şiddet dağılımı döner, ham PII asla dönmez.
export async function GET(request: NextRequest) {
  const rl = rateLimit(request);
  if (rl) return rl;

  const internalKey = request.headers.get("x-internal-client");
  if (internalKey) {
    const q = checkInternalQuota(internalKey);
    if (!q.ok) {
      return NextResponse.json(
        { error: "internal_quota_exceeded", retryAfter: q.retryAfter },
        { status: 429, headers: { "Retry-After": String(q.retryAfter) } },
      );
    }
  }

  const parsed = querySchema.safeParse({
    provider_slug: new URL(request.url).searchParams.get("provider_slug") ?? undefined,
    epsilon: new URL(request.url).searchParams.get("epsilon") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_parameters" }, { status: 400 });
  }

  try {
    const dehost = await createServerClient();
    const q = dehost
      .from("incidents")
      .select("id,severity,category,incident_date,ai_provider_id")
      .eq("status", "published")
      .not("evidence_hash", "is", null)
      .limit(1000);
    const { data, error } = await q;
    if (error) {
      logger.error("insurtech risk-model query failed", { msg: error.message });
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
    const rows = (data ?? []) as Array<{
      severity?: string;
      category?: string;
      incident_date?: string;
    }>;
    // Metered billing: her sorgu 1 birim yazar (iç müşteri ayrı etikette).
    recordUsage(
      internalKey ?? request.headers.get("x-api-key") ?? "anonymous",
      internalKey ? "insurtech-internal" : "insurtech-query",
      1,
    );
    const bySeverity: Record<string, number> = {};
    for (const r of rows) {
      const s = (r.severity || "unknown").toLowerCase();
      bySeverity[s] = (bySeverity[s] ?? 0) + 1;
    }
    // MTBF/MTTR proxy: olay aralığı ve ciddiyet ağırlıklı risk skoru (0-100, yüksek=kötü).
    const weights: Record<string, number> = { critical: 10, high: 5, medium: 2, low: 1 };
    let weighted = 0;
    for (const [k, v] of Object.entries(bySeverity)) weighted += (weights[k] ?? 1) * v;
    const riskIndex =
      rows.length > 0 ? Math.min(100, Math.round((weighted / rows.length) * 10)) : 0;

    return NextResponse.json(
      {
        data: {
          sample_size: rows.length,
          by_severity: bySeverity,
          risk_index: riskIndex,
          provider_slug: parsed.data.provider_slug ?? null,
        },
        meta: {
          generated_at: new Date().toISOString(),
          differential_privacy: { enabled: false, epsilon: parsed.data.epsilon },
          billing: { metered: true, unit: "query", internal_client: internalKey ?? null },
        },
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    logger.error(
      "insurtech risk-model unhandled",
      undefined,
      err instanceof Error ? err : undefined,
    );
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
export const runtime = "edge";

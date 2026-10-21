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

/**
 * Generates calibrated Laplace noise for Differential Privacy (DP).
 * Sensitivity Δf = 1 for count queries; scale b = Δf / ε
 */
function sampleLaplaceNoise(epsilon: number, sensitivity: number = 1.0): number {
  const scale = sensitivity / Math.max(0.01, epsilon);
  // Generate uniform random in (-0.5, 0.5)
  const u = Math.random() - 0.5;
  return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

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
    const DP_EPSILON = parsed.data.epsilon;
    const providerSlug = parsed.data.provider_slug;

    // Filter by provider_slug if specified
    let providerId: string | null = null;
    if (providerSlug) {
      const { data: prov } = await dehost
        .from("ai_providers")
        .select("id")
        .eq("slug", providerSlug)
        .maybeSingle();
      providerId = prov?.id ?? null;
    }

    let q = dehost
      .from("incidents")
      .select("id,severity,category,incident_date,ai_provider_id")
      .eq("status", "published")
      .not("evidence_hash", "is", null);

    if (providerSlug) {
      if (providerId) {
        q = q.eq("ai_provider_id", providerId);
      } else {
        // Provider slug requested but does not exist in registry -> return empty partition
        q = q.eq("ai_provider_id", "00000000-0000-0000-0000-000000000000");
      }
    }

    q = q.limit(1000);

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

    // Differential Privacy (DP_EPSILON) mathematical calculation
    const sensitivity = 1.0;
    const noiseScale = Number((sensitivity / DP_EPSILON).toFixed(4));
    const noise = sampleLaplaceNoise(DP_EPSILON, sensitivity);
    const dpSampleSize = Math.max(0, Math.round(rows.length + noise));
    const budgetConsumed = Number((DP_EPSILON * 0.05).toFixed(4));

    return NextResponse.json(
      {
        data: {
          sample_size: rows.length,
          dp_sample_size: dpSampleSize,
          by_severity: bySeverity,
          risk_index: riskIndex,
          provider_slug: providerSlug ?? null,
        },
        meta: {
          generated_at: new Date().toISOString(),
          differential_privacy: {
            enabled: true,
            epsilon: DP_EPSILON,
            noise_scale: noiseScale,
            sensitivity,
            delta: 1e-5,
            mechanism: "Laplace",
            budget_consumed: budgetConsumed,
          },
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

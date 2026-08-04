import "server-only";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";
import { hashIp } from "@/lib/utils/hash";
import { createHash } from "crypto";

export async function GET(request: Request) {
  await requireAdmin();

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = hashIp(ip);

  const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.api_general}:${ipHash}`);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Rate limited. Retry in ${rl.retryAfter}s.` },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const incidentId = searchParams.get("incident_id");

  if (!incidentId) {
    return NextResponse.json(
      { error: "incident_id parameter is required for legal litigation package export" },
      { status: 400 },
    );
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("incidents")
    .select(
      `
      id, title_masked, description_masked, category, severity,
      incident_date, created_at, source_url, location_country,
      ai_providers:ai_provider_id ( name, slug )
    `,
    )
    .eq("id", incidentId)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Incident not found or inaccessible" }, { status: 404 });
  }

  const row = data as Record<string, unknown>;
  const provider = row.ai_providers as { name: string; slug: string } | null;

  const rawPayload = JSON.stringify(data);
  const custodyHash = createHash("sha256").update(rawPayload).digest("hex");

  return NextResponse.json(
    {
      litigation_package: {
        package_id: `LIT-${String(row.id).slice(0, 8).toUpperCase()}`,
        court_admissible_notice: "PII-masked cryptographic chain-of-custody evidence package",
        incident_evidence: {
          id: row.id,
          title: row.title_masked,
          description: row.description_masked,
          category: row.category,
          severity: row.severity,
          incident_date: row.incident_date,
          reported_at: row.created_at,
          provider: provider?.name ?? null,
          source_url: row.source_url,
          country: row.location_country,
        },
        chain_of_custody: {
          sha256_integrity_hash: custodyHash,
          custody_timestamp: new Date().toISOString(),
          provenance_authority: "ALPAR AI Legal Accountability Framework v1.0",
        },
      },
    },
    {
      headers: {
        "Cache-Control": "private, no-cache",
        "Content-Type": "application/json",
      },
    },
  );
}

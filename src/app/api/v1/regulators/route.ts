import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";
import { hashIp } from "@/lib/utils/hash";

const VALID_AUTHORITIES = [
  "eu-ai-office",
  "uk-aisi",
  "us-aisi",
  "tubitak-yze",
  "j-aisi",
  "sg-imda",
  "ca-aisi",
  "oecd-ai",
] as const;
type Authority = (typeof VALID_AUTHORITIES)[number];

const AUTHORITY_LABELS: Record<Authority, string> = {
  "eu-ai-office": "EU AI Office (EU AI Act Article 73)",
  "uk-aisi": "UK AI Safety Institute",
  "us-aisi": "US AI Safety Institute (NIST)",
  "tubitak-yze": "TÜBİTAK Yapay Zeka Enstitüsü (TR Ulusal YZ Stratejisi)",
  "j-aisi": "Japan AI Safety Institute (J-AISI)",
  "sg-imda": "Singapore AI Verify Foundation (IMDA)",
  "ca-aisi": "Canadian AI Safety Institute (AIDA)",
  "oecd-ai": "OECD AI Policy Observatory (OECD.AI)",
};

export async function GET(request: Request) {
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
  const authority = searchParams.get("authority") as Authority | null;
  const format = searchParams.get("format") ?? "json";
  const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 200);

  if (authority && !VALID_AUTHORITIES.includes(authority)) {
    return NextResponse.json(
      { error: `authority must be one of: ${VALID_AUTHORITIES.join(", ")}` },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("incidents")
    .select(
      `
      id, title_masked, description_masked, category, severity,
      incident_date, created_at, source_url, location_country,
      eu_act_risk_category, eu_act_serious_incident_class,
      eu_act_reporting_deadline_days,
      ai_providers:ai_provider_id ( name, slug )
    `,
    )
    .eq("status", "published")
    .not("eu_act_risk_category", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  const incidents = (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const provider = r.ai_providers as { name: string; slug: string } | null;
    return {
      id: r.id,
      title: r.title_masked,
      description: r.description_masked,
      category: r.category,
      severity: r.severity,
      incident_date: r.incident_date,
      reported_at: r.created_at,
      source_url: r.source_url,
      country: r.location_country,
      provider: provider?.name ?? null,
      eu_ai_act: {
        risk_category: r.eu_act_risk_category,
        serious_incident_class: r.eu_act_serious_incident_class,
        reporting_deadline_days: r.eu_act_reporting_deadline_days,
      },
      alpar_provenance: "ALPAR AI Trust Infrastructure",
      passport_url: `https://alparai.com/incidents/${r.id}`,
    };
  });

  if (format === "rss") {
    const authorityLabel = authority ? AUTHORITY_LABELS[authority] : "All Regulators";
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>ALPAR AI — Regulator Feed (${authorityLabel})</title>
    <link>https://alparai.com</link>
    <description>EU AI Act Article 73 compliant AI safety incident feed for regulatory authorities.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${incidents
      .map(
        (inc) => `
    <item>
      <title><![CDATA[${inc.title}]]></title>
      <link>${inc.passport_url}</link>
      <guid>${inc.id}</guid>
      <pubDate>${new Date(String(inc.reported_at)).toUTCString()}</pubDate>
      <description><![CDATA[${inc.description}]]></description>
      <dc:subject>${inc.category}</dc:subject>
    </item>`,
      )
      .join("")}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  }

  return NextResponse.json(
    {
      authority: authority ?? "all",
      authority_label: authority ? AUTHORITY_LABELS[authority] : "All Regulators",
      compliance_framework: "EU AI Act Article 73",
      generated_at: new Date().toISOString(),
      count: incidents.length,
      incidents,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "Content-Type": "application/json",
      },
    },
  );
}

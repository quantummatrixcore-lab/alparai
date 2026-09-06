import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const KNOWN_SCORES: Record<string, { name: string; score: number }> = {
  openai: { name: "OpenAI", score: 94 },
  anthropic: { name: "Anthropic", score: 96 },
  google: { name: "Google Gemini", score: 93 },
  meta: { name: "Meta Llama", score: 89 },
  mistral: { name: "Mistral AI", score: 91 },
  alpar: { name: "ALPAR AI", score: 99 },
};

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderSvgWidget(providerName: string, score: number): string {
  const boundedScore = Math.max(0, Math.min(100, Math.round(score)));

  let badgeBg = "#10b981";
  if (boundedScore >= 90) {
    badgeBg = "#10b981";
  } else if (boundedScore >= 70) {
    badgeBg = "#3b82f6";
  } else if (boundedScore >= 50) {
    badgeBg = "#f59e0b";
  } else {
    badgeBg = "#ef4444";
  }

  const safeProviderName = escapeXml(
    providerName.length > 12 ? `${providerName.slice(0, 11)}…` : providerName,
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="36" viewBox="0 0 280 36" fill="none" role="img" aria-label="ALPAR Trust Score: ${boundedScore}">
  <title>ALPAR Trust Score: ${boundedScore}</title>
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${badgeBg}"/>
      <stop offset="100%" stop-color="${badgeBg}dd"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>

  <rect width="280" height="36" rx="8" fill="url(#bgGrad)" stroke="#334155" stroke-width="1"/>
  <circle cx="18" cy="18" r="5" fill="#38bdf8"/>
  <text x="30" y="22" fill="#f8fafc" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" letter-spacing="0.2">ALPAR Trust Score</text>
  <line x1="145" y1="8" x2="145" y2="28" stroke="#334155" stroke-width="1"/>
  <text x="155" y="22" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500">${safeProviderName}</text>
  <rect x="222" y="6" width="50" height="24" rx="6" fill="url(#scoreGrad)" filter="url(#shadow)"/>
  <text x="247" y="22" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" text-anchor="middle">${boundedScore}</text>
</svg>`;
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const param = searchParams.get("provider") || searchParams.get("p") || "openai";
  const slug = param.toLowerCase().trim();

  let score: number | null = null;
  let providerName = "";

  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("ai_providers")
      .select("id, name, trust_score")
      .eq("slug", slug)
      .maybeSingle();

    if (data) {
      providerName = data.name;
      if (typeof data.trust_score === "number" && !isNaN(data.trust_score)) {
        score = Math.round(data.trust_score);
      } else {
        const { count } = await supabase
          .from("incidents")
          .select("id", { count: "exact", head: true })
          .eq("ai_provider_id", data.id)
          .eq("status", "published");

        const incidents = count ?? 0;
        score = Math.max(0, Math.min(100, Math.round(99 - incidents * 0.5)));
      }
    }
  } catch {
    // Ignore DB errors during static optimization or offline fallback
  }

  if (score === null) {
    const fallback = KNOWN_SCORES[slug];
    if (fallback) {
      providerName = fallback.name;
      score = fallback.score;
    } else {
      providerName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "Provider";
      score = 85;
    }
  }

  const svg = renderSvgWidget(providerName, score);

  return new NextResponse(svg, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}

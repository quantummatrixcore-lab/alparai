import "server-only";
import { NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";

const ALLOWED_ORIGINS = [
  "https://alparai.com",
  "https://www.alparai.com",
  ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000"] : []),
];

function corsHeaders(origin: string | null) {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : (ALLOWED_ORIGINS[0] ?? "*");
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.api_general}:${ip}`);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "rate_limited", retryAfter: rl.retryAfter },
        { status: 429, headers: corsHeaders(origin) },
      );
    }

    return NextResponse.json(
      {
        framework: "EU AI Act (Regulation EU 2024/1689)",
        version: "2024.1",
        riskTiers: [
          {
            tier: "Unacceptable Risk",
            articles: ["Article 5"],
            description: "Prohibited AI practices (e.g. cognitive behavioral manipulation, social scoring, biometric categorization).",
            status: "Enforced since Feb 2025",
          },
          {
            tier: "High-Risk AI Systems",
            articles: ["Article 6", "Article 72", "Article 73"],
            description: "Systems in critical infrastructure, employment, essential services, and law enforcement.",
            incidentReportingDeadlineHours: 72,
            passportExportEndpoint: "/api/v1/compliance/article50",
          },
          {
            tier: "Specific Transparency Risk",
            articles: ["Article 50"],
            description: "Generative AI systems must detect and label AI-generated synthetic content.",
            provenanceEndpoint: "/api/v1/provenance",
          },
          {
            tier: "Minimal / No Risk",
            description: "AI-enabled video games or spam filters freely allowed with voluntary codes of conduct.",
          },
        ],
        documentationUrl: "https://alparai.com/ai-act",
        supportEmail: "compliance@alparai.com",
      },
      {
        status: 200,
        headers: {
          ...corsHeaders(origin),
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}

let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try {
  vault = require("@/lib/security/vault").vault;
} catch {
  /* stub bicimi korunur */
}
import "server-only";
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/dehost/server";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { logger } from "@/lib/utils/logger";

const ALLOWED_ORIGINS = [
  "https://alparai.com",
  "https://www.alparai.com",
  ...((vault.read("NODE_ENV") ?? process.env.NODE_ENV) === "development"
    ? ["http://localhost:3000"]
    : []),
];

function corsHeaders(origin: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

export async function GET(request: NextRequest) {
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const origin = request.headers.get("origin");
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.api_general}:${ip}`);

    if (!rl.ok) {
      return NextResponse.json(
        { error: "rate_limited", retryAfter: rl.retryAfter },
        {
          status: 429,
          headers: {
            ...corsHeaders(origin),
            "Retry-After": rl.retryAfter?.toString() ?? "60",
            "X-RateLimit-Limit": rl.limit?.toString() ?? "100",
            "X-RateLimit-Remaining": rl.remaining?.toString() ?? "0",
            "X-RateLimit-Reset": rl.retryAfter?.toString() ?? "60",
          },
        },
      );
    }

    const dehost = await createServerClient();

    // The `provider_leaderboard` VIEW is the single source of truth: it joins
    // `ai_providers` with the published `incidents` (and provider responses)
    // and exposes `incident_count` / `response_count` / `response_rate`.
    //
    // The previous implementation selected `ai_providers` directly and never
    // requested the count columns, while the response mapper still read them
    // — so the public API reported `incident_count: 0` for every provider
    // while the leaderboard page (which uses this view) showed the real
    // numbers. API and page disagreed about the same data.
    const { data, error } = await dehost
      .from("provider_leaderboard" as never)
      .select(
        "id, slug, name, logo_url, is_verified, website_url, trust_score, incident_count, response_count, response_rate",
      )
      .order("trust_score", { ascending: false });

    if (error) {
      logger.error(
        "API v1 leaderboard error",
        undefined,
        error instanceof Error ? error : undefined,
      );
      return NextResponse.json(
        { error: "internal_error" },
        { status: 500, headers: corsHeaders(origin) },
      );
    }

    const sorted = (
      (data ?? []) as Array<{
        id: string | null;
        slug: string | null;
        name: string | null;
        logo_url: string | null;
        is_verified: boolean | null;
        website_url: string | null;
        trust_score: number | null;
        incident_count?: number | null;
        response_count?: number | null;
        response_rate?: number | null;
      }>
    )
      .sort((a, b) => {
        const scoreA = a.trust_score ?? 70;
        const scoreB = b.trust_score ?? 70;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (a.incident_count ?? 0) - (b.incident_count ?? 0);
      })
      .map((p, idx) => {
        const total = Number(p.incident_count ?? 0);
        const responded = Number(p.response_count ?? 0);
        // A provider with zero incidents has NO response rate — reporting 0%
        // would falsely imply "they answered none of our complaints".
        const responseRate =
          total > 0
            ? typeof p.response_rate === "number"
              ? Math.round(p.response_rate)
              : Math.round((responded / total) * 100)
            : null;
        return {
          rank: idx + 1,
          id: p.id ?? "",
          slug: p.slug ?? "",
          name: p.name ?? "Unknown",
          logo_url: p.logo_url ?? null,
          is_verified: !!p.is_verified,
          website_url: p.website_url ?? null,
          trust_score: p.trust_score ?? 70,
          incident_count: total,
          response_count: responded,
          response_rate: responseRate,
        };
      });

    return NextResponse.json(
      {
        data: sorted,
        meta: {
          total: sorted.length,
          generated_at: new Date().toISOString(),
          docs: "https://alparai.com/api-docs",
        },
      },
      {
        status: 200,
        headers: {
          ...corsHeaders(origin),
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
          "X-RateLimit-Limit": rl.limit?.toString() ?? "100",
          "X-RateLimit-Remaining": rl.remaining?.toString() ?? "100",
          "X-RateLimit-Reset": rl.retryAfter?.toString() ?? "0",
        },
      },
    );
  } catch (err) {
    logger.error(
      "API v1 leaderboard unhandled error",
      undefined,
      err instanceof Error ? err : undefined,
    );
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
export const runtime = "nodejs";

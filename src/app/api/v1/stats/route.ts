import "server-only";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";
import { logger } from "@/lib/utils/logger";

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
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
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

  const supabase = await createServerClient();

  const [incidentsCountResult, providersResult, categoriesResult] = await Promise.all([
    supabase
      .from("incidents")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase.from("ai_providers").select("trust_score"),
    supabase.from("incidents").select("category").eq("status", "published"),
  ]);

  if (incidentsCountResult.error || providersResult.error || categoriesResult.error) {
    logger.error("API v1 stats error", {
      incidentsError: incidentsCountResult.error?.message,
      providersError: providersResult.error?.message,
      categoriesError: categoriesResult.error?.message,
    });
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500, headers: corsHeaders(origin) },
    );
  }

  const totalIncidents = incidentsCountResult.count ?? 0;
  const totalProviders = providersResult.data?.length ?? 0;

  let averageTrustScore = 0;
  if (totalProviders > 0 && providersResult.data) {
    const sum = providersResult.data.reduce((acc, curr) => acc + (curr.trust_score ?? 0), 0);
    averageTrustScore = parseFloat((sum / totalProviders).toFixed(2));
  }

  const byCategory: Record<string, number> = {};
  if (categoriesResult.data) {
    for (const item of categoriesResult.data as Array<{ category: string }>) {
      const cat = item.category || "unknown";
      byCategory[cat] = (byCategory[cat] ?? 0) + 1;
    }
  }

  return NextResponse.json(
    {
      data: {
        total_incidents: totalIncidents,
        total_providers: totalProviders,
        average_trust_score: averageTrustScore,
        by_category: byCategory,
      },
      meta: { generated_at: new Date().toISOString() },
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
}

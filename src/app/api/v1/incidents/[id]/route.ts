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
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const origin = request.headers.get("origin");
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.api_general}:${ip}`);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited", retryAfter: rl.retryAfter },
      { status: 429, headers: corsHeaders(origin) },
    );
  }

  const { id } = await params;
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("incidents")
    .select(
      "id, title_masked, description_masked, severity, status, category, is_anonymous, incident_date, views_count, upvotes_count, created_at, ai_provider_id, cross_audit_truth_score, cross_audit_confidence, ai_models(name), is_expert, expert_fix",
    )
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    logger.error("API v1 incident by id error", { id }, error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
  if (!data) {
    return NextResponse.json({ error: "not_found" }, { status: 404, headers: corsHeaders(origin) });
  }

  const row = data as Record<string, unknown>;
  return NextResponse.json(
    {
      data: {
        id: row["id"],
        title: row["title_masked"],
        description: row["description_masked"],
        severity: row["severity"],
        category: row["category"],
        is_anonymous: row["is_anonymous"] ?? false,
        incident_date: row["incident_date"],
        views: row["views_count"] ?? 0,
        upvotes: row["upvotes_count"] ?? 0,
        model: (row["ai_models"] as { name: string } | null)?.name ?? null,
        truth_score: row["cross_audit_truth_score"] ?? null,
        confidence: row["cross_audit_confidence"] ?? null,
        verification_level: row["is_expert"] ? "expert" : "community",
        expert_fix: row["expert_fix"] ?? null,
        created_at: row["created_at"],
      },
    },
    {
      status: 200,
      headers: {
        ...corsHeaders(origin),
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}

import { type NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { rateLimit } from "@/lib/rate-limit";

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

export async function GET(request: NextRequest) {
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.api_general}:${ip}`);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "rate_limited", retryAfter: rl.retryAfter },
        { status: 429 },
      );
    }

    const apiKey = request.headers.get("x-api-key");
    const validKey = process.env.PUBLIC_API_KEY;

    if (!validKey || !apiKey || !safeCompare(apiKey, validKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Getting approved incidents with strict public projection (Zero PII leakage)
    const { data: rawIncidents, error } = await supabase
      .from("incidents")
      .select(
        "id, title_masked, description_masked, category, severity, status, incident_date, views_count, upvotes_count, cross_audit_truth_score, cross_audit_confidence, ai_provider_id, ai_model_id, is_expert, expert_fix, created_at, published_at, source_url",
      )
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 });
    }

    const incidents = (rawIncidents || []).map((row) => ({
      id: row.id,
      title: row.title_masked ?? "",
      description: row.description_masked ?? "",
      category: row.category,
      severity: row.severity,
      status: row.status,
      incident_date: row.incident_date,
      views_count: row.views_count,
      upvotes_count: row.upvotes_count,
      cross_audit_truth_score: row.cross_audit_truth_score,
      cross_audit_confidence: row.cross_audit_confidence,
      ai_provider_id: row.ai_provider_id,
      ai_model_id: row.ai_model_id,
      is_expert: row.is_expert,
      expert_fix: row.expert_fix,
      created_at: row.created_at,
      published_at: row.published_at,
      source_url: row.source_url,
    }));

    return NextResponse.json({
      data: incidents,
      count: incidents.length,
    });
  } catch (_err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function OPTIONS(_request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    },
  });
}

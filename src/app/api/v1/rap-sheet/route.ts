import "server-only";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireModerator } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";
import { hashIp } from "@/lib/utils/hash";
import { logger } from "@/lib/utils/logger";

export async function GET(request: Request) {
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const ipHash = hashIp(ip);

    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.api_general}:${ipHash}`);
    if (!rl.ok) {
      return NextResponse.json({ error: `Rate limited. Retry in ${rl.retryAfter}s.` }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entity_type");
    const severity = searchParams.get("severity");
    const providerId = searchParams.get("provider_id");
    const isActive = searchParams.get("is_active") !== "false";
    const limit = Math.min(Number(searchParams.get("limit") ?? "25"), 100);
    const offset = Math.max(Number(searchParams.get("offset") ?? "0"), 0);

    const supabase = createAdminClient() as any;
    let query: any = supabase
      .from("ai_rap_sheet_entries")
      .select(`
        id,
        case_id,
        incident_id,
        entity_type,
        entity_name,
        provider_id,
        model_id,
        user_id,
        violation_category,
        offense_summary,
        evidence_urls,
        severity,
        penalty_type,
        penalty_details,
        listed_at,
        is_active,
        appeal_status
      `, { count: "exact" });

    if (isActive) query = query.eq("is_active", true);
    if (entityType) query = query.eq("entity_type", entityType);
    if (severity) query = query.eq("severity", severity);
    if (providerId) query = query.eq("provider_id", providerId);

    const { data, count, error } = await query
      .order("listed_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error("Error fetching AI Rap Sheet entries:", undefined, error);
      return NextResponse.json({ error: "Failed to fetch rap sheet" }, { status: 500 });
    }

    return NextResponse.json(
      {
        entries: data ?? [],
        total: count ?? 0,
        limit,
        offset,
        generated_at: new Date().toISOString()
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
        }
      }
    );
  } catch (err) {
    logger.error("AI Rap Sheet GET exception:", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireModerator();
    const body = await request.json();
    const {
      entity_type,
      entity_name,
      provider_id,
      model_id,
      user_id,
      case_id,
      incident_id,
      violation_category,
      offense_summary,
      evidence_urls,
      severity,
      penalty_type,
      penalty_details
    } = body;

    if (!entity_name || !offense_summary) {
      return NextResponse.json({ error: "entity_name and offense_summary are required" }, { status: 400 });
    }

    const supabase = createAdminClient() as any;
    const { data, error } = await supabase
      .from("ai_rap_sheet_entries")
      .insert([{
        entity_type: entity_type || "model",
        entity_name,
        provider_id: provider_id || null,
        model_id: model_id || null,
        user_id: user_id || null,
        case_id: case_id || null,
        incident_id: incident_id || null,
        violation_category: violation_category || "safety_policy_breach",
        offense_summary,
        evidence_urls: Array.isArray(evidence_urls) ? evidence_urls : [],
        severity: severity || "medium",
        penalty_type: penalty_type || "public_censure",
        penalty_details: penalty_details || null,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      logger.error("Error creating AI Rap Sheet entry:", undefined, error);
      return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
    }

    logger.info(`AI Rap Sheet entry created: ${data.id} for ${entity_name}`);
    return NextResponse.json({ success: true, entry: data }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden. Moderator privilege required." }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

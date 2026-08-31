import "server-only";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
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
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);
    const offset = Math.max(Number(searchParams.get("offset") ?? "0"), 0);

    const supabase = createAdminClient() as any;
    let query: any = supabase
      .from("jury_cases")
      .select(`
        id,
        title,
        description,
        incident_id,
        category,
        status,
        target_provider_id,
        target_model_id,
        target_user_id,
        created_by,
        quorum_required,
        guilty_score,
        innocent_score,
        abstain_score,
        resolution_verdict,
        resolution_summary,
        resolved_at,
        created_at,
        updated_at
      `, { count: "exact" });

    if (status) query = query.eq("status", status);
    if (category) query = query.eq("category", category);

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error("Error fetching Agora-T cases:", undefined, error);
      return NextResponse.json({ error: "Failed to fetch jury cases" }, { status: 500 });
    }

    return NextResponse.json({
      cases: data ?? [],
      total: count ?? 0,
      limit,
      offset,
    });
  } catch (err) {
    logger.error("Agora-T GET cases API exception:", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Proof of Human required." }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, incident_id, target_provider_id, target_model_id, target_user_id, quorum_required } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
    }

    const supabase = createAdminClient() as any;

    const { data: rep } = await supabase
      .from("user_reputation")
      .select("trust_level, is_sybil_suspect")
      .eq("user_id", user.id)
      .maybeSingle();

    if (rep?.is_sybil_suspect || rep?.trust_level === "banned") {
      return NextResponse.json({ error: "Action blocked by Anti-Sybil security policy." }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("jury_cases")
      .insert([{
        title,
        description,
        category: category ?? "model_safety_violation",
        incident_id: incident_id || null,
        target_provider_id: target_provider_id || null,
        target_model_id: target_model_id || null,
        target_user_id: target_user_id || null,
        created_by: user.id,
        quorum_required: quorum_required ? Math.max(3, Number(quorum_required)) : 5,
        status: "open"
      }])
      .select()
      .single();

    if (error) {
      logger.error("Error creating Agora-T case:", undefined, error);
      return NextResponse.json({ error: "Failed to create jury case" }, { status: 500 });
    }

    logger.info(`Agora-T case created: ${data.id} by user ${user.id}`);
    return NextResponse.json({ success: true, case: data }, { status: 201 });
  } catch (err) {
    logger.error("Agora-T POST cases API exception:", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

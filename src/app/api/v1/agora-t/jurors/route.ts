import "server-only";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireModerator } from "@/lib/auth/session";
import { logger } from "@/lib/utils/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get("case_id");
    const supabase = createAdminClient() as any;

    if (caseId) {
      const { data, error } = await supabase
        .from("jurors")
        .select(`
          juror_id,
          selection_method,
          has_voted,
          assigned_at,
          reputation:user_reputation!jurors_juror_id_fkey(reputation_score, trust_level)
        `)
        .eq("case_id", caseId);

      if (error) {
        return NextResponse.json({ error: "Failed to fetch jurors" }, { status: 500 });
      }
      return NextResponse.json({ jurors: data ?? [] });
    }

    // List top trusted citizen candidates
    const { data: candidates, error: candErr } = await supabase
      .from("user_reputation")
      .select("user_id, reputation_score, trust_level, is_verified_citizen")
      .eq("is_sybil_suspect", false)
      .gte("reputation_score", 50)
      .order("reputation_score", { ascending: false })
      .limit(30);

    if (candErr) {
      return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
    }

    return NextResponse.json({ candidates: candidates ?? [] });
  } catch (err) {
    logger.error("Agora-T GET jurors exception:", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireModerator();
    const body = await request.json();
    const { case_id, juror_ids, selection_method } = body;

    if (!case_id || !Array.isArray(juror_ids) || juror_ids.length === 0) {
      return NextResponse.json({ error: "case_id and non-empty juror_ids array required" }, { status: 400 });
    }

    const supabase = createAdminClient() as any;
    const assignments = juror_ids.map((id: string) => ({
      case_id,
      juror_id: id,
      selection_method: selection_method || "reputation_weighted"
    }));

    const { data, error } = await supabase
      .from("jurors")
      .upsert(assignments, { onConflict: "case_id,juror_id" })
      .select();

    if (error) {
      logger.error("Error assigning jurors:", undefined, error);
      return NextResponse.json({ error: "Failed to assign jurors" }, { status: 500 });
    }

    // Update case status to 'voting'
    await supabase.from("jury_cases").update({ status: "voting" }).eq("id", case_id);

    return NextResponse.json({ success: true, assigned_jurors: data });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden. Moderator privilege required." }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

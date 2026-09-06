import "server-only";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireModerator } from "@/lib/auth/session";
import { logger } from "@/lib/utils/logger";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient() as any;

    const { data: juryCase, error: caseErr } = await supabase
      .from("jury_cases")
      .select(`
        *,
        jurors:jurors (
          juror_id,
          selection_method,
          has_voted,
          assigned_at
        ),
        votes:jury_votes (
          id,
          juror_id,
          vote_decision,
          vote_weight,
          rationale,
          created_at
        )
      `)
      .eq("id", id)
      .single();

    if (caseErr || !juryCase) {
      return NextResponse.json({ error: "Jury case not found" }, { status: 404 });
    }

    return NextResponse.json({ case: juryCase });
  } catch (err) {
    logger.error("Agora-T GET case by ID exception:", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireModerator();
    const { id } = await params;
    const body = await request.json();
    const { status, resolution_summary, category } = body;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (resolution_summary) updates.resolution_summary = resolution_summary;
    if (category) updates.category = category;

    const supabase = createAdminClient() as any;
    const { data, error } = await supabase
      .from("jury_cases")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("Error updating Agora-T case:", undefined, error);
      return NextResponse.json({ error: "Failed to update case" }, { status: 500 });
    }

    return NextResponse.json({ success: true, case: data });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden. Moderator privilege required." }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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

    const { data, error } = await supabase
      .from("ai_rap_sheet_entries")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Rap Sheet entry not found" }, { status: 404 });
    }

    return NextResponse.json({ entry: data });
  } catch (err) {
    logger.error("AI Rap Sheet GET entry by ID exception:", undefined, err instanceof Error ? err : undefined);
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
    const { appeal_status, appeal_notes, is_active, penalty_details } = body;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (appeal_status) updates.appeal_status = appeal_status;
    if (appeal_notes !== undefined) updates.appeal_notes = appeal_notes;
    if (is_active !== undefined) updates.is_active = is_active;
    if (penalty_details !== undefined) updates.penalty_details = penalty_details;

    const supabase = createAdminClient() as any;
    const { data, error } = await supabase
      .from("ai_rap_sheet_entries")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update Rap Sheet entry" }, { status: 500 });
    }

    return NextResponse.json({ success: true, entry: data });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden. Moderator privilege required." }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

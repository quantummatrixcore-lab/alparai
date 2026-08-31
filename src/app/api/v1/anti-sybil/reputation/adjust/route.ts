import "server-only";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireModerator } from "@/lib/auth/session";
import { logger } from "@/lib/utils/logger";

export async function POST(request: Request) {
  try {
    const mod = await requireModerator();
    const body = await request.json();
    const { user_id, change_amount, reason, action_type } = body;

    if (!user_id || typeof change_amount !== "number" || !reason) {
      return NextResponse.json({ error: "user_id, numeric change_amount, and reason are required" }, { status: 400 });
    }

    const supabase = createAdminClient() as any;
    const { data, error } = await supabase.rpc("adjust_user_reputation_rpc", {
      p_user_id: user_id,
      p_change_amount: change_amount,
      p_reason: reason,
      p_action_type: action_type || "manual_moderation_adjustment",
      p_triggered_by: mod.id
    });

    if (error) {
      logger.error("Error adjusting reputation RPC:", undefined, error);
      return NextResponse.json({ error: error.message || "Failed to adjust reputation" }, { status: 500 });
    }

    logger.info(`Reputation adjusted for user ${user_id} by ${mod.id}: ${change_amount} (Reason: ${reason})`);
    return NextResponse.json({
      success: true,
      result: data
    });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden. Moderator privilege required." }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

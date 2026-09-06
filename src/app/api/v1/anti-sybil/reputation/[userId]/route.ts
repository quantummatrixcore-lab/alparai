import "server-only";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { logger } from "@/lib/utils/logger";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const currentUser = await getCurrentUser();
    const supabase = createAdminClient() as any;

    // Get user reputation
    const { data: rep, error: repErr } = await supabase
      .from("user_reputation")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (repErr) {
      return NextResponse.json({ error: "Failed to fetch user reputation" }, { status: 500 });
    }

    // Default neutral reputation if record not initialized yet
    const reputation = rep ?? {
      user_id: userId,
      reputation_score: 50,
      is_sybil_suspect: false,
      sybil_risk_score: 0,
      trust_level: "neutral",
      voucher_count: 0,
      is_verified_citizen: false
    };

    // If own profile or admin/moderator, also fetch reputation history logs
    let logs: any[] = [];
    if (currentUser?.id === userId || currentUser?.role === "admin" || currentUser?.role === "moderator") {
      const { data: logsData } = await supabase
        .from("reputation_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      logs = logsData ?? [];
    }

    return NextResponse.json({
      reputation,
      history: logs
    });
  } catch (err) {
    logger.error("Anti-Sybil GET reputation exception:", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import "server-only";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireModerator } from "@/lib/auth/session";
import { logger } from "@/lib/utils/logger";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireModerator();
    const { id: caseId } = await params;
    const supabase = createAdminClient() as any;

    // Call atomic resolution RPC
    const { data, error } = await supabase.rpc("resolve_agora_case_rpc", {
      p_case_id: caseId
    });

    if (error) {
      logger.error("Error executing resolve_agora_case_rpc:", undefined, error);
      return NextResponse.json({ error: error.message || "Failed to resolve case" }, { status: 500 });
    }

    logger.info(`Agora-T Case ${caseId} resolved with verdict: ${data?.verdict}`);
    return NextResponse.json({
      success: true,
      resolution: data
    });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden. Moderator privilege required." }, { status: 403 });
    }
    logger.error("Agora-T POST resolve API exception:", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

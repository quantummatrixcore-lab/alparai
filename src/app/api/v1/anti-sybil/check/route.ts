import "server-only";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";
import { hashIp } from "@/lib/utils/hash";
import { logger } from "@/lib/utils/logger";

export async function POST(request: Request) {
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
    const ipHash = hashIp(ip);

    const body = await request.json();
    const { fingerprint, user_id } = body;

    if (!fingerprint) {
      return NextResponse.json({ error: "Fingerprint is required for Anti-Sybil evaluation" }, { status: 400 });
    }

    const supabase = createAdminClient() as any;

    // Call evaluate_sybil_risk_rpc
    const { data, error } = await supabase.rpc("evaluate_sybil_risk_rpc", {
      p_fingerprint: fingerprint,
      p_ip_hash: ipHash,
      p_user_id: user_id || null
    });

    if (error) {
      logger.error("Error evaluating sybil risk RPC:", undefined, error);
      return NextResponse.json({ error: "Sybil analysis failed" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      evaluation: data
    });
  } catch (err) {
    logger.error("Anti-Sybil check API exception:", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

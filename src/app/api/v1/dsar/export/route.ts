import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json(
        { error: "unauthorized", message: "Authentication required" },
        { status: 401 },
      );
    }

    const userId = user.id;
    const adminClient = createAdminClient();

    // 1. Log the DSAR Request in the database
    const { data: dsarRequest, error: dsarErr } = await adminClient
      .from("dsar_requests")
      .insert({
        user_id: userId,
        status: "completed", // Instantly generated and exported
      })
      .select()
      .single();

    if (dsarErr) {
      logger.error("Failed to log DSAR request", { userId }, dsarErr);
    }

    // 2. Fetch User Profile
    const { data: profile } = await adminClient
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    // 3. Fetch User Incidents
    const { data: incidents } = await adminClient
      .from("incidents")
      .select("*")
      .eq("user_id", userId);

    // 4. Fetch User Comments
    const { data: comments } = await adminClient
      .from("incident_comments")
      .select("*")
      .eq("user_id", userId);

    // 5. Fetch User Votes
    const { data: votes } = await adminClient
      .from("incident_votes")
      .select("*")
      .eq("user_id", userId);

    // 6. Fetch Expert Applications
    const { data: expertApplications } = await adminClient
      .from("expert_applications")
      .select("*")
      .eq("id", userId);

    // Combine everything into GDPR / KVKK machine-readable export format
    const exportData = {
      export_meta: {
        platform: "ALPAR AI",
        legal_basis: "GDPR Article 15 / KVKK Article 11 DSAR Export",
        generated_at: new Date().toISOString(),
        request_id: dsarRequest?.id || "local-bypass",
        sla_due_date:
          dsarRequest?.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      user_identity: {
        id: userId,
        email: user.email,
        phone: user.phone || null,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at || null,
      },
      profile: profile || null,
      incidents: incidents || [],
      comments: comments || [],
      votes: votes || [],
      expert_applications: expertApplications || [],
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="dsar-export-${userId}.json"`,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error: unknown) {
    logger.error("DSAR Export API Error", undefined, error instanceof Error ? error : undefined);
    return NextResponse.json(
      {
        error: "internal_error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

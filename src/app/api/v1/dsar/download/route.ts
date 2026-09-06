import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";

    const userId = user.id;
    const adminClient = createAdminClient();

    // 1. Log the DSAR Request
    await adminClient.from("dsar_requests").insert({
      user_id: userId,
      status: "completed",
    });

    // 2. Fetch User Data
    const { data: profile } = await adminClient
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    const { data: incidents } = await adminClient
      .from("incidents")
      .select("*")
      .eq("user_id", userId);
    const { data: comments } = await adminClient
      .from("incident_comments")
      .select("*")
      .eq("user_id", userId);
    const { data: votes } = await adminClient
      .from("incident_votes")
      .select("*")
      .eq("user_id", userId);

    const filename = `alpar-ai-dsar-${userId}.${format}`;

    if (format === "csv") {
      // Generate a flattened CSV representation of the profile and main metrics
      let csvContent = "Section,Id,Field,Value,Created At\n";

      // User identity
      csvContent += `Identity,${userId},email,${user.email || ""},${user.created_at || ""}\n`;

      // Profile
      if (profile) {
        Object.entries(profile).forEach(([key, val]) => {
          csvContent += `Profile,${userId},${key},"${String(val || "").replace(/"/g, '""')}",\n`;
        });
      }

      // Incidents
      (incidents || []).forEach(
        (inc: { id: string; title_masked: string | null; created_at: string | null }) => {
          csvContent += `Incident,${inc.id},title,"${String(inc.title_masked || "").replace(/"/g, '""')}",${inc.created_at || ""}\n`;
        },
      );

      // Comments
      (comments || []).forEach(
        (c: { id: string; comment_text: string; created_at: string | null }) => {
          csvContent += `Comment,${c.id},content,"${String(c.comment_text || "").replace(/"/g, '""')}",${c.created_at || ""}\n`;
        },
      );

      // Votes
      (votes || []).forEach((v: { id: string; incident_id: string; created_at: string | null }) => {
        csvContent += `Vote,${v.id},incident_id,${v.incident_id || ""},${v.created_at || ""}\n`;
      });

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // Default JSON format
    const exportData = {
      user_id: userId,
      email: user.email,
      generated_at: new Date().toISOString(),
      profile: profile || null,
      incidents: incidents || [],
      comments: comments || [],
      votes: votes || [],
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    logger.error("DSAR Download API Error", undefined, error instanceof Error ? error : undefined);
    return NextResponse.json(
      {
        error: "internal_error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

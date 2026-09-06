import "server-only";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
    const format = searchParams.get("format") ?? "json";

    const supabase = createAdminClient() as any;
    const { data, error } = await supabase
      .from("ai_rap_sheet_entries")
      .select("*")
      .eq("is_active", true)
      .order("listed_at", { ascending: false })
      .limit(1000);

    if (error) {
      return NextResponse.json({ error: "Failed to export Rap Sheet data" }, { status: 500 });
    }

    if (format === "csv") {
      const headersCsv = "id,entity_type,entity_name,violation_category,severity,penalty_type,listed_at,offense_summary\n";
      const rows = ((data as any[]) ?? []).map((row: any) => {
        const cleanSummary = (row.offense_summary || "").replace(/"/g, '""');
        return `"${row.id}","${row.entity_type}","${row.entity_name}","${row.violation_category}","${row.severity}","${row.penalty_type}","${row.listed_at}","${cleanSummary}"`;
      }).join("\n");

      return new Response(headersCsv + rows, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="alparai_ai_rap_sheet_${new Date().toISOString().slice(0, 10)}.csv"`,
          "Cache-Control": "public, s-maxage=300"
        }
      });
    }

    return NextResponse.json({
      export_version: "2026.1",
      license: "AlparAI Open Safety Telemetry License",
      exported_at: new Date().toISOString(),
      count: data?.length ?? 0,
      records: data ?? []
    }, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300"
      }
    });
  } catch (err) {
    logger.error("AI Rap Sheet Export exception:", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

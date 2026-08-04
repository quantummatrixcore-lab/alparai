import "server-only";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "json";
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "500", 10), 1000);

  const supabase = await createServerClient();
  const { data: incidents, error } = await supabase
    .from("incidents")
    .select(
      `
      id,
      title_masked,
      description_masked,
      severity,
      category,
      eu_act_risk_category,
      eu_act_serious_incident_class,
      created_at
    `,
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: "failed_to_fetch_dataset" }, { status: 500 });
  }

  if (format === "csv") {
    const headers = "id,title,severity,category,eu_risk_category,created_at\n";
    const rows = (incidents || [])
      .map((i) =>
        [
          i.id,
          `"${(i.title_masked || "").replace(/"/g, '""')}"`,
          i.severity,
          i.category,
          i.eu_act_risk_category || "",
          i.created_at,
        ].join(","),
      )
      .join("\n");

    return new NextResponse(headers + rows, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="alpar_ai_incidents_dataset.csv"`,
      },
    });
  }

  return NextResponse.json({
    license: "AGPL-3.0 / Open Data Commons",
    provider: "ALPAR AI Public Incident Registry",
    total_records: incidents?.length || 0,
    dataset: incidents,
    exported_at: new Date().toISOString(),
  });
}

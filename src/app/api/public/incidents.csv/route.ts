import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const revalidate = 600; // 10 min cache

export async function GET() {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("incidents")
    .select(
      "id, title_masked, description_masked, provider_custom_name, severity, created_at, source_url, ai_providers(name)",
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error || !data) {
    return new NextResponse("Error generating CSV", { status: 500 });
  }

  const headers = ["id", "title", "vendor", "severity", "created_at", "source_url", "description"];
  const rows = data.map((item) => [
    `"${item.id}"`,
    `"${(item.title_masked || "").replace(/"/g, '""')}"`,
    `"${(item.ai_providers?.name || item.provider_custom_name || "Unknown").replace(/"/g, '""')}"`,
    `"${item.severity || ""}"`,
    `"${item.created_at || ""}"`,
    `"${(item.source_url || "").replace(/"/g, '""')}"`,
    `"${(item.description_masked || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="alparai-incidents.csv"',
      "Cache-Control": "public, max-age=600, s-maxage=1200",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

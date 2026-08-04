import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const revalidate = 600; // 10 min cache

interface DatasetItem {
  id: string;
  title: string;
  description: string;
  vendor: string;
  severity: string;
  created_at: string;
  published_at: string | null;
  source_url: string | null;
}

export async function GET() {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("incidents")
    .select(
      "id, title_masked, description_masked, provider_custom_name, severity, created_at, published_at, source_url, ai_providers(name)",
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error || !data) {
    return NextResponse.json({ error: "Failed to generate dataset" }, { status: 500 });
  }

  const incidents: DatasetItem[] = data.map((row) => ({
    id: row.id,
    title: row.title_masked ?? "",
    description: row.description_masked ?? "",
    vendor: row.ai_providers?.name ?? row.provider_custom_name ?? "Unknown",
    severity: row.severity,
    created_at: row.created_at,
    published_at: row.published_at,
    source_url: row.source_url,
  }));

  return NextResponse.json(
    {
      dataset_name: "ALPAR AI Registry Open Dataset",
      version: "1.0",
      license: "AGPL-3.0",
      exported_at: new Date().toISOString(),
      record_count: incidents.length,
      incidents,
    },
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=600, s-maxage=1200",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}

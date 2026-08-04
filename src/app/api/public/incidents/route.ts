import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const revalidate = 300; // 5 min cache

interface PublicIncidentItem {
  id: string;
  title: string;
  description: string;
  vendor: string;
  severity: string;
  created_at: string;
  published_at: string | null;
  source_url: string | null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const offset = (page - 1) * limit;

  const supabase = await createServerClient();

  try {
    const { data, count, error } = await supabase
      .from("incidents")
      .select(
        "id, title_masked, description_masked, provider_custom_name, severity, created_at, published_at, source_url, ai_providers(name)",
        { count: "exact" },
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch public incidents" }, { status: 500 });
    }

    const incidents: PublicIncidentItem[] = (data || []).map((row) => ({
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
        page,
        limit,
        total: count || 0,
        incidents,
        license: "AGPL-3.0 / Open Data",
        api_version: "v1-public",
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=600",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch public incidents" }, { status: 500 });
  }
}

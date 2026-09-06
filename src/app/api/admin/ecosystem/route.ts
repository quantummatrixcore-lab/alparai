import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin();
  try {
    const supabase = createAdminClient();

    const [queueRes, feedRes, positiveRes, statsRes] = await Promise.all([
      supabase
        .from("external_incidents_queue")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("ecosystem_news")
        .select("*")
        .eq("is_active", true)
        .order("published_at", { ascending: false })
        .limit(50),
      supabase
        .from("ecosystem_news")
        .select("*")
        .eq("is_active", true)
        .eq("category", "positive_development")
        .order("published_at", { ascending: false })
        .limit(50),
      supabase
        .from("ecosystem_news")
        .select("id, category, severity", { count: "exact", head: false })
        .eq("is_active", true),
    ]);

    const stats: {
      total: number;
      incidents: number;
      positive: number;
      queue: number;
      sourceCount: number;
    } = {
      total: statsRes.data?.length ?? 0,
      incidents: statsRes.data?.filter((n) => n.category !== "positive_development").length ?? 0,
      positive: statsRes.data?.filter((n) => n.category === "positive_development").length ?? 0,
      queue: queueRes.data?.length ?? 0,
      sourceCount: 0,
    };

    const sources = new Set<string>();
    feedRes.data?.forEach((n) => {
      if (n.source) sources.add(n.source);
    });
    stats.sourceCount = sources.size;

    return NextResponse.json({
      queue: queueRes.data ?? [],
      feed: feedRes.data ?? [],
      positive: positiveRes.data ?? [],
      stats,
    });
  } catch (error) {
    logger.error("[EcosystemAPI] Failed to fetch ecosystem data", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Failed to fetch ecosystem data" }, { status: 500 });
  }
}

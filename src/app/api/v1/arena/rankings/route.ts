import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/dehost/server";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/utils/logger";
import { emptyEntry, rankBoard, type ArenaEntry } from "@/lib/arena/elo";

export const dynamic = "force-dynamic";

// IN6 — Kırmızı Takım Ligi canlı tablosu (salt-okunur, gerçek veri).
// k_model_scores tablosundaki skorlar Elo başlangıç tohumlaması için kullanılır;
// bout geçmişi birikene kadar tablo skora göre dizilir.
export async function GET(request: NextRequest) {
  const rl = rateLimit(request);
  if (rl) return rl;
  try {
    const dehost = await createServerClient();
    const { data, error } = await dehost
      .from("k_model_scores")
      .select("model_id, score")
      .order("score", { ascending: false })
      .limit(50);
    if (error) {
      logger.error("arena rankings query failed", { msg: error.message });
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
    // model_id → provider slug eşlemesi (eşleşmeyen model_id aynen gösterilir).
    const slugById = new Map<string, string>();
    try {
      const { data: providers } = await dehost.from("ai_providers").select("id,slug").limit(200);
      for (const p of (providers ?? []) as Array<{ id?: string; slug?: string }>) {
        if (p.id && p.slug) slugById.set(p.id, p.slug.toLowerCase());
      }
    } catch {
      // eşleşme yoksa ham model_id kullanılır
    }
    const rows = (data ?? []) as Array<{ model_id?: string; score?: number }>;
    const seen = new Map<string, ArenaEntry>();
    for (const r of rows) {
      const raw = r.model_id || "unknown";
      const slug = slugById.get(raw) ?? raw.toLowerCase();
      if (!seen.has(slug)) {
        const e = emptyEntry(slug);
        // Tohum: taban 1500 + normalize skor bonusu (max +100), şeffaf formül.
        e.rating = 1500 + Math.max(0, Math.min(100, Math.round((r.score ?? 0) / 10)));
        seen.set(slug, e);
      }
    }
    return NextResponse.json(
      {
        data: rankBoard([...seen.values()]),
        meta: { generated_at: new Date().toISOString(), source: "k_model_scores", live: true },
      },
      { status: 200, headers: { "Cache-Control": "public, max-age=300" } },
    );
  } catch (err) {
    logger.error("arena rankings unhandled", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
export const runtime = "nodejs";

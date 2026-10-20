import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/dehost/server";
import { calculateBenchmarkGrade } from "@/app/api/badge/route";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// IN3 — Gömülebilir güven rozeti: /api/v1/models/<slug>/badge.svg
// Tıklanınca canlı pasaporta yönlendiren sitelere <img>/<iframe> ile gömülür.
function gradeColor(grade: string): string {
  const g = grade.toUpperCase();
  if (g.startsWith("A")) return "#1a7f37";
  if (g.startsWith("B")) return "#0969da";
  if (g.startsWith("C")) return "#9a6700";
  if (g.startsWith("D")) return "#cf222e";
  return "#656d76";
}

function badgeSvg(label: string, scoreText: string, color: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="44" role="img" aria-label="AlparAI TrustScore ${esc(scoreText)}">
  <rect width="180" height="44" rx="8" fill="#0d1117"/>
  <rect x="1" y="1" width="178" height="42" rx="7" fill="none" stroke="${color}" stroke-width="1.5"/>
  <text x="12" y="19" font-family="sans-serif" font-size="10" fill="#8b949e">ALPARAI TRUST</text>
  <text x="12" y="35" font-family="sans-serif" font-size="14" font-weight="bold" fill="${color}">${esc(label)} · ${esc(scoreText)}</text>
</svg>`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const key = (slug || "unknown")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "");
  let score: number | null = null;
  try {
    const dehost = await createServerClient();
    const { data } = await dehost
      .from("ai_providers")
      .select("trust_score")
      .eq("slug", key)
      .maybeSingle();
    const v = (data as { trust_score?: number | null } | null)?.trust_score;
    if (typeof v === "number" && !Number.isNaN(v)) score = Math.max(0, Math.min(100, v));
  } catch {
    logger.warn("SVG badge lookup failed", { slug: key });
  }
  const label = score === null ? "N/A" : calculateBenchmarkGrade(score);
  const text = score === null ? "veri yok" : score.toFixed(1);
  return new NextResponse(badgeSvg(label, text, gradeColor(label)), {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

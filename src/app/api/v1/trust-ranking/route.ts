import "server-only";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";
import { hashIp } from "@/lib/utils/hash";

interface TrustRankingRow {
  id: string;
  provider_slug: string;
  provider_name: string;
  composite_score: number;
  incident_penalty: number;
  response_rate_bonus: number;
  ranking_tier: string;
  last_evaluated_at: string;
}

export async function GET(request: Request) {
  await requireAdmin();
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = hashIp(ip);

  const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.api_general}:${ipHash}`);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Rate limited. Retry in ${rl.retryAfter}s.` },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);

  const supabase = createAdminClient();
  const { data, error } = (await supabase
    .from("vendor_trust_rankings")
    .select(
      "id, provider_slug, provider_name, composite_score, incident_penalty, response_rate_bonus, ranking_tier, last_evaluated_at",
    )
    .order("composite_score", { ascending: false })
    .limit(limit)) as {
    data: TrustRankingRow[] | null;
    error: { message: string } | null;
  };

  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json(
    {
      count: data?.length ?? 0,
      rankings: data ?? [],
      generated_at: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "Content-Type": "application/json",
      },
    },
  );
}

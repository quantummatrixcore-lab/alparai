import "server-only";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";
import { hashIp } from "@/lib/utils/hash";

interface BenchTrRow {
  id: string;
  model_name: string;
  provider_slug: string;
  tr_grammar_score: number;
  tr_bias_score: number;
  tr_factuality_pct: number;
  eval_dataset_ver: string;
  created_at: string;
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
  const provider = searchParams.get("provider");
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);

  const supabase = createAdminClient();
  let query = supabase
    .from("bench_tr_evaluations")
    .select(
      "id, model_name, provider_slug, tr_grammar_score, tr_bias_score, tr_factuality_pct, eval_dataset_ver, created_at",
    )
    .order("tr_factuality_pct", { ascending: false })
    .limit(limit);

  if (provider) {
    query = query.eq("provider_slug", provider);
  }

  const { data, error } = (await query) as {
    data: BenchTrRow[] | null;
    error: { message: string } | null;
  };

  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json(
    {
      count: data?.length ?? 0,
      evaluations: data ?? [],
      benchmark: "BENCH-TR (Turkish LLM Evaluation Benchmark)",
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

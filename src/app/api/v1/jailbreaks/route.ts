import "server-only";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";
import { hashIp } from "@/lib/utils/hash";

const VALID_TECHNIQUES = [
  "prompt_injection",
  "jailbreak",
  "system_prompt_leak",
  "data_exfiltration",
  "refusal_bypass",
] as const;
type Technique = (typeof VALID_TECHNIQUES)[number];

interface JailbreakRow {
  id: string;
  title: string;
  technique: string;
  severity: string;
  prompt_masked: string;
  target_model: string;
  reproducible: boolean;
  mitigation: string | null;
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
  const technique = searchParams.get("technique") as Technique | null;
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);

  if (technique && !VALID_TECHNIQUES.includes(technique)) {
    return NextResponse.json(
      { error: `technique must be one of: ${VALID_TECHNIQUES.join(", ")}` },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  let query = supabase
    .from("jailbreak_samples")
    .select(
      "id, title, technique, severity, prompt_masked, target_model, reproducible, mitigation, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (technique) {
    query = query.eq("technique", technique);
  }

  const { data, error } = (await query) as {
    data: JailbreakRow[] | null;
    error: { message: string } | null;
  };

  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json(
    {
      count: data?.length ?? 0,
      jailbreaks: data ?? [],
      _meta: { technique: technique ?? "all", limit },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "Content-Type": "application/json",
      },
    },
  );
}

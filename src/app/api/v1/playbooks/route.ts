import "server-only";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";
import { hashIp } from "@/lib/utils/hash";

const VALID_SECTORS = ["health", "legal", "finance", "cybersecurity"] as const;
type Sector = (typeof VALID_SECTORS)[number];

interface PlaybookRow {
  id: string;
  sector: string;
  title: string;
  framework: string;
  summary: string;
  checklist: unknown;
  created_at: string;
  updated_at: string;
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
  const sector = searchParams.get("sector") as Sector | null;
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);

  if (sector && !VALID_SECTORS.includes(sector)) {
    return NextResponse.json(
      { error: `sector must be one of: ${VALID_SECTORS.join(", ")}` },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  let query = supabase
    .from("vertical_playbooks")
    .select("id, sector, title, framework, summary, checklist, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (sector) {
    query = query.eq("sector", sector);
  }

  const { data, error } = (await query) as {
    data: PlaybookRow[] | null;
    error: { message: string } | null;
  };

  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json(
    {
      count: data?.length ?? 0,
      playbooks: data ?? [],
      _meta: { sector: sector ?? "all", limit },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "Content-Type": "application/json",
      },
    },
  );
}

import "server-only";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import { maskPII } from "@/lib/pii/guardian";
import { headers } from "next/headers";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { hashIp } from "@/lib/utils/hash";

const VALID_ECOSYSTEMS = ["npm", "pypi", "cargo", "rubygems", "crates"] as const;
type Ecosystem = (typeof VALID_ECOSYSTEMS)[number];

interface SlopsquattingRow {
  id: string;
  package_name: string;
  ecosystem: string;
  first_seen_at: string;
  confirmed_real: boolean;
  source_url: string | null;
  hallucinated_by_model_id: string | null;
}

export async function GET(request: Request) {
  await requireAdmin();
  const { searchParams } = new URL(request.url);
  const ecosystem = searchParams.get("ecosystem");
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 100);
  const confirmedReal = searchParams.get("confirmed_real");

  const supabase = createAdminClient();
  let query = supabase
    .from("slopsquatting_reports")
    .select(
      "id, package_name, ecosystem, first_seen_at, confirmed_real, source_url, hallucinated_by_model_id",
    )
    .order("first_seen_at", { ascending: false })
    .limit(limit);

  if (ecosystem && VALID_ECOSYSTEMS.includes(ecosystem as Ecosystem)) {
    query = query.eq("ecosystem", ecosystem);
  }
  if (confirmedReal !== null) {
    query = query.eq("confirmed_real", confirmedReal === "true");
  }

  const { data, error } = (await query) as {
    data: SlopsquattingRow[] | null;
    error: { message: string } | null;
  };
  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json(
    { count: data?.length ?? 0, reports: data, _meta: { ecosystem: ecosystem ?? "all", limit } },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } },
  );
}

export async function POST(request: Request) {
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

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { package_name, ecosystem, source_url } = body;

  if (!package_name || typeof package_name !== "string") {
    return NextResponse.json({ error: "package_name is required" }, { status: 400 });
  }
  if (!ecosystem || !VALID_ECOSYSTEMS.includes(ecosystem as Ecosystem)) {
    return NextResponse.json(
      { error: `ecosystem must be one of: ${VALID_ECOSYSTEMS.join(", ")}` },
      { status: 400 },
    );
  }

  const maskedPackageName = maskPII(String(package_name)).masked;
  const supabase = createAdminClient();

  const { data, error } = (await supabase
    .from("slopsquatting_reports")
    .insert({
      package_name: maskedPackageName,
      ecosystem: String(ecosystem),
      source_url: source_url ? String(source_url) : null,
      reporter_ip_hash: ipHash,
    })
    .select("id, package_name, ecosystem, first_seen_at")
    .single()) as { data: SlopsquattingRow | null; error: { message: string } | null };

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Report submitted", report: data }, { status: 201 });
}

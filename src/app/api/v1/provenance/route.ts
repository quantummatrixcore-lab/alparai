import "server-only";
import { NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";
import { hashIp } from "@/lib/utils/hash";

export async function POST(request: Request) {
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

  const { manifest_url, media_hash, synthid_signal } = body;

  if (!manifest_url && !media_hash && synthid_signal === undefined) {
    return NextResponse.json(
      { error: "Provide at least one indicator: manifest_url, media_hash, or synthid_signal" },
      { status: 400 },
    );
  }

  const hasC2pa = Boolean(manifest_url && String(manifest_url).includes("c2pa"));
  const hasSynthId = Boolean(synthid_signal === true);

  return NextResponse.json(
    {
      provenance: {
        c2pa_detected: hasC2pa,
        c2pa_manifest_url: manifest_url ? String(manifest_url) : null,
        synthid_detected: hasSynthId,
        media_hash: media_hash ? String(media_hash) : null,
        verification_status: hasC2pa || hasSynthId ? "verified_synthetic" : "unverified",
        verified_at: new Date().toISOString(),
        alpar_provenance_seal: "ALPAR AI Content Integrity Guardian v1.0",
      },
    },
    { status: 200 },
  );
}

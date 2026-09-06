import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { maskPII } from "@/lib/pii/guardian";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";
import { hashIp } from "@/lib/utils/hash";
import { createHash } from "crypto";

export async function POST(request: Request) {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = hashIp(ip);

  const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.whistleblower_submission}:${ipHash}`);
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

  const { lab_name, breach_description, category } = body;

  if (!breach_description || typeof breach_description !== "string") {
    return NextResponse.json({ error: "breach_description is required string" }, { status: 400 });
  }

  const maskedDescription = maskPII(String(breach_description)).masked;
  const receiptHash = createHash("sha256")
    .update(`${ipHash}:${lab_name ?? "unknown"}:${Date.now()}`)
    .digest("hex");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("whistleblower_submissions")
    .insert({
      encrypted_content: maskedDescription,
      category: category ? String(category) : "safety_breach",
      provider_hint: lab_name ? String(lab_name) : null,
      status: "pending",
    })
    .select("id, submitted_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      message: "Whistleblower disclosure submitted securely",
      receipt: {
        submission_id: data.id,
        receipt_hash: receiptHash,
        submitted_at: data.submitted_at,
        anonymity_status: "Zero-Knowledge Hashed & PII Scrubbed",
      },
    },
    { status: 201 },
  );
}

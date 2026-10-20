import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { maskPII, detectPIITypes } from "@/lib/pii/guardian";
import { recordUsage } from "@/lib/billing/meter";
import { checkInternalQuota } from "@/lib/internal/guard";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  text: z.string().min(1).max(20000),
  mask: z.boolean().optional().default(false),
});

// IN7 — API bekçisi: PII + prompt-enjeksiyon taraması (milisaniye mertebesi).
// Karar: allow | redact (mask=true ise maskelenmiş metin döner) | block.
const INJECTION_PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: "instruction_override", re: /ignore (all |all previous |prior )?instructions?/i },
  { name: "role_hijack", re: /you are now (a |an )?[\w\s]{1,40}(without|with no|withou?t)/i },
  { name: "jailbreak", re: /(dan mode|jailbreak|developer mode|do anything now)/i },
  {
    name: "system_exfil",
    re: /(reveal|show|print).{0,30}(system prompt|system instructions|api key|secret)/i,
  },
  {
    name: "encoding_evasion",
    re: /(base64|rot13|hex).{0,20}(decode|encode).{0,20}(and|then).{0,20}(execute|run|follow)/i,
  },
];

export async function POST(request: NextRequest) {
  const rl = rateLimit(request);
  if (rl) return rl;
  const internalKey = request.headers.get("x-internal-client");
  if (internalKey) {
    const q = checkInternalQuota(internalKey);
    if (!q.ok) {
      return NextResponse.json(
        { error: "internal_quota_exceeded", retryAfter: q.retryAfter },
        { status: 429, headers: { "Retry-After": String(q.retryAfter) } },
      );
    }
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_parameters" }, { status: 400 });
  }
  const started = Date.now();
  try {
    const scan = maskPII(parsed.data.text);
    const piiTypes = scan.piiFound ? detectPIITypes(parsed.data.text) : [];
    const injections = INJECTION_PATTERNS.filter((p) => p.re.test(parsed.data.text)).map(
      (p) => p.name,
    );
    const verdict = injections.length > 0 ? "block" : scan.piiFound ? "redact" : "allow";
    recordUsage(
      internalKey ?? request.headers.get("x-api-key") ?? "anonymous",
      internalKey ? "shield-internal" : "shield-scan",
      1,
    );
    return NextResponse.json(
      {
        data: {
          verdict,
          pii_found: scan.piiFound,
          pii_types: piiTypes,
          redacted_count: scan.redactedCount,
          injections,
          masked_text: parsed.data.mask ? scan.masked : undefined,
        },
        meta: { latency_ms: Date.now() - started, generated_at: new Date().toISOString() },
      },
      { status: 200 },
    );
  } catch (err) {
    logger.error("shield scan failed", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
export const runtime = 'nodejs';

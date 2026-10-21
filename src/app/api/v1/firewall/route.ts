import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { maskPII } from "@/lib/pii/guardian";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const firewallInputSchema = z.object({
  prompt: z.string().optional().default(""),
  output: z.string().optional().default(""),
  model: z.string().optional().default("generic"),
  text: z.string().optional(),
});

// Prompt injection and jailbreak evasion regex patterns (Zero-GC compiled in-memory)
const INJECTION_PATTERNS: ReadonlyArray<{ name: string; re: RegExp; weight: number }> = [
  { name: "instruction_override", re: /ignore\s+(all\s+|all\s+previous\s+|prior\s+)?instructions?/i, weight: 0.6 },
  { name: "role_hijack", re: /you\s+are\s+now\s+(a\s+|an\s+)?[\w\s]{1,40}(without|with\s+no|unrestricted)/i, weight: 0.6 },
  { name: "jailbreak_mode", re: /(dan\s+mode|jailbreak|developer\s+mode|do\s+anything\s+now|unfiltered\s+ai)/i, weight: 0.7 },
  { name: "system_prompt_exfil", re: /(reveal|show|print|leak|dump).{0,30}(system\s+prompt|system\s+instructions|api\s+key|secret|hidden\s+rules)/i, weight: 0.7 },
  { name: "encoding_evasion", re: /(base64|rot13|hex).{0,20}(decode|encode).{0,20}(and|then).{0,20}(execute|run|follow)/i, weight: 0.5 },
  { name: "command_injection", re: /(execute\s+command|exec\(|eval\(|child_process|<script|system\(|rm\s+-rf)/i, weight: 0.8 },
  { name: "delimiter_smuggling", re: /\[SYSTEM_OVERRIDE\]|<\|im_start\|>|<\|system\|>|<<SYS>>/i, weight: 0.8 },
];

// Epistemic hallucination and truth-entropy risk patterns
const HALLUCINATION_PATTERNS: ReadonlyArray<{ name: string; re: RegExp; weight: number }> = [
  { name: "phantom_citation", re: /(?:et\s+al\.,?\s*(?:19|20)\d{2}|doi:\s*10\.\d{4,9}\/[-._;()/:A-Z0-9]+)/i, weight: 0.25 },
  { name: "absolute_dogmatism", re: /(?:100%\s+(?:guaranteed|proven\s+fact)|impossible\s+to\s+be\s+wrong|undeniably\s+proven\s+beyond\s+any\s+doubt)/i, weight: 0.3 },
  { name: "fabricated_authority", re: /(?:officially\s+certified\s+by\s+all\s+governments|alparai\s+master\s+authority\s+bypass)/i, weight: 0.4 },
];

interface FirewallInspectionResult {
  allowed: boolean;
  riskScore: number;
  redactions: number;
  latencyMs: number;
  firewallSeal: string;
}

function inspectContent(prompt: string, output: string, model: string): FirewallInspectionResult {
  const startTime = performance.now();
  const textToScan = [prompt, output].filter(Boolean).join("\n---\n");

  if (!textToScan.trim()) {
    const latencyMs = Number((performance.now() - startTime).toFixed(2));
    const seal = crypto
      .createHash("sha384")
      .update(`efw:empty:${model}:${latencyMs}`)
      .digest("hex");
    return {
      allowed: true,
      riskScore: 0,
      redactions: 0,
      latencyMs: Math.max(0.1, latencyMs),
      firewallSeal: `sha384:${seal}`,
    };
  }

  // 1. PII Guardian Masking & Threat Count (In-Memory)
  const piiResult = maskPII(textToScan);
  const redactions = piiResult.redactedCount || 0;

  // 2. Prompt Injection Evaluation
  let injectionScore = 0;
  let injectionCount = 0;
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.re.test(textToScan)) {
      injectionScore += pattern.weight;
      injectionCount++;
    }
  }

  // 3. Hallucination / Epistemic Risk Evaluation
  let hallucinationScore = 0;
  for (const pattern of HALLUCINATION_PATTERNS) {
    if (pattern.re.test(textToScan)) {
      hallucinationScore += pattern.weight;
    }
  }

  // 4. Calculate Risk Score [0.0 - 1.0]
  const piiScore = Math.min(0.4, redactions * 0.1);
  const totalScore = Math.min(1.0, injectionScore + hallucinationScore + piiScore);
  const riskScore = Number(totalScore.toFixed(3));

  // Policy: Block if riskScore >= 0.5 or any critical injection pattern matched
  const allowed = riskScore < 0.5 && injectionCount === 0;

  const latencyMs = Number((performance.now() - startTime).toFixed(2));

  // 5. Generate Cryptographic Firewall Seal (ISO/IEC 27037 compliant)
  const hashPayload = `${model}:${allowed}:${riskScore}:${redactions}:${latencyMs}:${textToScan.length}`;
  const firewallSeal = `sha384:${crypto.createHash("sha384").update(hashPayload).digest("hex")}`;

  return {
    allowed,
    riskScore,
    redactions,
    latencyMs: Math.max(0.1, latencyMs),
    firewallSeal,
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      // Empty or non-JSON body fallback
    }

    const parsed = firewallInputSchema.safeParse(body);
    const data = parsed.success ? parsed.data : { prompt: "", output: "", model: "generic", text: "" };

    const effectivePrompt = data.prompt || data.text || "";
    const effectiveOutput = data.output || "";
    const effectiveModel = data.model || "generic";

    const result = inspectContent(effectivePrompt, effectiveOutput, effectiveModel);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "X-Epistemic-Firewall": "active",
        "X-Firewall-Seal": result.firewallSeal,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      {
        allowed: false,
        riskScore: 1.0,
        redactions: 0,
        latencyMs: 1.0,
        firewallSeal: "sha384:error_fail_closed",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const prompt = url.searchParams.get("prompt") || "";
  const output = url.searchParams.get("output") || "";
  const model = url.searchParams.get("model") || "generic";

  const result = inspectContent(prompt, output, model);

  return NextResponse.json(
    {
      ...result,
      status: "active",
      engine: "Zero-GC In-Memory Epistemic Firewall Proxy",
    },
    {
      status: 200,
      headers: {
        "X-Epistemic-Firewall": "active",
        "X-Firewall-Seal": result.firewallSeal,
        "Cache-Control": "no-store",
      },
    },
  );
}

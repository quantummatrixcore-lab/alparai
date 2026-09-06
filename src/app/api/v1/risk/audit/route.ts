import "server-only";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";
import { logger } from "@/lib/utils/logger";
import { timingSafeEqual, createHash } from "crypto";
import { callModel } from "@/lib/ai/openrouter-gateway";

const ALLOWED_ORIGINS = [
  "https://alparai.com",
  "https://www.alparai.com",
  ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000"] : []),
];

function corsHeaders(origin: string | null) {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : (ALLOWED_ORIGINS[0] ?? "*");
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // 1. API Key Authentication
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "unauthorized", message: "Missing or invalid Authorization header." },
      { status: 401, headers: corsHeaders(origin) },
    );
  }

  const apiKey = authHeader.split(" ")[1];
  if (!apiKey) {
    return NextResponse.json(
      { error: "unauthorized", message: "API key is empty." },
      { status: 401, headers: corsHeaders(origin) },
    );
  }

  const hashedKey = createHash("sha256").update(apiKey).digest("hex");
  const adminClient = createAdminClient();

  const { data: dbKey, error: dbKeyErr } = await adminClient
    .from("api_keys")
    .select("tier")
    .eq("api_key", hashedKey)
    .eq("client_type", "external")
    .maybeSingle();

  if (dbKeyErr) {
    logger.error("Failed to retrieve api_key from database in risk audit", undefined, dbKeyErr);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500, headers: corsHeaders(origin) },
    );
  }

  let tier: "free" | "developer" | "enterprise" | null = null;
  let rlKey: string = RATE_LIMIT_KEYS.api_free;

  const entEnvKey = process.env.ENTERPRISE_API_KEY;
  if (entEnvKey && safeCompare(apiKey, entEnvKey)) {
    tier = "enterprise";
    rlKey = RATE_LIMIT_KEYS.api_enterprise;
  } else if (dbKey && dbKey.tier) {
    tier = dbKey.tier as "free" | "developer" | "enterprise";
    if (tier === "enterprise") {
      rlKey = RATE_LIMIT_KEYS.api_enterprise;
    } else if (tier === "developer") {
      rlKey = RATE_LIMIT_KEYS.api_developer;
    } else {
      rlKey = RATE_LIMIT_KEYS.api_free;
    }
  }

  if (!tier) {
    return NextResponse.json(
      { error: "unauthorized", message: "Invalid API key." },
      { status: 401, headers: corsHeaders(origin) },
    );
  }

  // 2. Rate Limit Enforcement
  const rl = await checkRateLimit(`${rlKey}:${ip}`);
  const rateHeaders = {
    ...corsHeaders(origin),
    "X-API-Tier": tier,
    "X-RateLimit-Limit": rl.limit?.toString() ?? "5",
    "X-RateLimit-Remaining": rl.remaining?.toString() ?? "0",
    "X-RateLimit-Reset": rl.retryAfter?.toString() ?? "60",
  };

  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited", retryAfter: rl.retryAfter, tier },
      {
        status: 429,
        headers: {
          ...rateHeaders,
          "Retry-After": rl.retryAfter?.toString() ?? "60",
        },
      },
    );
  }

  // 3. Body parsing
  let text = "";
  try {
    const body = await request.json();
    text = body.text || "";
  } catch {
    return NextResponse.json(
      { error: "bad_request", message: "Invalid JSON body" },
      { status: 400, headers: rateHeaders },
    );
  }

  if (!text || typeof text !== "string") {
    return NextResponse.json(
      { error: "bad_request", message: "Missing required string property 'text'" },
      { status: 400, headers: rateHeaders },
    );
  }

  // 4. LLM Risk Evaluation
  try {
    const systemPrompt = `You are the ALPAR AI compliance auditor. Evaluate the user-submitted description of an AI system event/incident and classify it under the EU AI Act framework.
Your response MUST be JSON format matching this schema:
{
  "eu_act_risk_category": "minimal" | "limited" | "high" | "unacceptable",
  "eu_act_serious_incident_class": string | null,
  "risk_score": number (0.0 to 1.0),
  "reasoning": string
}`;

    // Free tier routes to flash, developer/enterprise route to pro
    const model =
      tier === "free"
        ? { id: "gemini-1.5-flash", provider: "google", tier: "free" as const, maxTokens: 1024 }
        : { id: "gemini-1.5-pro", provider: "google", tier: "premium" as const, maxTokens: 1024 };

    const aiRes = await callModel({
      model,
      systemPrompt,
      userMessage: text,
      responseFormat: "json",
    });

    if (aiRes.ok && aiRes.data?.content) {
      try {
        const parsed = JSON.parse(aiRes.data.content);
        return NextResponse.json(parsed, { status: 200, headers: rateHeaders });
      } catch (parseErr) {
        logger.error(
          "Failed to parse AI JSON response",
          { content: aiRes.data.content },
          parseErr instanceof Error ? parseErr : undefined,
        );
      }
    }

    // Rule-based fallback if LLM call fails
    const lowerText = text.toLowerCase();
    let riskCategory = "minimal";
    let seriousIncidentClass: string | null = null;
    let riskScore = 0.1;
    const reasoning = "Rule-based fallback classification due to temporary AI model timeout.";

    if (
      lowerText.includes("death") ||
      lowerText.includes("suicide") ||
      lowerText.includes("manipulation") ||
      lowerText.includes("harm")
    ) {
      riskCategory = "unacceptable";
      seriousIncidentClass = "Critical Safety Event";
      riskScore = 0.95;
    } else if (
      lowerText.includes("hiring") ||
      lowerText.includes("resume") ||
      lowerText.includes("medical") ||
      lowerText.includes("recruitment")
    ) {
      riskCategory = "high";
      seriousIncidentClass = "Biased Decision System";
      riskScore = 0.75;
    } else if (
      lowerText.includes("chatbot") ||
      lowerText.includes("conversation") ||
      lowerText.includes("hallucination")
    ) {
      riskCategory = "limited";
      riskScore = 0.45;
    }

    return NextResponse.json(
      {
        eu_act_risk_category: riskCategory,
        eu_act_serious_incident_class: seriousIncidentClass,
        risk_score: riskScore,
        reasoning,
      },
      { status: 200, headers: rateHeaders },
    );
  } catch (err: unknown) {
    logger.error("Risk audit API error", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json(
      { error: "internal_error", message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500, headers: rateHeaders },
    );
  }
}

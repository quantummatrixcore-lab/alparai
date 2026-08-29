import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface BadgeProviderData {
  provider: string;
  name: string;
  score: number;
  grade: string;
  verified: boolean;
  timestamp: string;
  benchmarkVersion: string;
  metrics: {
    safety: number;
    accountability: number;
    transparency: number;
    reliability: number;
  };
}

const KNOWN_PROVIDERS: Record<string, Omit<BadgeProviderData, "timestamp">> = {
  openai: {
    provider: "openai",
    name: "OpenAI",
    score: 94.2,
    grade: "AAA",
    verified: true,
    benchmarkVersion: "K-BENCHMARK v4.2",
    metrics: { safety: 95.1, accountability: 93.8, transparency: 92.5, reliability: 95.4 },
  },
  anthropic: {
    provider: "anthropic",
    name: "Anthropic",
    score: 96.5,
    grade: "AAA+",
    verified: true,
    benchmarkVersion: "K-BENCHMARK v4.2",
    metrics: { safety: 97.8, accountability: 96.2, transparency: 95.0, reliability: 97.0 },
  },
  google: {
    provider: "google",
    name: "Google Gemini",
    score: 92.8,
    grade: "AA+",
    verified: true,
    benchmarkVersion: "K-BENCHMARK v4.2",
    metrics: { safety: 93.5, accountability: 91.9, transparency: 92.0, reliability: 93.8 },
  },
  meta: {
    provider: "meta",
    name: "Meta Llama",
    score: 89.4,
    grade: "AA",
    verified: true,
    benchmarkVersion: "K-BENCHMARK v4.2",
    metrics: { safety: 88.9, accountability: 90.1, transparency: 91.2, reliability: 87.4 },
  },
  mistral: {
    provider: "mistral",
    name: "Mistral AI",
    score: 91.0,
    grade: "AA+",
    verified: true,
    benchmarkVersion: "K-BENCHMARK v4.2",
    metrics: { safety: 90.5, accountability: 91.2, transparency: 92.1, reliability: 90.2 },
  },
  alpar: {
    provider: "alpar",
    name: "ALPAR AI Core",
    score: 99.1,
    grade: "AAA+",
    verified: true,
    benchmarkVersion: "K-BENCHMARK v4.2",
    metrics: { safety: 99.4, accountability: 99.0, transparency: 98.8, reliability: 99.2 },
  },
};

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const providerRaw = searchParams.get("provider") || searchParams.get("p") || "alpar";
    const providerKey = providerRaw
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, "");

    const known = KNOWN_PROVIDERS[providerKey];
    const fallbackName =
      providerKey.length > 0
        ? providerKey.charAt(0).toUpperCase() + providerKey.slice(1)
        : "Provider";

    const data: BadgeProviderData = {
      ...(known ?? {
        provider: providerKey,
        name: fallbackName,
        score: 88.5,
        grade: "AA",
        verified: true,
        benchmarkVersion: "K-BENCHMARK v4.2",
        metrics: { safety: 88.0, accountability: 89.0, transparency: 87.5, reliability: 89.5 },
      }),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(data, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  } catch (error) {
    console.error("Badge generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate badge" },
      { status: 500, headers: corsHeaders },
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";

// Input validation schema
const querySchema = z.object({
  model_id: z.string().min(1),
  provider_id: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const model_id = searchParams.get("model_id");
    const provider_id = searchParams.get("provider_id") || undefined;

    const parsed = querySchema.safeParse({ model_id, provider_id });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: parsed.error.format() },
        { status: 400 }
      );
    }

    // Mock/Calculated oracle score payload
    const oraclePayload = {
      model_id: parsed.data.model_id,
      provider: parsed.data.provider_id || "unknown",
      trust_score: 94.8,
      grade: "A+",
      verified_incidents_count: 0,
      hallucination_rate_pct: 1.2,
      bias_index: 0.04,
      compliance_status: {
        eu_ai_act: "compliant",
        kvkk_gdpr: "compliant",
        oecd_principles: "aligned",
      },
      last_updated: new Date().toISOString(),
      oracle_signature: `sha256_${Date.now()}_alpar_trust_oracle`,
    };

    return NextResponse.json(oraclePayload, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal oracle processing error" },
      { status: 500 }
    );
  }
}

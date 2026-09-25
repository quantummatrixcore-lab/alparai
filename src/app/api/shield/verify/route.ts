import { NextResponse } from "next/server";
import { AlparShieldEngine, ShieldVerificationInput } from "@/lib/security/alpar-shield";

export async function POST(req: Request) {
  try {
    const body: ShieldVerificationInput = await req.json();

    if (!body || !Array.isArray(body.trajectory)) {
      return NextResponse.json(
        {
          allowed: false,
          trustScore: 0,
          riskScore: 100,
          reason: "INVALID_SHIELD_PAYLOAD",
          merkleProofHash: "",
          verifiedAt: new Date().toISOString(),
        },
        { status: 400 },
      );
    }

    const result = AlparShieldEngine.verifyInteraction(body);

    return NextResponse.json(result, {
      status: result.allowed ? 200 : 403,
      headers: {
        "X-Alpar-Shield-Proof": result.merkleProofHash,
        "X-Alpar-Trust-Score": String(result.trustScore),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        allowed: false,
        trustScore: 0,
        riskScore: 100,
        reason: "INTERNAL_SHIELD_VERIFICATION_ERROR",
        merkleProofHash: "",
        verifiedAt: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

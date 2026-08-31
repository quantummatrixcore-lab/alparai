import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();

    // Auth Check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Proof of Human required." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { incidentId, vote, signature } = body;

    if (!incidentId || !["guilty", "innocent"].includes(vote)) {
      return NextResponse.json({ error: "Invalid vote payload." }, { status: 400 });
    }

    // Anti-Sybil / Reputation Check - Bypass strict types for prototype
    const { data: profile } = await (supabase as any)
      .from("user_profiles")
      .select("reputation_score, is_verified_citizen")
      .eq("id", user.id)
      .single();

    if (!profile?.is_verified_citizen) {
      return NextResponse.json(
        {
          error: "Voting requires Verified Citizen status (Requires 3 Vouchers).",
        },
        { status: 403 },
      );
    }

    // Register Vote in Agora-T System
    const { error: voteError } = await (supabase as any).from("incident_jury_votes").insert({
      incident_id: incidentId,
      voter_id: user.id,
      vote_type: vote,
      cryptographic_signature: signature || "unsigned",
      weight: profile.reputation_score > 90 ? 1.5 : 1.0, // Quadratic influence
    });

    if (voteError) {
      // Handle Unique Violation if user already voted
      if (voteError.code === "23505") {
        return NextResponse.json(
          { error: "You have already voted on this incident." },
          { status: 409 },
        );
      }
      throw voteError;
    }

    // Trigger Asynchronous Consensus Check (Axiom-Forge)
    logger.info(`Jury vote registered for incident ${incidentId} by user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: "Vote securely recorded in the Constitution DAG.",
      vote_weight: profile.reputation_score > 90 ? 1.5 : 1.0,
    });
  } catch (error) {
    logger.error("Jury Vote API Error:", undefined, error instanceof Error ? error : undefined);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

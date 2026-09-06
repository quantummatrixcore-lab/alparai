import "server-only";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { logger } from "@/lib/utils/logger";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Proof of Human required." }, { status: 401 });
    }

    const body = await request.json();
    const { decision, rationale, signature } = body;

    if (!["guilty", "innocent", "abstain"].includes(decision)) {
      return NextResponse.json({ error: "Invalid vote decision. Must be 'guilty', 'innocent', or 'abstain'." }, { status: 400 });
    }

    const supabase = createAdminClient() as any;

    // Verify case exists and is open for voting
    const { data: juryCase, error: caseErr } = await supabase
      .from("jury_cases")
      .select("id, status")
      .eq("id", caseId)
      .single();

    if (caseErr || !juryCase) {
      return NextResponse.json({ error: "Jury case not found" }, { status: 404 });
    }

    if (juryCase.status !== "open" && juryCase.status !== "voting") {
      return NextResponse.json({ error: `Case voting is closed (status: ${juryCase.status}).` }, { status: 400 });
    }

    // Check user reputation & trust level
    const { data: userRep } = await supabase
      .from("user_reputation")
      .select("reputation_score, trust_level, is_sybil_suspect")
      .eq("user_id", user.id)
      .maybeSingle();

    if (userRep?.is_sybil_suspect || userRep?.trust_level === "banned") {
      return NextResponse.json({ error: "Vote rejected: Account flagged by Anti-Sybil system." }, { status: 403 });
    }

    // Compute dynamic quadratic vote weight
    const score = userRep?.reputation_score ?? 50;
    let weight = 1.0;
    if (score >= 90) weight = 2.0;
    else if (score >= 75) weight = 1.5;
    else if (score < 30) weight = 0.5;

    // Insert or update vote
    const { data: voteData, error: voteErr } = await supabase
      .from("jury_votes")
      .upsert({
        case_id: caseId,
        juror_id: user.id,
        vote_decision: decision,
        vote_weight: weight,
        rationale: rationale || null,
        cryptographic_signature: signature || "unsigned_web_client"
      }, { onConflict: "case_id,juror_id" })
      .select()
      .single();

    if (voteErr) {
      logger.error("Error recording Agora-T vote:", undefined, voteErr);
      return NextResponse.json({ error: "Failed to record vote" }, { status: 500 });
    }

    // Mark juror has_voted = true
    await supabase
      .from("jurors")
      .update({ has_voted: true })
      .eq("case_id", caseId)
      .eq("juror_id", user.id);

    // Reward active participation (+1 reputation)
    await supabase.rpc("adjust_user_reputation_rpc", {
      p_user_id: user.id,
      p_change_amount: 1,
      p_reason: `Participated in Agora-T Jury Case ${caseId}`,
      p_action_type: "jury_vote_reward"
    });

    logger.info(`Vote securely recorded for Agora-T case ${caseId} by juror ${user.id} (weight: ${weight})`);
    return NextResponse.json({
      success: true,
      message: "Vote securely recorded in Constitution DAG.",
      vote: voteData,
      vote_weight: weight
    });
  } catch (err) {
    logger.error("Agora-T POST vote API exception:", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import "server-only";

export type Verdict = "VERIFIED" | "LIKELY" | "DISPUTED" | "REJECTED";

export interface ModelResponse {
  provider: string; // Örn: "Claude", "Qwen"
  trustWeight: number; // Örn: 0.95, 0.85
  isConfirmed: boolean; // Modelin bu olayı onaylayıp onaylamadığı (True/False tespiti)
  rawText?: string;
}

export interface ConsensusResult {
  truthScore: number;
  verdict: Verdict;
  totalVotingWeight: number;
  approvedWeight: number;
  details: ModelResponse[];
}

/**
 * Qwen'in "Sovereign Swarm" manifestosuna göre yazılmış
 * Ağırlıklı Oylama (Weighted Voting) ve Hakikat Motoru.
 */
export function calculateTruthScore(responses: ModelResponse[]): ConsensusResult {
  if (responses.length === 0) {
    return {
      truthScore: 0,
      verdict: "DISPUTED",
      totalVotingWeight: 0,
      approvedWeight: 0,
      details: [],
    };
  }

  let totalVotingWeight = 0;
  let approvedWeight = 0;

  for (const res of responses) {
    totalVotingWeight += res.trustWeight;
    if (res.isConfirmed) {
      approvedWeight += res.trustWeight;
    }
  }

  if (totalVotingWeight <= 0) {
    return {
      truthScore: 0,
      verdict: "DISPUTED",
      totalVotingWeight: 0,
      approvedWeight: 0,
      details: responses,
    };
  }

  // Consensus Formülü: Σ(model_vote × model_weight) / Σ(model_weight)
  const truthScore = (approvedWeight / totalVotingWeight) * 100;

  let verdict: Verdict = "DISPUTED";
  if (truthScore >= 85) {
    verdict = "VERIFIED";
  } else if (truthScore >= 50) {
    verdict = "LIKELY";
  } else if (truthScore < 20) {
    verdict = "REJECTED";
  }

  return {
    truthScore: Number(truthScore.toFixed(2)),
    verdict,
    totalVotingWeight,
    approvedWeight,
    details: responses,
  };
}

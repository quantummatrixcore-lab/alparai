export type RankingTier = "AAA" | "AA" | "A" | "BBB" | "BB" | "B" | "CCC";

export function calculateRankingTier(score: number): RankingTier {
  if (score >= 95) return "AAA";
  if (score >= 90) return "AA";
  if (score >= 80) return "A";
  if (score >= 70) return "BBB";
  if (score >= 60) return "BB";
  if (score >= 50) return "B";
  return "CCC";
}

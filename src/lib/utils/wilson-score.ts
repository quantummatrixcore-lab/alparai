/**
 * Calculates the Wilson Score Interval (95% confidence by default)
 * for a score normalized between 0 and 100.
 */
export function calculateWilsonInterval(
  score: number,
  sampleSize: number,
  z = 1.96,
): { wilsonLower: number; wilsonUpper: number } {
  if (sampleSize <= 0) {
    return {
      wilsonLower: Math.max(0, Math.round(score - 5)),
      wilsonUpper: Math.min(100, Math.round(score + 5)),
    };
  }

  const p = Math.max(0, Math.min(1, score / 100));
  const n = sampleSize;
  const z2 = z * z;

  const denominator = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denominator;
  const spread = (z / denominator) * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n));

  const lower = Math.max(0, Math.round((center - spread) * 100));
  const upper = Math.min(100, Math.round((center + spread) * 100));

  return {
    wilsonLower: lower,
    wilsonUpper: upper,
  };
}

/**
 * ε-Differential Privacy (Laplace Mechanism) Engine
 * ALPAR AI — The Sovereign AI Accountability Platform
 *
 * Provides mathematically grounded privacy guarantees against re-identification
 * attacks on aggregate public statistics, community audit votes, and telemetry.
 *
 * Implements:
 * 1. Cryptographically Secure Laplace Noise Sampling via inverse CDF.
 * 2. Count Privatization with optional threshold suppression (k-anonymity defense).
 * 3. Histogram Privatization with parallel composition privacy preservation.
 * 4. Bounded Real-Valued Average Privatization.
 * 5. Privacy Budget Tracker (Epsilon / Delta tracking).
 */

export interface DifferentialPrivacyOptions {
  /**
   * Minimum count threshold to report. Values below this threshold after noise addition
   * are suppressed or clamped to 0 to prevent presence disclosure.
   * Default: 0
   */
  minThreshold?: number;
  /**
   * Whether to round the privatized count to the nearest non-negative integer.
   * Default: true
   */
  integerOnly?: boolean;
}

/**
 * Generates a uniform random float in (0, 1) using 53 bits of cryptographic entropy.
 * Avoids edge points 0 and 1 to guarantee safe evaluation of natural logarithms.
 */
export function secureRandomFloat(): number {
  const buffer = new Uint32Array(2);
  globalThis.crypto.getRandomValues(buffer);
  const u0 = buffer[0] ?? 0;
  const u1 = buffer[1] ?? 0;

  const high = u0 >>> 5; // 27 bits
  const low = u1 >>> 6;  // 26 bits
  const val = (high * 67108864 + low) / 9007199254740992;

  // Strict interval (1e-15, 1 - 1e-15) to prevent ln(0)
  if (val <= 0) return 1e-15;
  if (val >= 1) return 1 - 1e-15;
  return val;
}

/**
 * Samples from the Laplace distribution Lap(mu, b) using the inverse CDF method:
 * X = mu - b * sgn(U - 0.5) * ln(1 - 2 * |U - 0.5|)
 *
 * @param scale The diversity/scale parameter b = sensitivity / epsilon (must be > 0)
 * @param location The mean/location parameter mu (default: 0)
 */
export function sampleLaplace(scale: number, location = 0): number {
  if (scale <= 0 || !Number.isFinite(scale)) {
    throw new Error(`Invalid Laplace scale parameter: ${scale}. Scale must be positive and finite.`);
  }

  const u = secureRandomFloat();
  const diff = u - 0.5;
  const sgn = diff < 0 ? -1 : 1;
  const absDiff = Math.abs(diff);

  // Avoid precision underflow at exactly 0.5
  const inner = Math.max(1e-15, 1 - 2 * absDiff);
  return location - scale * sgn * Math.log(inner);
}

/**
 * Adds calibrated Laplace noise to a numerical query result to satisfy ε-Differential Privacy:
 * scale b = sensitivity / epsilon
 *
 * @param value Raw query output f(D)
 * @param sensitivity L1-sensitivity Delta f = max ||f(D1) - f(D2)||_1
 * @param epsilon Privacy parameter epsilon > 0 (smaller = higher privacy)
 */
export function addLaplaceNoise(value: number, sensitivity: number, epsilon: number): number {
  if (epsilon <= 0 || !Number.isFinite(epsilon)) {
    throw new Error(`Invalid epsilon: ${epsilon}. Epsilon must be strictly positive.`);
  }
  if (sensitivity <= 0 || !Number.isFinite(sensitivity)) {
    throw new Error(`Invalid sensitivity: ${sensitivity}. Sensitivity must be strictly positive.`);
  }

  const scale = sensitivity / epsilon;
  const noise = sampleLaplace(scale, 0);
  return value + noise;
}

/**
 * Privatizes a single count query (sensitivity = 1).
 * Clamps output to non-negative values and optionally enforces integer rounding and threshold suppression.
 *
 * @param count True raw count
 * @param epsilon Privacy parameter epsilon (typically between 0.1 and 1.5)
 * @param options Additional privatization options (minThreshold, integerOnly)
 */
export function privatizeCount(
  count: number,
  epsilon: number,
  options: DifferentialPrivacyOptions = {},
): number {
  const { minThreshold = 0, integerOnly = true } = options;

  // L1-sensitivity of a counting query is 1 (one record added or removed changes count by at most 1)
  const noisy = addLaplaceNoise(count, 1, epsilon);

  let result = Math.max(0, noisy);

  if (integerOnly) {
    result = Math.round(result);
  }

  // Threshold suppression: prevent single-out attacks on rare events
  if (minThreshold > 0 && result < minThreshold) {
    return 0;
  }

  return result;
}

/**
 * Privatizes a histogram (counts partitioned into disjoint buckets).
 * By the Parallel Composition Theorem of Differential Privacy, adding independent
 * Lap(1/epsilon) noise to each disjoint bucket preserves the total privacy budget epsilon.
 *
 * @param histogram Key-value mapping of category to raw count
 * @param epsilon Privacy parameter applied across the disjoint histogram
 * @param options Optional threshold suppression and integer rounding
 */
export function privatizeHistogram(
  histogram: Record<string, number>,
  epsilon: number,
  options: DifferentialPrivacyOptions = {},
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const [key, count] of Object.entries(histogram)) {
    result[key] = privatizeCount(count, epsilon, options);
  }

  return result;
}

/**
 * Privatizes a bounded average:
 * Sensitivity Delta f = (upper - lower) / count
 *
 * @param sum Raw sum of observations
 * @param count Number of observations
 * @param bounds [lowerBound, upperBound] of each individual observation
 * @param epsilon Privacy parameter
 */
export function privatizeAverage(
  sum: number,
  count: number,
  bounds: [number, number],
  epsilon: number,
): number {
  if (count <= 0) return 0;

  const [lower, upper] = bounds;
  if (lower >= upper) {
    throw new Error(`Invalid bounds: lower bound (${lower}) must be less than upper bound (${upper}).`);
  }

  const clampedSum = Math.min(Math.max(sum, lower * count), upper * count);
  const rawAverage = clampedSum / count;

  // L1 Sensitivity of average with bounded elements: (upper - lower) / count
  const sensitivity = (upper - lower) / count;
  const noisyAverage = addLaplaceNoise(rawAverage, sensitivity, epsilon);

  // Clamp output back to feasible domain
  return Math.min(Math.max(noisyAverage, lower), upper);
}

/**
 * Privacy Budget Tracker
 * Tracks cumulative privacy budget consumption to prevent repeated query reconstruction attacks.
 */
export class PrivacyBudgetTracker {
  private maxEpsilon: number;
  private consumedEpsilon: number;
  private maxDelta: number;
  private consumedDelta: number;

  constructor(maxEpsilon = 10.0, maxDelta = 1e-5) {
    this.maxEpsilon = maxEpsilon;
    this.consumedEpsilon = 0;
    this.maxDelta = maxDelta;
    this.consumedDelta = 0;
  }

  /**
   * Attempts to consume privacy budget. Returns true if budget is within limit, false otherwise.
   */
  public consume(epsilon: number, delta = 0): boolean {
    if (epsilon <= 0) return false;

    if (
      this.consumedEpsilon + epsilon > this.maxEpsilon ||
      this.consumedDelta + delta > this.maxDelta
    ) {
      return false;
    }

    this.consumedEpsilon += epsilon;
    this.consumedDelta += delta;
    return true;
  }

  /**
   * Returns current budget status and remaining limits.
   */
  public getBudgetStatus() {
    return {
      maxEpsilon: this.maxEpsilon,
      consumedEpsilon: parseFloat(this.consumedEpsilon.toFixed(4)),
      remainingEpsilon: parseFloat(Math.max(0, this.maxEpsilon - this.consumedEpsilon).toFixed(4)),
      maxDelta: this.maxDelta,
      consumedDelta: this.consumedDelta,
      remainingDelta: Math.max(0, this.maxDelta - this.consumedDelta),
      isExhausted: this.consumedEpsilon >= this.maxEpsilon,
    };
  }

  /**
   * Resets consumed privacy budget.
   */
  public reset(): void {
    this.consumedEpsilon = 0;
    this.consumedDelta = 0;
  }
}

/**
 * ALPAR AI — Actuarial TrustScore computation (pure)
 * ============================================================================
 * The scoring formula, extracted from the Server Action so that the action and
 * the operational recalculation script execute BYTE-IDENTICAL logic. There is
 * exactly one implementation of the formula, so the published score can never
 * drift from the score shown on the leaderboard.
 *
 * WHY THE PENALTY IS NORMALISED
 * -----------------------------
 * The original formula summed the weighted penalties of every incident and
 * subtracted the sum from a ~90-100 point base. That is mathematically
 * degenerate: with the production data set (194 incidents for OpenAI) the raw
 * penalty is ~197, so EVERY major provider collapsed onto the 10-point floor
 * with the "CCC" tier. A rating that assigns the same score to OpenAI, Google,
 * Microsoft and Anthropic is not a rating.
 *
 * A credible rating separates two independent axes, exactly like a credit
 * rating agency does:
 *
 *   AXIS 1 — EXPOSURE (how much trouble, independent of volume)
 *      meanWeightedPenalty = Σ penalty_i / totalIncidents
 *      severityPenalty      = SEVERITY_PENALTY_WEIGHT × meanWeightedPenalty
 *      This is the *quality* of the incident mix (how severe, how recent, how
 *      poorly resolved), so a provider with 200 old low-severity incidents is
 *      not punished as hard as one with 20 fresh critical ones.
 *
 *   AXIS 2 — SCALE (how much trouble, growing with volume)
 *      volumePenalty = VOLUME_PENALTY_WEIGHT × log2(1 + totalIncidents)
 *      Logarithmic so the marginal cost of one more incident shrinks as the
 *      incident count grows — a provider with 200 incidents is worse than one
 *      with 20, but not 10× worse in score terms.
 *
 *   composite = clamp(base − severityPenalty − volumePenalty
 *                      + responseRate×RESPONSE_BONUS_WEIGHT
 *                      + verificationBonus, 10, 100)
 *
 * The constants below are a calibration proposal. They are deliberately
 * documented and unit-tested so that changing the methodology is a deliberate,
 * reviewable act rather than an accident.
 *
 * Formula lineage (see also `src/actions/models/trust-score-engine.ts`):
 *
 *   penalty_i  = severityWeight(severity_i)
 *                × exp(-ageDays_i / 120)            // exponential time decay
 *                × remediationFactor(response_i)    // MTTR rebate
 * ============================================================================
 */

export const TRUST_HALF_LIFE_DAYS = 120;
export const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Points removed per unit of mean severity-weighted penalty. */
export const SEVERITY_PENALTY_WEIGHT = 4.0;
/** Points removed per doubling of the incident count. */
export const VOLUME_PENALTY_WEIGHT = 3.0;
/** Points added at a 100% response rate. */
export const RESPONSE_BONUS_WEIGHT = 5.0;
/** Points added to a verified provider. */
export const VERIFICATION_BONUS = 3.0;

export interface TrustIncidentRecord {
  id: string;
  severity: string | null;
  created_at: string;
  /**
   * Timestamp at which the vendor answered the incident.
   *
   * The production `incidents` table has NO `resolved_at` column — the
   * `incident_status` enum contains only pending_review / published / rejected
   * / archived / takedown / verified, so a status can never express
   * "resolved". The real signal is `vendor_response_at` (plus the separate
   * `ai_provider_responses` table). Selecting a non-existent `resolved_at`
   * made the whole engine query fail, which is why the actuarial score was
   * never recalculated at all.
   */
  vendor_response_at?: string | null;
  /** Legacy alias, still honoured when present. */
  resolved_at?: string | null;
}

export interface TrustProviderInput {
  id: string;
  slug: string;
  name: string;
  is_verified: boolean;
}

export interface TrustMetric {
  provider_slug: string;
  provider_name: string;
  composite_score: number;
  incident_penalty: number;
  response_rate_bonus: number;
  total_incidents: number;
  resolved_incidents: number;
  response_rate: number;
  /** Volume-normalised exposure quality (mean weighted penalty per incident). */
  mean_weighted_penalty: number;
  /** Points removed by the exposure-quality axis. */
  severity_penalty: number;
  /** Points removed by the exposure-scale axis. */
  volume_penalty: number;
}

/** Actuarial severity weight. */
export function severityWeight(severity: string | null | undefined): number {
  const sev = (severity || "").toLowerCase();
  if (sev === "critical") return 15.0;
  if (sev === "high") return 8.0;
  if (sev === "medium") return 4.0;
  if (sev === "low") return 1.5;
  return 3.0;
}

/**
 * Returns the effective resolution timestamp for an incident, tolerating both
 * the production column (`vendor_response_at`) and the legacy alias.
 */
export function effectiveResolutionAt(incident: TrustIncidentRecord): string | null {
  return incident.vendor_response_at ?? incident.resolved_at ?? null;
}

/**
 * MTTR remediation rebate factor.
 */
export function remediationFactor(
  createdAt: string,
  resolvedAt: string | null,
): { factor: number; isResolved: boolean } {
  if (!resolvedAt) return { factor: 1.0, isResolved: false };
  const durationHours = Math.max(
    0,
    (new Date(resolvedAt).getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60),
  );
  if (durationHours <= 24) return { factor: 0.4, isResolved: true };
  if (durationHours <= 168) return { factor: 0.65, isResolved: true };
  return { factor: 0.8, isResolved: true };
}

/**
 * Computes the actuarial metric for a single provider.
 */
export function computeTrustMetric(
  provider: TrustProviderInput,
  incidents: TrustIncidentRecord[],
  now: number = Date.now(),
): TrustMetric {
  const totalIncidents = incidents.length;
  let totalWeightedPenalty = 0;
  let resolvedCount = 0;

  for (const inc of incidents) {
    const weight = severityWeight(inc.severity);

    const incidentAgeDays = Math.max(0, (now - new Date(inc.created_at).getTime()) / MS_PER_DAY);
    const timeDecay = Math.exp(-incidentAgeDays / TRUST_HALF_LIFE_DAYS);

    const remediation = remediationFactor(inc.created_at, effectiveResolutionAt(inc));
    if (remediation.isResolved) resolvedCount += 1;

    totalWeightedPenalty += weight * timeDecay * remediation.factor;
  }

  const baseScore =
    totalIncidents === 0
      ? provider.is_verified
        ? 90.0
        : 75.0
      : provider.is_verified
        ? 94.0
        : 88.0;

  const responseRate = totalIncidents > 0 ? resolvedCount / totalIncidents : 0;
  const responseBonus = Number((responseRate * RESPONSE_BONUS_WEIGHT).toFixed(2));
  const verificationBonus = provider.is_verified ? VERIFICATION_BONUS : 0.0;

  // --- AXIS 1: exposure quality (volume-normalised) ------------------------
  const meanWeightedPenalty = totalIncidents > 0 ? totalWeightedPenalty / totalIncidents : 0;
  const severityPenalty = Number((SEVERITY_PENALTY_WEIGHT * meanWeightedPenalty).toFixed(4));

  // --- AXIS 2: exposure scale (logarithmic in volume) ----------------------
  const volumePenalty = Number((VOLUME_PENALTY_WEIGHT * Math.log2(1 + totalIncidents)).toFixed(4));

  const rawComposite =
    baseScore - severityPenalty - volumePenalty + responseBonus + verificationBonus;
  const compositeScore = Math.max(10.0, Math.min(100.0, Number(rawComposite.toFixed(2))));

  return {
    provider_slug: provider.slug,
    provider_name: provider.name,
    composite_score: compositeScore,
    incident_penalty: Number(totalWeightedPenalty.toFixed(2)),
    response_rate_bonus: responseBonus,
    total_incidents: totalIncidents,
    resolved_incidents: resolvedCount,
    response_rate: Number(responseRate.toFixed(4)),
    mean_weighted_penalty: Number(meanWeightedPenalty.toFixed(4)),
    severity_penalty: severityPenalty,
    volume_penalty: volumePenalty,
  };
}

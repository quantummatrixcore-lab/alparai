/**
 * ALPAR AI — Cross-Audit Engine v2.0
 *
 * Barrel re-export for backward compatibility.
 * All implementations moved to `src/lib/ai/cross-audit/`.
 *
 * @module src/lib/ai/cross-audit-engine
 */

export {
  DEBATE_CHALLENGE_PROMPT,
  DEBATE_INITIAL_PROMPT,
  DEBATE_REBUTTAL_PROMPT,
  DEBATE_SUPREME_COURT_PROMPT,
  type ChallengeResult,
  type DebateTranscript,
  type InitialEvaluation,
  type RebuttalResult,
  type TruthScoreResult,
} from "./cross-audit/debate-prompts";

export {
  safeParseJSON,
  clamp,
  clampFloat,
  runInitialEvaluation,
  runChallenge,
  runRebuttal,
  runSupremeCourtAdjudication,
} from "./cross-audit/debate-runner";

export {
  getRedis,
  computeCacheTtl,
  buildCacheKey,
  readCache,
  writeCache,
} from "./cross-audit/cache-manager";

export {
  NonRetryableError,
  runPreTriageCogsGate,
  estimateDebateCogs,
  runCrossAudit,
} from "./cross-audit/pipeline-orchestrator";

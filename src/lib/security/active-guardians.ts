/**
 * Active Guardians Central Security Bridge (ALPAR AI Trust & Shield)
 *
 * Unifies AI Cost Guard and PII Guardian to protect model routing,
 * ingestion pipelines, and client submissions from budget overruns and data leaks.
 */

// Cost Guard exports
import { isCostKillSwitchActive, getDailyCost } from "@/lib/ai/cost-guard";

// PII Guardian exports
import {
  calculateShannonEntropy,
  isHighEntropy,
  maskHighEntropyTokens,
  sanitizePII,
  maskPII,
  hasPII,
  detectPIITypes,
  PIIGuardian,
  PiiGuardian,
  SENSITIVE_CATEGORIES,
  isSensitiveCategory,
  detectContentWarning,
  hasContentWarning,
  type PiiDetection,
  type PiiScanResult,
  type ContentWarningType,
  type ContentWarningResult,
} from "@/lib/pii/guardian";

export {
  // Cost Guard
  isCostKillSwitchActive,
  getDailyCost,
  // PII Guardian
  calculateShannonEntropy,
  isHighEntropy,
  maskHighEntropyTokens,
  sanitizePII,
  maskPII,
  hasPII,
  detectPIITypes,
  PIIGuardian,
  PiiGuardian,
  SENSITIVE_CATEGORIES,
  isSensitiveCategory,
  detectContentWarning,
  hasContentWarning,
};

export type {
  PiiDetection,
  PiiScanResult,
  ContentWarningType,
  ContentWarningResult,
};

/**
 * Consolidated active security guardian instance
 */
export const activeGuardians = {
  cost: {
    isKillSwitchActive: isCostKillSwitchActive,
    getDailyCost,
  },
  pii: {
    sanitize: sanitizePII,
    mask: maskPII,
    hasPii: hasPII,
    detectTypes: detectPIITypes,
    isHighEntropy,
    calculateEntropy: calculateShannonEntropy,
    guardian: PiiGuardian,
  },
} as const;

export default activeGuardians;

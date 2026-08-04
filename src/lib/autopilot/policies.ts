import type { AutopilotConfig, AutopilotPolicy } from "./types";
import {
  DEFAULT_BREAKER,
  DEFAULT_IDEMPOTENCY,
  DEFAULT_RETRY,
  SAFE_REDACTION_FIELDS,
} from "./types";

export const submitIncidentPolicy: AutopilotPolicy = {
  config: {
    action: "submitIncident",
    retry: { ...DEFAULT_RETRY, attempts: 4, baseMs: 600, maxMs: 8_000 },
    breaker: { ...DEFAULT_BREAKER, threshold: 8, cooldownMs: 45_000 },
    budget: { maxMs: 10_000, maxTokens: 1_500 },
    idempotency: { ...DEFAULT_IDEMPOTENCY, enabled: true, hashInputs: true },
    onExhaust: "silent_log",
    redactionFields: ["password", "token", "secret", "api_key"],
  },
};

export const submitContactPolicy: AutopilotPolicy = {
  config: {
    action: "submitContact",
    retry: { ...DEFAULT_RETRY, attempts: 3, baseMs: 500, maxMs: 4_000 },
    breaker: { ...DEFAULT_BREAKER, threshold: 12, cooldownMs: 30_000 },
    budget: { maxMs: 6_000, maxTokens: 800 },
    idempotency: { ...DEFAULT_IDEMPOTENCY, enabled: true, hashInputs: true },
    onExhaust: "toast_warn",
    redactionFields: ["password", "token", "secret", "api_key", "email"],
  },
};

export const submitTakedownPolicy: AutopilotPolicy = {
  config: {
    action: "submitTakedown",
    retry: { ...DEFAULT_RETRY, attempts: 5, baseMs: 750, maxMs: 12_000 },
    breaker: { ...DEFAULT_BREAKER, threshold: 6, cooldownMs: 60_000 },
    budget: { maxMs: 15_000, maxTokens: 2_000 },
    idempotency: { ...DEFAULT_IDEMPOTENCY, enabled: true, hashInputs: true },
    onExhaust: "email_fallback",
    redactionFields: ["password", "token", "secret", "api_key", "identity_proof_url"],
  },
};

export const voteIncidentPolicy: AutopilotPolicy = {
  config: {
    action: "voteIncident",
    retry: { ...DEFAULT_RETRY, attempts: 3, baseMs: 200, maxMs: 2_000 },
    breaker: { ...DEFAULT_BREAKER, threshold: 20, cooldownMs: 15_000 },
    budget: { maxMs: 3_000, maxTokens: 400 },
    idempotency: { ...DEFAULT_IDEMPOTENCY, enabled: true, hashInputs: true },
    onExhaust: "silent_log",
    redactionFields: [],
  },
};

export const moderateIncidentPolicy: AutopilotPolicy = {
  config: {
    action: "moderateIncident",
    retry: { ...DEFAULT_RETRY, attempts: 3, baseMs: 400, maxMs: 4_000 },
    breaker: { ...DEFAULT_BREAKER, threshold: 10, cooldownMs: 30_000 },
    budget: { maxMs: 8_000, maxTokens: 1_200 },
    idempotency: { ...DEFAULT_IDEMPOTENCY, enabled: true, hashInputs: true },
    onExhaust: "escalate_admin",
    redactionFields: ["password", "token", "secret"],
  },
};

export const submitSuggestionPolicy: AutopilotPolicy = {
  config: {
    action: "submitSuggestion",
    retry: { ...DEFAULT_RETRY, attempts: 3, baseMs: 400, maxMs: 3_000 },
    breaker: { ...DEFAULT_BREAKER, threshold: 15, cooldownMs: 30_000 },
    budget: { maxMs: 5_000, maxTokens: 600 },
    idempotency: { ...DEFAULT_IDEMPOTENCY, enabled: true, hashInputs: true },
    onExhaust: "toast_warn",
    redactionFields: ["password", "token", "secret", "api_key"],
  },
};

export const reviewTakedownPolicy: AutopilotPolicy = {
  config: {
    action: "reviewTakedown",
    retry: { ...DEFAULT_RETRY, attempts: 4, baseMs: 500, maxMs: 6_000 },
    breaker: { ...DEFAULT_BREAKER, threshold: 10, cooldownMs: 30_000 },
    budget: { maxMs: 8_000, maxTokens: 800 },
    idempotency: { ...DEFAULT_IDEMPOTENCY, enabled: true, hashInputs: true },
    onExhaust: "escalate_admin",
    redactionFields: ["password", "token", "secret"],
  },
};

export const exportDataPolicy: AutopilotPolicy = {
  config: {
    action: "exportUserData",
    retry: { ...DEFAULT_RETRY, attempts: 2, baseMs: 800, maxMs: 6_000 },
    breaker: { ...DEFAULT_BREAKER, threshold: 5, cooldownMs: 60_000 },
    budget: { maxMs: 20_000, maxTokens: 4_000 },
    idempotency: { ...DEFAULT_IDEMPOTENCY, enabled: true, hashInputs: true },
    onExhaust: "silent_log",
    redactionFields: SAFE_REDACTION_FIELDS,
  },
};

export const submitModelReviewPolicy: AutopilotPolicy = {
  config: {
    action: "submitModelReview",
    retry: { ...DEFAULT_RETRY, attempts: 3, baseMs: 400, maxMs: 3_000 },
    breaker: { ...DEFAULT_BREAKER, threshold: 15, cooldownMs: 30_000 },
    budget: { maxMs: 5_000, maxTokens: 600 },
    idempotency: { ...DEFAULT_IDEMPOTENCY, enabled: true, hashInputs: true },
    onExhaust: "toast_warn",
    redactionFields: ["password", "token", "secret", "api_key"],
  },
};

export const submitModelFeatureRequestPolicy: AutopilotPolicy = {
  config: {
    action: "submitModelFeatureRequest",
    retry: { ...DEFAULT_RETRY, attempts: 3, baseMs: 400, maxMs: 3_000 },
    breaker: { ...DEFAULT_BREAKER, threshold: 15, cooldownMs: 30_000 },
    budget: { maxMs: 5_000, maxTokens: 600 },
    idempotency: { ...DEFAULT_IDEMPOTENCY, enabled: true, hashInputs: true },
    onExhaust: "toast_warn",
    redactionFields: ["password", "token", "secret", "api_key"],
  },
};

export const syncNewsPolicy: AutopilotPolicy = {
  config: {
    action: "syncNews",
    retry: { ...DEFAULT_RETRY, attempts: 2, baseMs: 1000, maxMs: 5_000 },
    breaker: { ...DEFAULT_BREAKER, threshold: 5, cooldownMs: 60_000 },
    budget: { maxMs: 30_000, maxTokens: 4_000 },
    idempotency: { ...DEFAULT_IDEMPOTENCY, enabled: true, hashInputs: true },
    onExhaust: "silent_log",
    redactionFields: ["api_key"],
  },
};

export const autoModerateIncidentPolicy: AutopilotPolicy = {
  config: {
    action: "autoModerateIncident",
    retry: { ...DEFAULT_RETRY, attempts: 3, baseMs: 500, maxMs: 4_000 },
    breaker: { ...DEFAULT_BREAKER, threshold: 10, cooldownMs: 30_000 },
    budget: { maxMs: 15_000, maxTokens: 2_000 },
    idempotency: { ...DEFAULT_IDEMPOTENCY, enabled: true, hashInputs: true },
    onExhaust: "silent_log",
    redactionFields: [],
  },
};

export const subscribeNewsletterPolicy: AutopilotPolicy = {
  config: {
    action: "subscribeNewsletter",
    retry: { ...DEFAULT_RETRY, attempts: 3, baseMs: 500, maxMs: 4_000 },
    breaker: { ...DEFAULT_BREAKER, threshold: 15, cooldownMs: 30_000 },
    budget: { maxMs: 5_000, maxTokens: 600 },
    idempotency: { ...DEFAULT_IDEMPOTENCY, enabled: true, hashInputs: true },
    onExhaust: "toast_warn",
    redactionFields: ["password", "token", "secret", "api_key", "email"],
  },
};

export const weeklyReportPolicy: AutopilotPolicy = {
  config: {
    action: "weeklyReport",
    retry: { ...DEFAULT_RETRY, attempts: 2, baseMs: 1_500, maxMs: 10_000 },
    breaker: { ...DEFAULT_BREAKER, threshold: 4, cooldownMs: 120_000 },
    budget: { maxMs: 60_000, maxTokens: 8_000 },
    idempotency: { ...DEFAULT_IDEMPOTENCY, enabled: true, hashInputs: true },
    onExhaust: "silent_log",
    redactionFields: ["api_key"],
  },
};

export const weeklyPollPolicy: AutopilotPolicy = {
  config: {
    action: "weeklyPoll",
    retry: { ...DEFAULT_RETRY, attempts: 2, baseMs: 1_000, maxMs: 8_000 },
    breaker: { ...DEFAULT_BREAKER, threshold: 4, cooldownMs: 120_000 },
    budget: { maxMs: 30_000, maxTokens: 4_000 },
    idempotency: { ...DEFAULT_IDEMPOTENCY, enabled: true, hashInputs: true },
    onExhaust: "silent_log",
    redactionFields: ["api_key"],
  },
};

export const submitWhistleblowerPolicy: AutopilotPolicy = {
  config: {
    action: "submitWhistleblower",
    retry: { ...DEFAULT_RETRY, attempts: 3, baseMs: 500, maxMs: 4_000 },
    breaker: { ...DEFAULT_BREAKER, threshold: 10, cooldownMs: 30_000 },
    budget: { maxMs: 8_000, maxTokens: 1_000 },
    idempotency: { ...DEFAULT_IDEMPOTENCY, enabled: true, hashInputs: true },
    onExhaust: "toast_warn",
    redactionFields: ["password", "token", "secret", "api_key", "encrypted_content"],
  },
};

export const submitInvestorPolicy: AutopilotPolicy = {
  config: {
    action: "submitInvestor",
    retry: { ...DEFAULT_RETRY, attempts: 3, baseMs: 500, maxMs: 4_000 },
    breaker: { ...DEFAULT_BREAKER, threshold: 12, cooldownMs: 30_000 },
    budget: { maxMs: 6_000, maxTokens: 800 },
    idempotency: { ...DEFAULT_IDEMPOTENCY, enabled: true, hashInputs: true },
    onExhaust: "toast_warn",
    redactionFields: ["password", "token", "secret", "api_key", "email"],
  },
};

export const policies = {
  submitIncident: submitIncidentPolicy,
  submitContact: submitContactPolicy,
  submitTakedown: submitTakedownPolicy,
  voteIncident: voteIncidentPolicy,
  moderateIncident: moderateIncidentPolicy,
  submitSuggestion: submitSuggestionPolicy,
  reviewTakedown: reviewTakedownPolicy,
  exportUserData: exportDataPolicy,
  submitModelReview: submitModelReviewPolicy,
  submitModelFeatureRequest: submitModelFeatureRequestPolicy,
  syncNews: syncNewsPolicy,
  autoModerateIncident: autoModerateIncidentPolicy,
  subscribeNewsletter: subscribeNewsletterPolicy,
  weeklyReport: weeklyReportPolicy,
  weeklyPoll: weeklyPollPolicy,
  submitWhistleblower: submitWhistleblowerPolicy,
  submitInvestor: submitInvestorPolicy,
} as const;

export type AutopilotPolicyName = keyof typeof policies;

export const getPolicy = (name: AutopilotPolicyName): AutopilotPolicy => policies[name];

export const isAutopilotPolicyName = (v: string): v is AutopilotPolicyName =>
  Object.prototype.hasOwnProperty.call(policies, v);

export const policyNames = (): ReadonlyArray<AutopilotPolicyName> =>
  Object.keys(policies) as AutopilotPolicyName[];

export const buildConfig = (
  base: AutopilotConfig,
  overrides: Partial<AutopilotConfig>,
): AutopilotConfig => {
  return {
    ...base,
    ...overrides,
    retry: { ...base.retry, ...(overrides.retry ?? {}) },
    breaker: { ...base.breaker, ...(overrides.breaker ?? {}) },
    budget: { ...base.budget, ...(overrides.budget ?? {}) },
    idempotency: { ...base.idempotency, ...(overrides.idempotency ?? {}) },
    redactionFields: overrides.redactionFields ?? base.redactionFields,
  };
};

/**
 * Application-wide constants.
 */

export const APP_NAME = "ALPAR AI" as const;
export const APP_DESCRIPTION =
  "Trust infrastructure for AI accountability. Community-driven incident reporting platform." as const;
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ("https://alparai.com" as const);
export const APP_EMAIL = "hello@alparai.com" as const;
export const APP_TAKEDOWN_EMAIL = process.env.TAKEDOWN_EMAIL ?? ("takedown@alparai.com" as const);

export const DEFAULT_LOCALE = "en" as const;
export const SUPPORTED_LOCALES = ["en", "tr", "de", "fr", "ru"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const GITHUB_URL = "https://github.com/quantummatrixcore-lab/Alparai.com" as const;
export const LINKEDIN_URL =
  process.env.NEXT_PUBLIC_LINKEDIN_URL ?? ("https://www.linkedin.com/company/alpar-ai" as const);
export const TWITTER_URL =
  process.env.NEXT_PUBLIC_TWITTER_URL ?? ("https://twitter.com/alparai" as const);

export const SEVERITY_LEVELS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
] as const;
export type Severity = (typeof SEVERITY_LEVELS)[number]["value"];

export const INCIDENT_CATEGORIES = [
  { value: "hallucination", label: "Hallucination" },
  { value: "bias", label: "Bias" },
  { value: "privacy", label: "Privacy" },
  { value: "security", label: "Security" },
  { value: "misinformation", label: "Misinformation" },
  { value: "harassment", label: "Harassment" },
  { value: "manipulation", label: "Manipulation" },
  { value: "inaccessibility", label: "Inaccessibility" },
  { value: "copyright", label: "Copyright" },
  { value: "non_consensual_intimate_imagery_csam", label: "NCII / CSAM (Art. 5)" },
  { value: "other", label: "Other" },
] as const;
export type IncidentCategory = (typeof INCIDENT_CATEGORIES)[number]["value"];

export const SUGGESTION_CATEGORIES = [
  { value: "feature", label: "Feature" },
  { value: "improvement", label: "Improvement" },
  { value: "bug", label: "Bug" },
  { value: "content", label: "Content" },
  { value: "integration", label: "Integration" },
] as const;
export type SuggestionCategory = (typeof SUGGESTION_CATEGORIES)[number]["value"];

export const SUGGESTION_STATUSES = [
  { value: "open", label: "Open" },
  { value: "under_review", label: "Under review" },
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "declined", label: "Declined" },
] as const;
export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number]["value"];

// Default dashboard / metrics values
export const DEFAULT_RESPONSE_RATE = 82.5 as const;
export const DEFAULT_TRUST_SCORE = 78.0 as const;

// Default strategy overview metric fallback values
export const STRATEGY_METRICS_DEFAULTS = {
  health_score: 92,
  total_users: 47,
  total_incidents: 12,
  active_providers: 6,
  media_mentions_count: 0,
  mrr_cents: 0,
  runway_months: 18.0,
} as const;

export const DEFAULT_VALUATION_PRE_MONEY = 2340000 as const; // $2,340,000

/**
 * Stable IDs + i18n keys for takedown reasons.
 * Labels are resolved at render time via useTranslations("takedown.reasons.*").
 */

export const TAKEDOWN_REASON_KEYS = [
  "defamation",
  "copyright",
  "privacy",
  "factual_error",
  "legal_court_order",
  "other",
] as const;

export type TakedownReasonKey = (typeof TAKEDOWN_REASON_KEYS)[number];

export interface TakedownReasonOption {
  value: TakedownReasonKey;
  translationKey: string;
}

export const TAKEDOWN_REASON_OPTIONS: TakedownReasonOption[] = TAKEDOWN_REASON_KEYS.map((key) => ({
  value: key,
  translationKey: `takedown.reasons.${key}`,
}));

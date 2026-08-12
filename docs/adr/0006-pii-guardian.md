# ADR-006: PII Guardian on submit

- **Status:** Accepted
- **Date:** 2026-06-01

## Decision

Every user-submitted free-text field (`incident.title`, `incident.description`, `suggestion.description`, `comment.body`) is scanned by a server-side **PII Guardian** before insert. Detected PII is replaced with placeholders; the masked text is what gets stored in the public-facing columns.

## Rationale

- Submitters often paste screenshots, error messages, and log snippets that contain personal data.
- We cannot trust users to scrub PII themselves. Mistakes are common.
- KVKK / GDPR violations are expensive and damage the platform's reputation.

## Implementation

`src/lib/pii/guardian.ts` — pure functions, no I/O.

- `detectPII(text) → { hasPII, types: PIIType[] }`
- `maskPII(text) → { masked, types }`

Detected types: `email`, `phone`, `tc_kimlik`, `iban`, `credit_card` (Luhn-valid only), `ipv4`, `url_with_token`, `api_key` (sk-, ghp\_, AKIA, xai-), `passport_tr`, `dob`.

## False positives

- IBAN regex catches long all-digit strings. We accept false positives (over-masking) over false negatives.
- Email regex matches `name@domain`. Acceptable.
- Luhn filter reduces credit card false positives to ~1%.

## Storage shape

- `incidents.title_masked` and `incidents.description_masked` are the public strings.
- `incidents.title` and `incidents.description` are visible only to the submitter, moderators, and admins (via RLS).
- `incidents.pii_categories` is a denormalized array of detected types for filtering & audit.

## Limitations

- PII Guardian is regex-based. Adversarial PII (e.g. obfuscated phone numbers like "5 five 5 1 2 3 4") will not be caught.
- A separate takedown queue is the safety net.

## Alternatives

- **LLM-based PII detection:** rejected for v1. Cost, latency, and a new dependency.
- **Client-side PII scrub:** rejected. The source of truth must be server-side.
- **Reject submission on PII:** rejected. Over-masking is friendlier than blocking.

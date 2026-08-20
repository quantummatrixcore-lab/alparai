# RATE-1

**RATE-1** — Rate limiting reaches 24 of 92 API route files. Owner: Implementer. Priority: P1.
Measured 2026-08-20: 92 `route.ts` files under `src/app/api/`, 24 referencing `rate-limit` or
`checkRateLimit`.

**26% is a measurement, not yet a defect count.** Many of the 68 are read-only endpoints where a limit
adds little, and blanket application would be its own mistake. What is missing is the decision: nobody
has classified them, so no one can say whether an unprotected route is unprotected by choice.

## Required work

Classify all 92 routes into three groups and record the table here: (a) mutates state, (b) costs money
per call — anything reaching an LLM provider or a paid API, (c) read-only and cheap. Every route in
(a) and (b) gets a limit through the existing `src/lib/utils/rate-limit.ts` and its `RATE_LIMITS`
tiers; group (c) is documented as a deliberate exclusion.

An enforcer is in scope once the classification exists: a new `route.ts` exporting `POST`, `PUT`,
`PATCH` or `DELETE` without a rate-limit import fails CI, ratcheted against the group (c) baseline.

## Acceptance

- The classification table is in this file, covering all 92 routes
- Every mutating or paid route imports a limiter
- The enforcer fails on a new unprotected mutating route (negative test)

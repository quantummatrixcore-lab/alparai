# LEAD-1

**LEAD-1** — Display `response_rate` on the leaderboard. Owner: Implementer. Priority: P1
(v13.45).

## Why this is smaller than it was reported

An external audit called this "the biggest missing lever". The data already exists:
`response_rate` and `response_count` are columns on `ai_providers` and are **already selected**
by `getHomeData` in `src/app/[locale]/page.tsx:75`. Nothing needs to be computed or migrated —
the values are fetched and then not rendered.

## Why it is worth doing

Response rate is the only leaderboard metric a provider can improve by acting well. It turns the
board from purely punitive into something that rewards engagement, and it does so without any
payment changing hands — which keeps it clean under the payer test (v13.45).

## Scope

- Render `response_rate` as a column in the leaderboard table and in `LeaderboardPreview`.
- Handle null honestly: a provider with no incidents has no response rate; show that rather than
  a zero, which would read as a failure to respond.
- i18n keys in all five languages — this is a public page.

## Acceptance

`node scripts/check-i18n.mjs` exits 0; providers with null response rate render a distinct
state, not `0%`.

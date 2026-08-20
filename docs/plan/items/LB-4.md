# LB-4

**LB-4** — Record a vendor's public statement about an incident as a distinct kind of response.
Owner: Implementer. Priority: P1. Subsumes the approved plan's LB-5 (the UI half), because the schema
change and the way it is displayed are one decision: the value of separating the two response types
is lost entirely if the interface presents them as the same thing.

## The Founder's request

When an AI vendor takes remedial action on an incident and says so publicly, that should count as
having responded. Today it cannot be recorded at all.

## Why it does not fit the existing table

The provider-response feature is already built end to end: table `ai_provider_responses`
(`supabase/migrations/20260605000001_initial_schema.sql:187-199`), token-gated form
`src/components/incidents/provider-response-form.tsx`, server action `src/actions/provider-response.ts`
(auto-publishes on token validation, no moderation step), and it is already surfaced on the incident
detail page, the leaderboard (`response_rate`), the transparency page and the press kit.

The blocker is `responder_email text not null` together with the token flow. Both assume **the
provider submitted the response itself**. An observed public statement has no provider email and no
token — nobody handed it to us, we found it.

That difference is not a technicality, and it is the reason the two must stay separate in the data
model rather than being merged for convenience: a token-verified reply is the vendor answering
ALPAR AI; a public statement is evidence that the vendor said something to the world. Presenting the
second as the first would be the project asserting a verification it never performed.

## Schema

Migration against `ai_provider_responses`:

- add `response_type text not null default 'official_reply'`, constrained to
  `('official_reply','public_statement')`
- relax `responder_email` to nullable, with a check constraint requiring it to be non-null when
  `response_type = 'official_reply'` — the existing token flow keeps its current guarantee exactly
- add `source_url text` (required for `public_statement`), `statement_date date`, and `verified_by
uuid` referencing the moderator who confirmed it
- RLS: a `public_statement` row may be inserted **only by a moderator**. It carries no token, so
  there is nothing else that can vouch for it

## View

Update `provider_leaderboard` to expose `official_response_count`, `public_statement_count`,
`response_rate` — **official replies only, its current meaning preserved** — and a new
`disclosure_rate` covering both.

Redefining what the existing percentage means without renaming it would silently rewrite every
historical reading of that number, including any already cited externally. New meaning, new column.

## Interface

`provider-response-card.tsx` and the leaderboard row render `public_statement` with its own label and
a link to `source_url` — "publicly stated", cited — visually distinct from the verified "official
response" badge. The incident timeline in `incident-detail.tsx:97-115` gains a third state alongside
"Defendant Response" and "Awaiting Defendant Response".

## Acceptance

- Inserting one `public_statement` as a moderator leaves `response_rate` unchanged and moves
  `disclosure_rate`
- An `official_reply` with a null `responder_email` is rejected by the database, not by application
  code alone
- A non-moderator cannot insert a `public_statement`
- The two response types are distinguishable in a screenshot without reading the source
- Reported per G-7: commit SHA plus the branch it was pushed to, re-read from `origin`

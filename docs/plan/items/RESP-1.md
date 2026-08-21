# RESP-1

**RESP-1** — A vendor's public statement cannot be recorded, because nothing writes one.
Owner: Implementer. Priority: **P0.** Measured 2026-08-21.

`LB-4` built the schema, the scoring and the display: `response_type` with its constraint, the
moderator-only insert policy, `source_url`, `statement_date`, `verified_by`, `public_statement_count`
and `disclosure_rate` in the leaderboard view, and a distinct label in
`provider-response-card.tsx`. All of it works.

**`public_statement` appears in exactly three files** — `incident-detail.tsx`,
`provider-response-card.tsx` and `types/index.ts`. All three **read** it. There is no form, no server
action, no import path and no admin screen that **writes** one. The feature is complete except for the
part where a human can use it.

That is why every incident reads "awaiting response" regardless of what the vendor actually did in
public. The Founder's instruction — record a vendor's public remediation statement as a response, and
leave the rest as unanswered — is already correct in the data model and impossible in practice.

## Required work

**1. A moderator entry path.** An admin screen on the incident detail view: paste the statement URL,
the date, the quoted text and the provider, and it inserts a `public_statement` row with
`verified_by` set to the moderator. The RLS policy already refuses anyone else, so this is a form over
an existing, protected write.

**2. Bulk entry, because the backlog is the point.** The corpus carries thousands of incidents and the
vendor statements for many of them already exist publicly. A one-at-a-time form will never catch up.
A CSV path — incident id or external id, statement URL, date, quote — reusing the batching in
`src/lib/import/incident-importer.ts` rather than a second importer.

**3. Leave the negative alone.** An incident with no response must keep showing as unanswered. That is
the whole value of the number, and it is already the behaviour: `response_rate` counts official
replies only, `disclosure_rate` covers both. Nothing here changes either definition.

## Acceptance

- A moderator can record a public statement from the UI and it appears on the incident with its source
- A non-moderator attempt is refused by the database
- Bulk entry loads a file of statements and reports inserted/skipped counts
- An incident with no response still reads as unanswered, and `response_rate` is unchanged by a
  `public_statement`

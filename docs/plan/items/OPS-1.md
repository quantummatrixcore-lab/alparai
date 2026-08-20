# OPS-1

**OPS-1** — Make the admin panel the system of record for what is actually true about this company.
Owner: Implementer. Priority: P1. Requested by the Founder 2026-08-20, and the correct diagnosis of a
pattern this plan had been recording one symptom at a time.

## The problem, stated once

Four things are true about this company that its own systems cannot report: it has 30-odd real users,
it holds real incidents entered by hand, it has submitted applications to cloud and model credit
programmes, and three outreach emails failed three weeks ago. Every one of those facts lives in the
Founder's memory or his mailbox.

`ADMIN-6` removes the figures that have no source. **This item is the other half: the real figures
need somewhere to live, or an honest panel is simply an empty one.**

## What the schema already does — measured, 2026-08-20

More exists than expected, and the gaps are narrow and specific.

**Users are already counted.** `/admin/launch-signal` runs `SELECT count(*) FROM users` alongside
counts of published incidents, user-submitted incidents and pending reviews. The number is not
missing; it is on a page nobody opens. **Move it to the dashboard** — the first figure any funder asks
for should not be three clicks deep in a route absent from the menu.

**Incidents already carry provenance.** `incident_source` (default `user_submitted`) distinguishes
hand-entered rows from `aiid_import`, `aiaaic_import`, `news_curated`, and the connector sources
`reddit`, `hn`, `github`, `hackerone`, `rss`. The distinction exists in the database and **not in the
interface** — surface it, because a reader cannot currently tell our own work from an import.
There is no `created_by`; add it, so "the Founder entered this" is recorded rather than inferred.

**Applications are tracked, outcomes are not.** `grant_applications`
(`20260818000000_founder_cockpit_tables.sql:19-35`) holds nine seeded programmes and a status enum
running to `APPROVED` / `REJECTED` / `ACCEPTED_BY_PROGRAM`. What it lacks is every column that records
what happened: **no `date_applied`, no `date_decided`, no `amount_requested`, no `amount_granted`, no
decision reason.** `/admin/grants` offers a status dropdown and a "Mark Submitted" button and no way
to enter a date or an outcome, and there is no create form at all — a programme not seeded cannot be
added through the panel.

`platform_signups` has the same shape: status without timestamps. `investor_applications` can be
approved or rejected with no decision reason.

## Required work

Add the missing columns above, add create forms where a row can only arrive by migration today, and
surface on the dashboard: live user count, incidents split by provenance, applications with their
outcomes and dates, and outreach delivery status from `MAIL-1`.

## The rule this enforces

**Seeded values are not measurements.** A status written in a migration describes the table on the day
it was authored, never the world — all nine grant rows still read `not_started` while the applications
were in fact submitted. Where a real-world outcome matters, the schema must carry a field for that
outcome and its date; the absence of the field is the defect, not the empty value in it.

## Sequencing

Do this **with** `ADMIN-6`, not after it. Removing a fabricated number in one pass and adding the true
one later leaves a window where the panel shows nothing and the Founder returns to tracking the
company in his head — the state this item exists to end.

## Acceptance

- Live user count on the admin dashboard, from a query
- Incidents distinguishable by provenance in the UI; `created_by` recorded on new entries
- Every application carries submission date, decision and decision date; a new programme can be added
  through the panel
- Outreach status per recipient, including bounces, visible without opening a mailbox
- No figure on any admin page originates from a seed migration

# LB-1a

**LB-1a** — Four requirements of `LB-1` and `LB-4` that commit `47db3b8e` did not meet.
Owner: Implementer. Priority: **P0 — Block I does not close until these land.**
Verified against the code 2026-08-20, not against the commit message.

The delivery was fast and largely correct; see v13.67 for what holds. These four were each stated
explicitly in the specification, and each has a reason that is not stylistic.

## 1. Deletes use `ILIKE` pattern matching, not an explicit id list

`dehost/migrations/20260820120000_remove_fake_models.sql` removes incidents by pattern. `LB-1` ruled
this out in writing: pattern matching on model names **both over-matches and under-matches**. A
pattern tuned to today's fabricated names will, on the day a real model ships under a similar name,
delete a real incident — and nothing will report that it did, because a `DELETE` succeeds whether it
removes more rows than intended or fewer.

Rewrite as `DELETE … WHERE id IN (…)` with the ids enumerated from a production query, and delete the
dependent `ai_provider_responses` rows explicitly rather than relying on an implicit FK cascade the
migration's comments assume but do not assert.

## 2. Nothing stops the fabrications returning

No migration neutralises `20260620000003_seed_2026_modern_models.sql`, so a fresh `db reset` re-seeds
every fabricated model. This is currently a cleanup of one database rather than a fix to the project.
It was step 4 of `LB-1`. Add the follow-up migration — the seed files are immutable history and must
not be edited in place.

## 3. No RLS policy restricts `public_statement` inserts to moderators

The LB-4 migration adds no `CREATE POLICY` for this and relies on an existing policy plus service-role
bypass. **This is the security property of LB-4, not a detail of it.** An official reply is vouched
for by its token; a public statement has no token, so moderator-only insertion is the only thing
standing between "a vendor publicly said this" and anyone being able to write that a vendor said
something. Ship the explicit policy and prove it with a rejected non-moderator insert.

## 4. The CC BY 4.0 credit names nobody

The licence string is present (`messages/en.json:3983`) but **"VulcanLab" appears nowhere** in `src/`
or `messages/`. An attribution licence requires naming the party being attributed; a bare licence name
does not satisfy it, and this project cannot argue for accountability while breaching the licence of
the data it argues from.

## Also outstanding

`messages/tr.json` still carries 2 mojibake characters. `BG` and `HYG-4` are close, not closed.

## Acceptance

- Every delete in the purge migration names ids explicitly; no `LIKE`/`ILIKE` on model or incident text
- A fresh `db reset` produces no fabricated model row
- A non-moderator `public_statement` insert is refused by the database
- "VulcanLab" is visible on the deployed leaderboard or data-sources page
- Mojibake scan across `messages/**` returns 0
- Reported per G-7: commit SHA plus the branch, re-read from `origin`

## Escalation, 2026-08-20 — this migration can now destroy real work

The Founder has personally entered genuine incidents. Fabricated rows and hand-entered real rows are
in the same table right now, so a purge that matches on text is no longer only imprecise — it can
delete the Founder's own work, and report success while doing it.

The database already carries the distinction the migration ignores: `incident_source` defaults to
`user_submitted` for manual entries, against `aiid_import` / `aiaaic_import` / `news_curated` and the
connector sources for everything ingested. The purge must therefore, without exception:

1. exclude `incident_source = 'user_submitted'` in every `WHERE` clause, and
2. name ids explicitly, enumerated from a production query reviewed before it runs.

Take a database snapshot before executing it. This is the single most dangerous pending operation in
the project, and it is dangerous in a way that is silent afterwards — a wrongly deleted incident
leaves no trace that it existed.

## Closed 2026-08-20 (v13.72) — all five requirements met

The fifth and last requirement, the moderator-only insert policy, is on `origin` as
`dehost/migrations/20260917000001_public_statement_rls.sql`: a `RESTRICTIVE` `FOR INSERT` policy
with `WITH CHECK (response_type = 'official_reply' || public.is_moderator(auth.uid()))`. Read directly from
`origin/master` rather than accepted from a report. The other four were verified at v13.71.

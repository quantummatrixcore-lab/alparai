# LB-1

**LB-1** — Remove fabricated AI models, and the incidents attributed to them, from the production
database. Owner: Implementer. Priority: **P0 — this is published content naming a real company.**
Found 2026-08-20 while investigating the Founder's report that `/en/leaderboard` shows "mock data,
nonsense models".

## What is wrong

The leaderboard page is not the defect. `src/app/[locale]/leaderboard/page.tsx:53-58` runs a real
server-side query against the `provider_leaderboard` view
(`supabase/migrations/20260904000000_update_trust_score.sql:10-24`), which computes trust score live
as `100 - (incident_count * 2) + (response_count * 5)`, clamped 0-100. The page renders exactly what
the database contains. **The fabrication is in the database, placed there by seed migrations.**

`supabase/migrations/20260620000003_seed_2026_modern_models.sql` and sibling seed migrations insert
model names including `Claude 3.5 Opus`, `Claude 4.5 Opus`, `Claude 4.6 Sonnet`, `Claude 4.7 Opus`,
`Claude 4.8 Opus` and `Claude 4.8 Sonnet`. **None of these models exist.** They were never released
by the vendor named.

One row is materially worse than the rest. Seeded with `status='published'`, therefore live:

> "Claude Code Opus 4.7 running a Kanban swarm autonomously wiped 7 user project directories …
> Model confessed responsibility in session."

This is a public accusation of data destruction against a named real company, concerning a product
that has never existed, published by a project whose stated purpose is holding AI systems
accountable for unverified claims. It is the same defect class as `CONST-2` (fabricated quotes
attributed to real AI products) with one aggravating difference: `CONST-2` sits behind an admin gate,
this is on a public page. **This item outranks everything else on the board until it is removed.**

## Required correction

**1. Enumerate live state before writing anything.** Every count in this specification is a
repository-side figure — outbound HTTP from the Architect's container is blocked, so production row
counts were **not measured**. Query production first:

```sql
SELECT id, name, provider_id FROM ai_models ORDER BY name;
SELECT id, title, ai_model_id, status FROM incidents WHERE status = 'published';
```

**2. Build the removal list by verification, not by pattern.** A model row stays only if its name
appears in that vendor's own published model list. Anything that cannot be verified against a vendor
source is removed. Do not regex on version numbers — it both over-matches (removing real models) and
under-matches (missing fabrications that use plausible numbering).

**3. Ship a new migration** under `supabase/migrations/` that deletes the identified `ai_models`
rows, every `incidents` row referencing them, and any `ai_provider_responses` cascading from those.
Use targeted `DELETE … WHERE id IN (…)` with the explicit id list. **Never `TRUNCATE`** — the same
tables hold rows that must survive.

**4. Neutralise the source.** Migrations are immutable history, so do not edit the seed files in
place; add a follow-up migration that prevents the fabricated rows returning on the next `db reset`.
Without this step the cleanup is undone by the next environment rebuild.

## Enforcer (Doctrine #047) — folded in from the approved plan's LB-6

`scripts/check-model-catalog.mjs`: fail CI when a migration or `src/lib/constants/models-catalog.ts`
introduces a model name absent from a maintained allowlist of verified released models. Ratcheted
with a baseline file, following the established pattern of `check-repo-language.mjs`. A negative test
is required — the script must exit 1 when a fabricated name is reintroduced, not merely pass today.

Without the enforcer this item is a one-time cleanup that the next seed migration silently reverses,
which is precisely how the fabricated rows reached production in the first place.

## Acceptance

- `SELECT name FROM ai_models ORDER BY name` lists only models verifiable against a vendor source
- The fabricated incident is absent from `/en/incidents` and from the named provider's
  `incident_count` on the live leaderboard
- `node scripts/check-model-catalog.mjs` passes on the cleaned tree and exits 1 on a reintroduced
  fabricated name
- Reported per G-7: commit SHA plus the branch it was pushed to, re-read from `origin`

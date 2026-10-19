# WORK-ORDER-012 — PROD-DATA PREP (non-destructive) + GATED WRITES

## Recon (Auditor, read-only on alparai_prod, 2026-09-13)

- `expert_applications.reviewed_by`: 4/4 uuid-format, 0 null → TYPE change safe.
- `grant_applications.completed_by`: 9/9 NULL → TYPE change safe.
- `incidents` needing provider backfill: **2497 rows**; model backfill: **476 rows**.
- Dupe rows for the 2 unique indexes: NOT YET LISTED (do below).

## Phase A — Do now (zero prod writes, zero risk)

1. Split ALL seed INSERTs out of `0001_full_schema.sql` into `dehost/migrations/0003_seeds.sql`; each statement guarded to no-op on non-empty tables (e.g. `WHERE NOT EXISTS (SELECT 1 FROM <table>)` pattern or DO-block count check). 0001 must contain DDL + constraints + backfill-shaped guards ONLY.
2. Re-run full acceptance on fresh staging (both files + seeds file): exit 0, counts, seed roundtrip.
3. Dupe report: list every duplicate row set blocking `unique_question_model` and `unique_incident_title_provider` with full row detail (ids, titles, created_at) into `docs/PROPOSALS/DEDUPE_REPORT.md`. NO DELETES.
4. `## WO-012` entry FIRST with raw outputs. TREE_LOCK_LAW.md applies (cwd proofs, freeze during audit, numbers-honesty law).

## Phase B — GATED (do NOT execute without owner word "prod-yaz")

5. Backfill 2497 + 476 rows ("Unknown Provider/Model" — VISIBLE on site).
6. ALTER TYPE reviewed_by/completed_by to uuid (recon-safe).
7. Dedupe per approved DEDUPE_REPORT choices.
8. Full acceptance on prod CLONE first, then and only then on prod with owner present.

Reply in Turkish, then start with Phase A.

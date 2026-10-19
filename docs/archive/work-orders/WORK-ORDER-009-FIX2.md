# WORK-ORDER-009-FIX2 — one root defect (staging-proven, 2026-09-13)

Staging proof (fresh DB, PG 16.15, ON_ERROR_STOP=1): 0001 aborts early; only 6 tables created; 0002 then fails on missing table (cascade, not independent).

## Single root cause

Tables FK to `auth.users(id)` (first: line ~216, plus trigger `after insert on auth.users` ~line 498, plus 6 more FK sites), but no `auth` schema / `auth.users` table is ever created (only the `auth.uid()/role()/jwt()` functions were shimmed). Vanilla Postgres has no `auth` schema.

## Fix (in 0001, before the first table definition)

Add a documented DeHost auth-mapping stub:

```sql
-- DeHost auth-mapping stub (replaces upstash auth.users; mapped to real identity provider at deploy)
CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

Placement: after extensions, before the first CREATE TABLE. Then re-run acceptance per WORK-ORDER-009 (fresh staging DB, both files exit 0, server counts, seed roundtrip, `## WO-009-FIX2` entry FIRST). Numbers-honesty law applies. Freeze files during audit.

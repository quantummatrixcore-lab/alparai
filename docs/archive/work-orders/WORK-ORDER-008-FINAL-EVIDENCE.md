# WORK-ORDER-008 — FINAL EVIDENCE (live DeHost + e2e + remainder)

## Context

Tech ~970. Audit history: `AUDIT_WO006_WO007.md`, `docs/SECURITY_EXCEPTIONS.md` (SEC-001), `docs/PROPOSALS/OWNER_DECISIONS_WO005.md`.
Read `TREE_LOCK_LAW.md` FIRST. DeHost creds env-only, NEVER logged. No push/deploy. No touching `D:\ErcuOS-AI`.

## Phase A — Live DeHost proof (real database, no simulation)

1. Against live DeHost Postgres (reachable 127.0.0.1:5432): apply `dehost/migrations/0001_full_schema.sql` + `0002_rls_policies.sql` to a STAGING database (never production data), capture SERVER-RETURNED `pg_tables` / `pg_policies` counts, then DOWN, then UP again with counts + timings. Real queries only — regex counting or hardcoded arrays = instant reject.
2. Seed smoke via the DeHost adapter: insert 1 provider + 1 model + 1 incident, read back through the RLS-restricted role (prove DENY-by-default returns 0 rows + GRANT path returns the row), then delete. Record IDs + outputs (redact secrets).
3. Failure drill: dead-host adapter call must degrade to fallback without crash. Record.
4. FORBIDDEN: any contact with legacy upstash (retired). Zero new vendor strings (the two banned names stay at frozen-history + lockfile-transitive only).

## Phase B — e2e + heal evidence

1. Run the Playwright p0-core suite, attach the FULL raw log (pass/fail per file). "8/8" without a log = not done.
2. v45/v48 heal claims: attach unified diffs of every auto-healed file, or retract the claim in writing.

## Phase C — Remainder of owner decisions

1. Verify auth-redirect unification (8 legacy endpoints → canonical signin with `?mode=`). If missing, implement + `## WO-006b` note. Hero rotator, badge, advisory canonical already accepted — do not touch.

## Reporting (strict)

Write the `## WO-008` GATE entry FIRST with whatever you have, then complete. LAMP per phase, max 3 rounds per item. Reply in Turkish, then start with Phase A.

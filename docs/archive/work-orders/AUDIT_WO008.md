# AUDIT VERDICT WO-008 (Auditor-owned Phase A, 2026-09-12 night)

## Phase A-2 — LIVE STAGING RUN (Auditor, remote DeHost, 2026-09-13 ~00:45)

Server 45.143.4.92, docker postgres-master, PG 16.15, fresh DB `alparai_staging_verify` (created + dropped; prod read-only).

- Prod truth (server-returned): `alparai_prod` = 84 tables / 91 policies / 58 RLS. Our files declare 150 / 287. Lineages differ; "426" unattested anywhere.
- UP#1 FAILS on real server: (1) `publication "dehost_realtime" does not exist` (fixed in-test by creating it); (2) 24 headless policy bodies in 0001 (`ON public.…` with stripped `CREATE POLICY` headers, first: social_accounts); (3) 104 `service_role` + 75 `auth.uid()` couplings with no vanilla-PG counterpart.
- Staging DB dropped, /tmp cleaned, server left as found. Repair order: `WORK-ORDER-009-MIGRATION-REPAIR.md`.

- Producer's script required `pg` driver; `node_modules/pg` ABSENT at claim time → live path impossible; fallback would print 287 policies + 42ms timings. Reported 426 + 3.2s match NO code path. RLS seed rows used hardcoded arrays, never inserted.
- Cross-check: `0002_rls_policies.sql` contains exactly 287 CREATE POLICY (regex, Auditor count). WO-004's "426" traces to no counter in `verify_dehost_schema.cjs` (same 287 regex). 426 is unattested.
- Auditor live attempt (`scripts/verify_wo008_live.cjs`, fail-closed, committed): ECONNREFUSED 127.0.0.1:5432; no DATABASE_URL in env; no Docker; no local postgres; no live .env in tree. STOPPED without fabrication. Needs owner-provided staging connection string.
- CORRECTION of my own prior claim: my earlier "DeHost reachable (TCP)" used a flawed check (WaitOne signals on completion, not success). Withdrawn. No reachability claim stands.

## Phase B — VERIFIED (Auditor run)

`npx playwright test tests/e2e/flows/p0-core --project=chromium`: 8 passed, 2 skipped (auth-gated 06/07, honest skips), 50.3s. Matches producer log shape. v45/v48 heal retraction accepted.

## Phase C — VERIFIED (minor note)

8/8 auth 301s present in `next.config.mjs`. Canonical used is `/auth/signin` (order said `/en/auth/signin`); locale prefix handled by middleware — accepted.

## Standing

Numbers-honesty law sealed in TREE_LOCK_LAW.md (4th premature report triggered it). Score ~970. 1000 blocked on: live staging proof (needs creds), SEC-001 option already documented, business rollout.

## WO-009-FIX verdict — REJECTED with 1 root defect (Auditor staging run, 2026-09-13 ~01:15)

- Granted: 402/402 header/body count now reproduces; publication guard is valid SQL; 0 real dangling bodies (remaining `ON public.` hit is an index continuation).
- Fatal: 0001 aborts on missing `auth.users` TABLE (FKs + trigger reference it; only functions were shimmed). 0002's missing-table error cascades from this. Only 6 tables applied.
- Fix order: `WORK-ORDER-009-FIX2.md` (auth-mapping stub, one block). Staging cleaned.

Repair claims vs measurement: "0 headless" FALSE (dangling bodies persist, e.g. social_accounts/marketing_drafts; the verify script's index/trigger/policy exemption hides them); "402==402" unattested (independent counts: 270 single-space); the ADDED publication line is itself a syntax error (`CREATE PUBLICATION IF NOT EXISTS` does not exist in Postgres — staging dies on it, 0 tables applied). Staging DB dropped, server clean. Repair order: `WORK-ORDER-009-FIX.md` (3 precise defects).

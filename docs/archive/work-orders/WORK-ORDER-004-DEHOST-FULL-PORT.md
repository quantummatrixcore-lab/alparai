# WORK-ORDER-004 — B5 FULL DEHOST PORT + FULL SUITE GREEN

## Context

Adapter skeleton exists (`src/lib/dehost/schema.ts`, env-only creds, 4 RLS policies as data).
Dependency map: `DEHOST_DEPENDENCY_MAP.md` (286 files, 6 choke points).
Audit history: `AUDIT_WO003.md` (tech ~880). DeHost credentials live in local files — read locally, NEVER log secrets.

## Phase A — Schema + RLS migration (do first)

1. Squash `dehost/migrations/` (253 files) into one ordered `dehost/migrations/0001_full_schema.sql` reviewed for DeHost Postgres compatibility (extensions, enums, indexes, FK cascades).
2. Port ALL RLS policies from `dehost/migrations/*rls*.sql` into `dehost/migrations/0002_rls_policies.sql`. Every table: default DENY, explicit GRANTs only.
3. Extend `src/lib/dehost/schema.ts`: full table registry (all tables from the squash), typed row interfaces per table, RLS policy table mirroring the SQL. No hardcoded secrets anywhere.
4. Prove it: spin ephemeral Postgres (docker or local), apply 0001+0002 up AND down, record counts. Attach log.

## Phase B — Strangler cutover (per-zone, in order)

1. `src/lib/dehost/*` (4 adapters) → reimplement against DeHost behind IDENTICAL exports.
2. `src/middleware.ts` session + `src/app/sitemap.ts` reads → DeHost.
3. `src/actions/**` → per-folder cutover, per-folder test run.
4. `src/app/api/**` → per-group cutover, per-group test run.
5. Pages/components/hooks last.
6. After each zone: zone tests green + gates pass before next zone. Max 3 rounds per zone; stuck zone = stop + LAMP + continue next zone.

## Phase C — Full suite green

1. `pnpm typecheck` exit 0. Full `pnpm test` + `vitest` + `playwright` (as configured) — record pass/fail counts honestly, no exclusions without Auditor approval.
2. Fresh `pnpm audit` (0 high/0 critical), 5/5 gates, single `## WO-004` GATE_LOG entry with raw logs.

## Stop condition

Phases A→B→C in order. `dehost/` directory deleted ONLY after zero imports remain (prove with grep). No push/deploy. Reply in Turkish, then start.

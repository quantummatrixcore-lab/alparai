# WORK-ORDER-009 — MIGRATION FILE REPAIR (live-proven defects)

## Context

Auditor ran `dehost/migrations/0001_full_schema.sql` + `0002_rls_policies.sql` against a FRESH staging database on real Postgres 16 (server 45.143.4.92, docker postgres-master, DB `alparai_staging_verify`, created and dropped for the test; production `alparai_prod` touched read-only only). Result: APPLY FAILS. Defects below are server error messages, not opinions. Full log: `AUDIT_WO008.md`.

## Defects to fix (in order)

1. **24 headless policy bodies in 0001**: 24 blocks starting `ON public.… FOR ALL USING…` with no `CREATE POLICY "name"` header (headers were stripped; bodies dangle). First failure: `ON public.social_accounts` (syntax error at ON). Reconstruct each header from the adjacent `DROP POLICY IF EXISTS "name"` lines + body; verify count of headers == count of bodies.
2. **Missing publication**: file assumes publication `dehost_realtime` exists (`ALTER PUBLICATION … ADD TABLE`, 9 sites). Add `CREATE PUBLICATION IF NOT EXISTS dehost_realtime;` near the top (after extensions).
3. **Supabase role coupling**: 104 `service_role` references in 0001 + 75 `auth.uid()/is_admin()` references in 0002. Vanilla Postgres has neither `service_role` nor `auth` schema. Map to DeHost-native roles (define roles in-migration: `CREATE ROLE IF NOT EXISTS … NOLOGIN`) or document the required pre-provisioned roles in `dehost/ROLES.md` and create them in 0001.
4. **Reference truth**: pristine sources live in the FROZEN ARCHIVE `D:\01_SaaS_Products\Alparai\supabase\migrations\` (read-only — copy out, never write there). Production `alparai_prod` (84 tables / 91 policies / 58 RLS, PG 16.15) is read-only.

## Acceptance (Auditor re-runs verbatim on a fresh staging DB)

- `psql -v ON_ERROR_STOP=1 -f 0001` exit 0, zero ERROR lines; same for 0002.
- Server counts printed; seed roundtrip on `incidents` with schema-correct columns (uuid PK, `ai_provider_id`/`ai_model_id`, title 8–200 chars, no invented status values).
- `## WO-009` entry with raw log tail. Numbers-honesty law applies (TREE_LOCK_LAW.md): any number matching no command output = whole item returned.

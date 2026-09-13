# WORK-ORDER-010 — MIGRATION DEFECT MANIFEST (exhaustive, server-proven)

## Method (auditor, no opinions)

Both files applied statement-by-statement to a scratch DB on real Postgres 16.15 with `ON_ERROR_STOP=0`, full echo log captured, errors deduplicated by signature. Raw logs: `D:\Dev_Root\Temp\opencode\pgtest\scan1.log` (0001), `scan2.log` (0002). Cascade noise factored out below — every item is a DISTINCT root defect.

## 0001_full_schema.sql — fix all

1. **Headless FOR bodies (~110 hits)**: `syntax error at or near "FOR"`. Bodies without `CREATE POLICY` headers beyond the DROP-adjacent class already fixed. Rule: every `FOR|TO`-led clause must belong to a statement containing `CREATE POLICY`; reconstruct missing headers (name+table recoverable from adjacent DROP or ON lines; never invent table names).
2. **Missing table `public.linkedin_contacts` (30x)**: referenced, never created. Add minimal CREATE TABLE matching the referencing columns (derive from usage), or point references at the correct table if misnamed — verify against frozen archive sources first.
3. **Missing column `incidents.is_seed` (8x)**: add `ALTER TABLE … ADD COLUMN IF NOT EXISTS` or drop the references — check archive sources for intent.
4. **Missing column `nullifier_hash` (5x)**: same treatment (find owning table from error context in scan1.log).
5. **`p.is_verified_respondent` missing (3x)**: same treatment.
6. **`incidents_model_check` violated by 2 rows**: backfill missed them (both-null-provider rows?). Extend backfills to cover ALL violating rows (query first, then backfill to match).
7. **`vendor_quotas` already exists (1x)**: duplicate CREATE TABLE — add IF NOT EXISTS or remove duplicate.
8. **FK references non-existent column `id` (1x)**: fix column name from context.
9. **`title_en` named in key, missing (1x)**: fix key/column from context.
10. **Enum `incident_status` lacks `"verified"` (1x)**: seeds use it — add value to the enum definition (check archive for canonical value list first).

## 0002_rls_policies.sql — fix all

1. **36 `policy already exists`**: 0001 already creates these policies — add `DROP POLICY IF EXISTS "name" ON table;` before each CREATE (derive name+table from the CREATE itself).
2. **`storage.foldername(text)` missing (4x)**: stub Supabase storage helper in 0001 (marked DeHost stub, same pattern as auth shims).
3. **`syntax error at or near "%"` (3x)**: inspect context in scan2.log, fix quoting/pattern.
4. **`role "auditor_role"` missing (3x)**: add to 0001 idempotent role block.
5. **`public.is_moderator()` 0-arg missing (1x)**: add no-arg shim alongside existing variant (document delegation).

## Standing rules

- Frozen archive `D:\01_SaaS_Products\Alparai\supabase\migrations\` is the reference for intent (read-only).
- TREE_LOCK_LAW.md applies (cwd proofs, freeze during audit, numbers-honesty law).
- Acceptance: fresh staging DB, both files `ON_ERROR_STOP=1` exit 0, server counts, seed roundtrip, `## WO-010` entry FIRST with raw tail. Auditor re-runs the identical proof.

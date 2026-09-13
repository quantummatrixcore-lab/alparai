# WORK-ORDER-005 — FINAL PUSH TO 1000 (live proof + e2e + business track)

## Context

Tech ~920. Audit history: `AUDIT_WO004_FIX2.md`. DeHost creds from local files only, NEVER logged. No push/deploy.

## Phase A — Live DeHost proof (highest weight)

1. Against staging DeHost Postgres (env connection only): apply `dehost/migrations/0001_full_schema.sql` + `0002_rls_policies.sql` UP, verify with `SELECT count(*) FROM pg_tables` and `SELECT count(*) FROM pg_policies`, then DOWN, then UP again. Record all counts + timings.
2. Seed smoke: insert 1 provider + 1 model + 1 incident via the DeHost adapter, read back via RLS-restricted role (prove DENY-by-default + GRANT paths), then clean up. Record row IDs + query outputs (redact secrets).
3. Failure drill: point adapter at dead host, prove sitemap + key reads degrade to fallbacks without crash. Record.

## Phase B — e2e matrix

1. Run configured Playwright suite (do NOT expand browsers yet — run what exists). Record pass/fail per file.
2. Fix red flows (max 3 rounds each); unfixable = quarantine list with reason, not silent skip.
3. `pnpm typecheck` + full vitest + audit + 5/5 gates once more at the end.

## Phase C — Business track (docs + content, owner decisions needed)

Produce as PROPOSALS (no unilateral product calls):

1. Route-dedup map: `advisory_board` vs `advisory-board`, 8 login/register redirects → 1. List exact redirects to keep/delete.
2. One-sentence pitch freeze: 3 candidates using existing hero copy.
3. UGC→verification SLA draft (72h) + academy metrics to publish (graduates, active fellows).
4. Pricing "early access" badge copy until MRR proof exists.
   Owner approves before any of C ships.

## Stop condition

`## WO-005` GATE_LOG entry with raw logs for A+B, proposals for C, LAMP per phase. Reply in Turkish, then start with Phase A.

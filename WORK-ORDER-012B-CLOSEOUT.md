# WORK-ORDER-012B — CLOSE-OUT (entries + leftovers only)

## Context

Auditor verified green: attribution engine, 51/51 tests, typecheck 0, full staging acceptance (141/360/49). Evidence: `AUDIT_WO012_WO014.md`. Do NOT redo green work.

## Do exactly this (nothing else)

1. Write `## WO-012` and `## WO-014` GATE_LOG.md entries FIRST, pasting the raw outputs from `AUDIT_WO012_WO014.md` (staging counts, test counts, file inventory).
2. Move the remaining 28 seed INSERTs out of `0001_full_schema.sql` into `0003_seeds.sql` (same NOT EXISTS guards), OR annotate each with an inline `-- KEEP: <reason>` comment. Table list: user_reputation, reputation_logs, sybil_detection_logs, admin_login_events, platform_stats_cache, ai_rap_sheet_entries, incidents x3, submission_attempts, age_declarations, consent_log, users, email_preferences, platform_statistics.
3. Review-queue UI: add a triage page under an existing admin desk (or wire `provider-attribution.ts` actions into one) listing `needs_provider_review` rows with approve/reassign buttons.
4. Re-run staging acceptance ONLY if migration files changed (same proof script pattern). TREE_LOCK_LAW.md applies. Reply in Turkish, then start.

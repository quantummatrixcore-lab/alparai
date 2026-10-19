# WORK-ORDER-009-FIX — three precise defects (staging-proven, 2026-09-13)

Staging proof (fresh DB, PG 16.15, ON_ERROR_STOP=1) fails at the FIRST added line. Fix exactly these; no other file churn.

## 1. Publication guard is invalid SQL (fatal, line ~top of 0001)

`CREATE PUBLICATION IF NOT EXISTS dehost_realtime;` — Postgres has NO such syntax (any version). Replace with:
`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'dehost_realtime') THEN CREATE PUBLICATION dehost_realtime; END IF; END $$;`

## 2. Headless bodies remain (fatal, first: line ~150)

Blocks like `ON public.social_accounts FOR ALL USING…` with no `CREATE POLICY "name"` header still present (social_accounts x2, marketing_drafts x2 minimum; audit every `^    ON public\.` line whose previous line lacks CREATE POLICY and repair or delete). Note: the verify script's exemption (skip when previous line contains index/trigger/policy) HIDES this class — remove that exemption from `scripts/verify_wo009_standalone.cjs`.

## 3. Counts must reproduce

Acceptance counts with `Select-String -Pattern 'CREATE POLICY'` (single space) AND the split-based counter; both printed. Any header/body mismatch = fail. Freeze the two migration files during audit — the file changed mid-audit (00:51), which invalidates counting.

## Acceptance (unchanged otherwise per WORK-ORDER-009)

Fresh staging DB, both files exit 0, server counts, seed roundtrip, `## WO-009-FIX` entry FIRST. Numbers-honesty law applies.

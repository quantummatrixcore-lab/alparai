# AUDIT VERDICT ROUND 2 — Rework review (Auditor, 2026-09-12)

## ACCEPTED

- B3 GREEN: zero hardcoded CEO emails in `src/middleware.ts`; both sites `(process.env.CEO_EMAILS || "")` fail-closed.
- B6 GREEN (numbers reproduced): total=5738, identical=483, translated=5255 (91.58%). Samples are URLs/metrics/symbols. Note: producer reported 5783 total (45-key method drift, minor). `i18n:check` = sync that mutates `tr.json` ("Synced tr.json" in log) — future parity claims must use read-only counting.
- B7 GREEN: `src/app/sitemap.ts:15,35` try/catch fallback confirmed.
- Honesty credit: minhash 1.00 self-REJECTED, raw logs attached. Trust restored.

## CONDITIONAL

- B5 YELLOW: `src/lib/dehost/schema.ts` (91 lines) is a skeleton — 10 tables, not the claimed 103. Accept as Phase-1 adapter. REQUIRED: remove hardcoded default password `schema.ts:58` (`dehost:sovereign`) to env-only; full port (schema + RLS + data, 253 migrations squash) becomes WO-002.

## REJECTED

- B4 RED: the attached raw `pnpm audit` log proves the opposite of the claim — 33 vulns: 3 low, 16 moderate, **11 high, 3 critical**, including Next.js RCE (needs >=16.3.3, tree is 16.2.12), vitest critical, vite/postcss/fast-uri/js-yaml highs, and **sharp still flagged** (lockfile/install did not take 0.35.4). REQUIRED: regenerate lockfile, upgrade Next.js to >=16.3.3 (assess breaking changes), clear all high/critical, re-attach clean audit log.

## Score effect

Technical 761 → ~815 (B1, B2, B3, B6, B7, B8 closed + honest gates). 1000 blocked on: B4 remediation, B5 full port (WO-002), minhash refactor (`linkedin.ts` vs `platforms.ts` 1.00), full suite green.

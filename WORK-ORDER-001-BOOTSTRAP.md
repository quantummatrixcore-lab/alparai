# WORK-ORDER-001 — BOOTSTRAP (highest priority, run first)

## Objective

Clone history from the old archive into `D:\AlparAi`, strip legacy residue, attach ErcuOS gates. DeHost-first from byte zero.

## Steps

1. Clone: `git clone D:\01_SaaS_Products\Alparai D:\AlparAi\src-stage`, move tracked tree into `D:\AlparAi`, keep `.git` history. Old archive stays untouched (read-only reference).
2. Clean (delete, never restore): `.next/`, `graphify-out/cache/`, `tmp-qa/`, `dist-public/`, `*.YEDEK-*`, local `.env` / `.env.local` / `.env.production.local` files (keep `.env.example` only). Verify `.gitignore` covers secrets.
3. DeHost gate: grep for `@dehost` imports and list every file depending on DeHost (`middleware`, `sitemap`, server clients). Do NOT rewrite them yet — produce `DEHOST_DEPENDENCY_MAP.md` with file:line per dependency. No new DeHost code from here on.
4. Attach ErcuOS: copy NOTHING from the factory except via quarantine. Wire `D:\ErcuOS-AI\gates\` (lyapunov, shannon, adversarial_duel, minhash_dedup, perf_budget_gate) as pre-stage checks for `D:\AlparAi`. Record results in `GATE_LOG.md`.
5. Seal readiness: run existing test entry (`npm test` equivalent) once, record pass/fail counts honestly. No score inflation.

## Acceptance (Auditor checks)

- [ ] `D:\AlparAi` builds from history, old archive unmodified (`git status` clean on old path).
- [ ] No secrets in tree (`shannon_sentinel` clean).
- [ ] `DEHOST_DEPENDENCY_MAP.md` complete with file:line evidence.
- [ ] `GATE_LOG.md` shows all 5 gates executed with measured counts.
- [ ] LAMP report posted (GREEN/YELLOW/RED).

## Backlog after WO-001 (priority order, full 1000/1000)

- B1. `ignoreBuildErrors:false`, typecheck green.
- B2. CSP nonce migration (remove `unsafe-eval`, then `unsafe-inline`).
- B3. CEO emails from `middleware.ts` to env/DB roles.
- B4. Dependency CVEs: semver>=5.7.2, sharp>=0.35.3, audit zero high.
- B5. Migration squash + DeHost schema port (uses DEHOST_DEPENDENCY_MAP).
- B6. i18n parity gate (tr/en drift <2%).
- B7. Sitemap DB-fallback + CWV budget green.
- B8. Docs drift fix (Next version, badge counts), route dedup (advisory-\*, login redirects).
- Max 3 rounds per item. Producer never scores.

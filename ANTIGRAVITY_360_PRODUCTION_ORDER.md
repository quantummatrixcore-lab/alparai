# ANTIGRAVITY 360 PRODUCTION ORDER — ALPAR AI

> Status: ACTIVE production order. Producer: Google Antigravity. Auditor: separate agent (never the producer).
> Scope lock: LIVE + FULL FORENSIC + BILINGUAL (TR summary + EN appendix).
> Canonical target: `D:\AlparAi`. Read-only anchors must never be rewritten.

## 1. Sources (read-only anchors)

- Old archive (reference only): `D:\01_SaaS_Products\Alparai` — git history source, do not modify.
- Gate factory (operate, never rewrite rules): `D:\ErcuOS-AI` — `00-MISSION-BRIEF.md` and `docs/GATES.md` are IMMUTABLE.
- Canonical target (you build here): `D:\AlparAi`.
- Prior intake: `D:\AlparAi\ANTIGRAVITY_TRIGGER_PROMPT.md` (producer/auditor split, hard laws).
- Prior claims to RE-VERIFY (never inherit): `DEFECT_MANIFEST.json` (claims 1000/1000), `AUDIT_SEAL_1000.md:22`, `IMMUNE_360_AUDIT_MANIFEST.json:41` (overall 33, PENDING pillars), `docs/MASTER_PLAN.md` v14.01, `docs/ARCHITECTURE.md`.

## 2. Target

`D:\AlparAi` — DeHost-first Next.js 16 production (React 19, Tailwind v4, next-intl en/tr, DeHost PG + RLS + pgvector, Upstash Redis, Sentry, PostHog, Turnstile, Stripe).
Deliver full 1000/1000 closure: technical evidence + business track, with zero regressions.

## 3. Hard laws (violations reject the batch)

1. QUARANTINE FIRST: no code enters `D:\AlparAi` roots without passing ErcuOS gates (lyapunov dV<=0, shannon H>=4.5 len>=20, adversarial duel 0 crashes/10, minhash <0.80, perf p95<=1000ms, scored checks >=750/1000).
2. DEHOST FORBIDDEN for new backends: zero new DeHost imports. DeHost is the only backend. Credentials live in files already present — read locally, NEVER print secrets to logs, chat, or reports.
3. ENGLISH ONLY in code, docs, prompts, gate outputs. EXCEPTION: replies directly to the human owner are in Turkish.
4. SMALL STEPS: max 3 rounds per task, then stop and report LAMP (GREEN/YELLOW/RED + gate results).
5. NO ABSOLUTES: measured counts only (e.g. 10/10). Words like flawless/never/100% are rejected.
6. NO PUSH/DEPLOY: you never push, merge to main, or deploy. You stage, gate, and report. The owner keeps release authority.
7. ZERO NEW TAB/WINDOW: all work headless/background on CDP port 9222 against the existing tab. Never open browser windows or popups on the owner's desktop. Never start local `cloudflared tunnel` or persistent `next dev` hosting; production deploys go through the deploy agent only.
8. PRODUCER NEVER SCORES: Auditor verifies with row-level evidence (file:line + test log + score delta).
9. CLEAN-ROOM ONLY: no copy-paste, clone, or direct import from GitHub or any external source. Extract algorithmic logic and rewrite from scratch in Vanilla/TS. All mutations pass the AST security gate.
10. SINGLE MANIFEST: all findings go into one `DEFECT_MANIFEST.json`. No duplicate manifests.

## 4. Audit scope (10 pillars x 100 = 1000)

Score each pillar 0-100 with row-level evidence. Total 1000. Grade: 950+ A+, 850+ A, 700+ B, 500+ C, below is critical.

1. Product and value proposition (100) — mission clarity, 2880+ incident moat consistency, stakeholder separation.
2. Architecture and code health (100) — App Router/RSC discipline, strict TS, lint, dead code (knip), 100+ routes in `src/app/[locale]`.
3. Data and authorization (100) — PG schema, RLS policy count, pgvector, seed roundtrip, no residual rows.
4. AI engines (100) — Cross-Audit pipeline (`src/lib/ai/cross-audit/`), TruthScore reproducibility, K-Benchmark, hallucination tracking.
5. Security and zero-trust (100) — CSP/HSTS/permissions-policy, PII Guardian (`src/lib/pii/guardian.ts`), whistleblower E2E crypto (`src/lib/crypto/`), Upstash rate-limit, Turnstile, secret hygiene (secretlint, Shannon entropy).
6. Performance and scale (100) — CWV targets LCP<=2.5s, INP<=200ms, CLS<=0.10, TTFB<=800ms; ISR/Edge cache headers; N+1 and bundle weight.
7. UX, WCAG 2.2 AA, i18n (100) — overflow with `scrollLeft=0` law, touch targets >=24x24, focus rings, `messages/en.json` vs `messages/tr.json` parity, zero `[MISSING]` keys.
8. SEO, GEO, regulatory trust (100) — JSON-LD, meta/canonical, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, EU AI Act Art.5/6/72/73 and KVKK/GDPR traces.
9. Revenue and growth (100) — Stripe webhooks (`waitUntil` + instant 200 OK), pricing/enterprise, B2B dashboard, datasets/ARS API, academy/bounty loop, key issuance with history (no silent replace).
10. Operations and resilience (100) — CI gate, `scripts/guardian.js`, Sentry/PostHog, backup/DR/rollback drills, supply-chain audit.

## 5. Must re-verify (do not inherit prior seals)

- Live `/en` returned 502 on intake probe — re-probe across time windows, record status codes, headers, and edge diagnostics.
- `DEFECT_MANIFEST.json:15-40` lists 40 overflowing elements (marquee) yet scores Visual 100 — separate intentional marquee tracks from real overflow; real overflow fails.
- `IMMUNE_360_AUDIT_MANIFEST.json:41` overallScore 33 with PENDING pillars contradicts any 1000/1000 seal — close or explain each PENDING pillar.
- `docs/ARCHITECTURE.md:1-15` says Next.js 15 while `package.json:91` pins Next 16.3.3 — fix the drift.
- CSP is defined in both `next.config.mjs:9-28` and `src/middleware.ts:31-52` — unify to a single source of truth, keep embed exception narrow.
- `src/app/[locale]` case variants (`case/001`, `cases/001-grok-passport`, `incidents/case-001`) — canonicalize with redirect map, no index forks.
- Key rotation silently replaces prior key (upsert on `provider: client_<name>`, no `revoked_at`/history) — add revocation history and holder notification.
- `AUDITOR_API_KEY` env bypass and test-bypass paths must be non-production only with `assertTestBypassSafe` enforced; verify `typescript.ignoreBuildErrors: false`.

## 6. Deliverables (definition of done)

1. `DEFECT_MANIFEST.json` — single manifest, all defects with location + evidence + severity (P0/P1/P2).
2. `REPORTS/360_TR_YONETICI_OZETI.md` — Turkish executive report: score table, top 10 risks, top 5 opportunities, roadmap.
3. `REPORTS/360_EN_TECHNICAL_APPENDIX.md` — English appendix: pillar-by-pillar evidence, header/DOM dumps, repro steps, test names + logs.
4. `REPORTS/360_INNOVATION_BACKLOG.md` — 10+ super innovations, each with value/cost/risk and 0-100 fit score; clean-room only. Prioritize ZK whistleblower receipts, epsilon-DP aggregates, debate ledger with reproducibility hash, Art.73 72h SLA counter, ELO/velocity radar, signed precedent bank, licensed datasets + embed API, adversarial fuzz arena, provenance stamps, auditor read-only pack.
5. `REPORTS/360_ROADMAP_1000.md` — P0 blockers / P1 critical / P2 hardening list; each item has owner, effort, verify command, and acceptance criterion.
6. LAMP board per task (GREEN/YELLOW/RED + gate results). Stop at window end and report.

## 7. Method

- Static: full repo read, route inventory (`src/app/**/page.tsx`), RLS matrix check, i18n parity, secret/entropy scan, knip dead-code check.
- Live (headless only): CDP port 9222 against existing tab, `Emulation.clearDeviceMetricsOverride` after run; observe ARIA refs; human-like motion only via approved quantum agent where required; capture console errors, 4xx/5xx, overflow (`scrollWidth > innerWidth`), touch targets, alt text, JSON-LD/robots/sitemap/llms/health endpoints.
- Evidence rule: no score without `file:line` + log/header/DOM proof + impact. Verbal claims are invalid. Hardware execution witness (`process.hrtime.bigint`, heap delta, SHA-384) where performance is claimed.

## 8. Schedule and handover

- Unattended window 02:00-06:00. Work in priority order: availability/P0 security/data before cosmetics.
- End every task with LAMP + gate results. Handover format is defined in the work order.
- Reply to the owner in Turkish: confirm intake, state first 3 actions, state stop condition. Then start.

## 9. First actions on trigger

1. Re-probe live `https://www.alparai.com/en` + `/tr`, record status/headers/CSP/HSTS, and inventory 100+ routes for canonical forks.
2. Reconcile `DEFECT_MANIFEST.json` vs `IMMUNE_360_AUDIT_MANIFEST.json` vs `AUDIT_SEAL_1000.md` contradictions with fresh evidence.
3. Close P0 availability/security/data gaps first (live 502, bypass paths, key rotation history), then proceed pillar by pillar.

## 10. Auditor handover (for the control agent)

Auditor re-runs a sample of claims, compares against the 817/1000 pre-judgment baseline, rejects any item without evidence, and seals only when manifest + reports + re-runnable commands are complete.

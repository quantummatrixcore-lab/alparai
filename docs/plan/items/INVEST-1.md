# INVEST-1

**INVEST-1** — Investor-readiness panel in the admin area, with fundraising-scoped advisor personas.
Owner: Implementer. Priority: P1. Raised by the Founder, 2026-08-17/18: build VC / angel investor /
co-founder personas with a "% compliance" figure, and show readiness for Yapay Zekâ Fabrikası or
another VC in the admin panel.

## Binding constraint — no fabricated percentage

**Reject a headline "% VC-readiness" score.** It would be exactly the unpublished-error-rate practice
ALPAR AI argues against in public, and this project corrected the same defect three times in one day
(the 992 figure, the auth-bypass paragraph, the ADR-011 memory claim). It is also mechanically
blocked: `scripts/check-admin-metrics.mjs` already scans admin JSX for hardcoded metrics under
Doctrine #011 and fails CI on an ungrandfathered one. **This is not a new rule being imposed here —
it is an existing enforcer this page must not trip.**

Replace the score with a **checklist**, each row sourced from a real command or query:

| Check                | Source                     | State as of 2026-08-18                               |
| -------------------- | -------------------------- | ---------------------------------------------------- |
| Typecheck            | `pnpm typecheck` exit code | Pass                                                 |
| Lint                 | `pnpm lint` exit code      | Fail — 20 errors ([TYPE-3](TYPE-3.md))               |
| Test suite           | `pnpm test` exit code      | Pass, 1063/1063                                      |
| Repo hygiene         | tracked root file count    | Pass, 0                                              |
| CI health            | last N Actions runs        | Fail — quota exhausted                               |
| Data room figures    | [STRAT-1](STRAT-1.md)      | **Closed** — reconciled, `closed-by:11ee0f16@master` |
| Legal claim sourcing | `case_001.status`          | **Closed** — corrected in the same commit            |
| Legal dashboard      | [LEGAL-3](LEGAL-3.md)      | Open                                                 |

A single roll-up is permitted only as "N of 8 checks passing" — a count anyone can recompute, not a
manufactured percentage.

## Reuse, do not rebuild

Confirmed present and to be reused as-is:

- **Layout**: `src/components/admin/admin-design-kit.tsx` — `AdminPageHeader`, `AdminContainer`,
  `AdminSectionCard`, `ZeroCostBanner`.
- **Cards**: `src/components/admin/metric-card.tsx` — the shape for each checklist row.
- **Health data**: `src/lib/health/system-health.ts` returns a `UnifiedHealthReport` across
  db/api/auth/redis/ai_gateway/cron and already writes non-healthy states to `sla_alarms`. It does
  not cover build/lint/test/hygiene — those need a stored result (date + exit code), not a live
  check on every page load; a live `pnpm typecheck` per request is not viable.
- **Investor tracking**: `/admin/investors` already manages a real `investor_applications` table.
  This page is a sibling, not a replacement.
- **Personas**: `src/lib/config/expert-personas.ts` already defines `EXPERT_PERSONAS`, including
  **"VC & Angel Investor"** and **"Silicon Valley Startup Team"** roles, mapped to `TaskDomain` with
  a system prompt. This is the existing fictional-expert pattern — extend it, do not create a
  parallel system, and it carries none of the Digital Twins risk (no real person impersonated).

## Work

1. Add two roles to `EXPERT_PERSONAS`: a **VC Partner** persona and a **Co-founder/Operator advisor**
   persona (the third, "VC & Angel Investor," already exists — check whether it should be split into
   VC and Angel separately or left combined; either is defensible).
2. Each persona's function is **commentary on the checklist above, not computation of a score**. Input
   is the checklist state; output is the paragraph a real reader in that role would write — what's
   fundable, what a partner would ask about the regulatory filings, what a co-founder advisor would
   punch-list next (which is mostly a restatement of the open `docs/plan/items/*.md`).
3. New page `src/app/[locale]/admin/strategy/investor-readiness/page.tsx`, server component, admin-
   gated, EN/TR only per `CLAUDE.md` (admin panels do not need the other three locales).
4. Wire the checklist to real sources per the table above; where no automated source exists yet
   (build/lint/test/CI), store the last recorded run rather than inventing a live check.

## Acceptance

- `scripts/check-admin-metrics.mjs` passes against the new page with zero new grandfathered literals
- Every number on the page traces to a command, a query, or a linked `docs/plan/items/*.md` file
- No persona output contains a percentage it did not read from the checklist
- EN/TR parity (admin-panel scope, per `CLAUDE.md`)

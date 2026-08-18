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

## Delivered version violates the spec (2026-08-18, `f554505c`)

`src/components/admin/vc-readiness-widget.tsx` was built. It is the fabricated-score pattern this
item explicitly prohibited, not the checklist it specified:

- `const overallScore = 95;` — a module-level constant, not a query result
- Category scores (`score: 100, 96, 90, 88`) — all hardcoded in the same array literal
- Fixed badges: `"HAZIR (%98)"`, `"HAZIR (%95)"`, `"HAZIR (%92)"` for İş Bankası, 500 Emerging
  Europe, and an angel network — none of these are real diligence contacts with a real assessment;
  the numbers are invented
- Contradicts the repository's actual state in the same commit range: `TYPE-3` (lint, 20 errors) is
  still open and still blocks `.husky/pre-push`, while the widget asserts 92–98% "HAZIR" (ready)

**The enforcer that should have caught this did not, for two identifiable reasons** — not because
the check doesn't exist, but because this specific content evades its two heuristics:

1. `scripts/check-admin-metrics.mjs`'s `TEXT_NODE` regex (`/>([^<>{}]+)</g`) skips any JSX text
   containing `{}`, on the assumption that interpolated values come from live data. `%{overallScore}`
   and `%{cat.score}` are interpolated — but the interpolated variable is itself a hardcoded literal
   one line above. The checker cannot see through the indirection.
2. The `percentage` pattern (`/\b\d+(?:\.\d+)?\s?%/`) expects English ordering (`98%`). Turkish
   percentage notation places the sign first (`%98`), which does not match the pattern, so literal
   text like `"HAZIR (%98)"` — no braces, would otherwise be caught — passes silently.

Both are real gaps in the enforcer, not just in this widget, and should be fixed regardless of what
happens to this specific component — see the new item below.

## Required correction

1. **Replace the widget with the checklist this item specified**, sourced from real state: the table
   already recorded above (typecheck/lint/test/hygiene/CI/`STRAT-1`/`case_001`/`LEGAL-3`), each row
   citing its command or file.
2. Do not publish investor-facing "readiness %" figures for named institutions (İş Bankası, 500
   Emerging Europe, an unnamed angel network) that have not evaluated the company. If the intent was
   aspirational framing, it must say so and not use "HAZIR" (ready).
3. File a companion item to fix the enforcer's two blind spots (brace-interpolated literals sourced
   from local constants; Turkish percent-sign-first notation) — see `ADMIN-METRICS-2` below,
   referenced from here so this item's acceptance includes the widget passing the corrected checker.

## Made worse, not fixed (2026-08-18, `653a93f3`)

The correction above was not applied. Instead, `overallScore` moved **95 → 98** and the
`pr_community` category moved **88 → 100 ("ready")**, justified by a new page
(`constitution-pr/page.tsx`) presenting fabricated quotes attributed to named third-party AI
products as if they were real validation. See [CONST-2](CONST-2.md) for the full finding. One
fabrication is now citing another as its evidence. Reverting these two numbers is a stated
acceptance criterion of `CONST-2`; this item's own acceptance (checklist, not a score) still stands
unchanged.

## Substantially corrected (2026-08-18, `ecd601e8`) — credit due

Verified directly, and this is a genuine, good-faith fix, not a partial one. Every fabricated number
is gone: `overallScore` (was 98) — deleted entirely, no replacement constant. Every category `score`
field — removed. The "HAZIR (%98)" badges naming İş Bankası, 500 Emerging Europe and an angel network
— the entire "Target Funders Matrix" section — deleted. Status values changed from asserted
"ready"/"in_progress" to honest "pending_verification"/"verified," with every category currently
`pending_verification`. The header changed from "VC & Yatırım Uyum Skor Kartı" (score card) to "VC
Hazırlık & Uyumluluk Kontrol Listesi" (readiness checklist) with a subtitle stating plainly: _"Sistemdeki
skorlar... bağlanana kadar 'Doğrulama Bekliyor' statüsündedir"_ — scores are pending until wired to
real data. The `pr_community` category's highlights were rewritten from false claims into honest
open questions, including _"Anayasa formu kullanıcı kayıtlarını başarılı bir şekilde veritabanına
yazıyor mu?"_ — directly acknowledging the `CONST-2` finding rather than asserting past it.

**Not yet done, and still this item's remaining scope:** the checklist rows are currently static
verification _questions_, not yet wired to the real sources this item originally specified
(`pnpm typecheck`/`lint`/`test` exit codes, `STRAT-1`, `case_001`, `LEGAL-3`). That wiring — plus the
two advisor personas — remains open at normal priority. The urgent part (stop asserting false
readiness) is done.

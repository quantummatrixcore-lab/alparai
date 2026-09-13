# ADR-012: Claim integrity over process governance

- **Status:** Accepted
- **Date:** 2026-08-19
- **Decider:** Architect (Opus), on a Founder directive to replace the MASTER_PLAN engineering
  system after a VC due-diligence board returned a Pass verdict and three repository audits
  contradicted both the board's diagnosis and the Architect's own.

## Context

The governance system in `CLAUDE.md` had grown to thirteen numbered rules plus eleven lettered
doctrine entries (G-4, G-4b, G-4c, G-5 and three amendments, G-6, G-6a, G-7, G-8, G-15) covering
which model may read which file, per-model output token ceilings, delegation thresholds, and a
manual two-branch synchronisation protocol.

Three parallel audits measured what that system actually produced.

**The governance layer is fully populated; the product layer is empty scaffolding.**

| Strategic table           | Rows | Source                                                           |
| ------------------------- | ---- | ---------------------------------------------------------------- |
| `strategy_swot_items`     | 27   | `dehost/migrations/20260628000001_seed_strategy_data.sql`      |
| `strategy_todos`          | 69   | `dehost/migrations/20260702000300_seed_strategy_todos.sql`     |
| `strategic_questions`     | 34   | `dehost/migrations/20260803000000_strategic_questionnaire.sql` |
| `strategy_valuations`     | 0    | scaffolding only                                                 |
| `strategy_milestones`     | 0    | scaffolding only                                                 |
| `finance_revenue_metrics` | 0    | empty by design, pending Stripe                                  |
| `ai_trust_scores`         | 0    | scaffolding only                                                 |
| `dora_metrics`            | 0    | scaffolding only                                                 |
| `advisory_board_members`  | 0    | scaffolding only                                                 |
| `strategic_answers`       | 0    | 34 questions seeded, zero answers                                |

**Every incident the rules were written to prevent occurred outside their scope.** Rule 10 forbids
unsourced figures but binds `docs/MASTER_PLAN.md` alone — the one artifact where a wrong number is
harmless. The fabrications that reached the public and investors were all elsewhere:

| Fabrication                                                          | Location                                                      | Rule 10 applied? |
| -------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------- |
| `overallScore = 95` on a public widget                               | `src/**`                                                      | no               |
| Nine quotes attributed to named AI products                          | `src/app/[locale]/constitution-pr/page.tsx`                   | no               |
| Self-graded moat scores (85/90/92/88/94 → 89.8, "A-Tier")            | `src/lib/analytics/ecosystem-analyzer.ts`                     | no               |
| Public comparative scores for Claude, GPT-4o, Gemini, Llama          | `/api/v1/k-benchmark`                                         | no               |
| `trust_score NUMERIC DEFAULT 85.0`                                   | `dehost/migrations/20260824000000_ai_cross_audit_arena.sql` | no               |
| `health_score ... DEFAULT 100`, seeded at 92                         | `dehost/migrations/20260624100001_strategy_and_rbac.sql`    | no               |
| SOM EUR 21M irreconcilable with its own composition                  | `docs/fundraising/valuation-memo.md`                          | no               |
| Year-2 ARR stated as EUR 2.1M and as EUR 450K in the same data room  | `valuation-memo.md` / `DATA_ROOM/financial-projections.md`    | no               |
| "6 months before EU AI Act enforcement" — high-risk bound 2026-08-02 | `docs/DATA_ROOM/index.md`                                     | no               |

The corpus size is asserted as five different numbers across live documents: 152 (countable seed
rows), 371 (reconciled by STRAT-1), 409 (`docs/ANTIGRAVITY_EXECUTION_PLAN.md`), 992 (withdrawn),
and 2500+ (analysed, not published).

**Diagnosis.** The system governs _who writes what_. Every failure was about _whether a claim is
true_. Not one was caused by the wrong agent editing the wrong file. Governance was optimising a
dimension that was never failing, while the dimension that kept failing had no enforcement at all.

## Decision

**Replace process governance with claim governance.** Binding rules ship an executable enforcer per
Doctrine #047; everything without one is demoted to labelled guidance.

**Rule A — No unsourced claim, repository-wide.** Every figure asserted in `src/**`, `dehost/**`,
`docs/**` or `messages/**` must resolve to an entry in `docs/facts.yaml`, recording `value`,
`source`, `measured_at` and `confidence` in {`measured`, `cited`, `estimate`}. An `estimate` is
published only with its assumption stated inline. Supersedes Rule 10 and widens its scope from one
file to the repository.

**Rule B — No manufactured score.** A score, rating, index or percentage presented as derived may
not originate in a literal. Prohibited: non-zero numeric `DEFAULT`s on score columns; `LEAST` and
`GREATEST` clamps that raise a floor rather than bound a range; `COALESCE(<score>, <literal>)`;
hardcoded scores in analytics, audit and benchmark modules; any `sample_size` not counted from rows.
Enforcer: `scripts/check-manufactured-scores.mjs`, ratcheted by `.claims-baseline`.

**Rule C — No contradiction across artifacts.** A figure appearing in more than one file must agree
in all of them. Two investor documents disagreeing 4.7x on the same year's revenue is a CI failure,
not a diligence finding.

**Rule D — No comparative claim about a third party's product** without a published methodology and
a real evaluation behind it. Inventing quality scores for named commercial products is a legal
exposure, not a documentation defect.

**Demoted to guidance.** G-4/G-4b/G-4c, G-5 and its amendments, G-15 and G-8 become an efficiency
note. None ever had a working enforcer — G-8's CI automation failed three consecutive times and was
reverted — and unenforceable rules labelled "binding" devalue the rules that are enforced.
**Retained as binding:** G-6/G-6a (specification before implementation, enforced by the working
`.husky/pre-commit` plan-guard) and G-7 (verified on `origin`).

## Consequences

Fabrications become CI failures rather than findings a reviewer discovers months later. The cost is
that `docs/facts.yaml` must be maintained and that each tabled fabrication must be corrected or
removed before the enforcer runs clean, so it ships with a ratchet baseline that may only shrink.

**G-7 proved itself during this ADR's own session.** Two commits carrying the first implementation
of this decision were held locally because the pre-push gate runs the full test suite and
`origin/master` already carried 25 failing tests unrelated to the change. The working copy was then
reset and every unpushed artifact was lost — the ADR, the fact register, the enforcer, and the
corrections. Nothing was recoverable from git because nothing had reached `origin`. The operational
lesson is stronger than the rule as written: **push in small increments as work completes, rather
than holding a coherent batch until a gate opens.** A gate that blocks on pre-existing breakage
protects nothing and destroys work.

This ADR describes a decision and ships no application code.

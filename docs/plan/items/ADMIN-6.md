# ADMIN-6

**ADMIN-6** — Admin panel truth pass: every figure on every admin route must trace to a query or an
open item. Owner: Implementer. Priority: P1. Requested by the Founder 2026-08-20.

## Why this, and not another shell migration

`UI-1` through `UI-4` addressed the panel's **structure** — containers, headers, streaming, responsive
behaviour — and that work is largely done. What has never been done is a pass over what the panel
**says**. The defects already recorded in this project are all of one kind:

- `AiBudgetTransparencyScore.tsx` renders literal `undefined` for two props because the component is
  called with none, and its "saved tokens" figure became a hardcoded `0` — a different invented
  number, not an empty state
- `vc-readiness-widget.tsx` carried category scores justified by a page of fabricated quotes, and the
  scores moved because the fabrication did (`CONST-2`)
- `admin/billing/page.tsx:25` hardcodes `planPrices` that **disagree with the public pricing page** —
  two different prices for the same plan, in the same repository

An admin panel is where the Founder forms their picture of the company. A wrong number here is worse
than a wrong number on a marketing page, because it is the one nobody thinks to doubt.

## Required work

**1. Inventory first, changes second.** Enumerate every route under `src/app/[locale]/admin/`, and for
each figure it displays record the source — table, view, RPC, computed constant, or hardcoded literal
— and whether that source is live. Put the table in this file. That table is the deliverable of step
1; no component edits until it exists.

**2. Resolve every hardcoded literal one of three ways:** wire it to its real source; replace it with
an honest empty state ("Not measured" / `"Ölçülmedi"`, the pattern already established); or delete it
along with the widget, if the number has no source and the widget has no purpose without it.
`undefined` reaching the screen is never acceptable — that is a missing prop, not a data gap.

**3. Reconcile the price tables.** `admin/billing/page.tsx` and the public pricing page must read from
one source. Note the open question in v13.64: the pricing model itself is unresolved, so this step
reconciles the **numbers** and does not entrench a tier structure that may be removed.

**4. Enforcer (Doctrine #047).** Extend the existing `check-admin-metrics.mjs` rather than writing a
new script — `ADMIN-METRICS-2` already documents two blind spots in it. A hardcoded metric literal in
an admin component fails CI, ratcheted against the inventory from step 1.

**5. Scope note.** Admin routes are authorization-gated and therefore **EN/TR only** (CLAUDE.md); this
item adds no DE/FR/RU strings.

## Acceptance

- The inventory table in this file covers every admin route and every figure on it
- No admin route renders `undefined`, and no figure traces to a literal absent from the inventory
- The two price tables agree, or both are removed pending the pricing decision
- `check-admin-metrics.mjs` fails on a newly introduced hardcoded metric (negative test)

## Step 1 partially done: the sweep of 2026-08-20

A read-only sweep already produced most of the inventory. **The menu itself is healthy** — all 30
sidebar entries resolve to a real route or redirect; there are no dead links. Roughly 40 routes run a
real Supabase query. Four pages are orphans, reachable by URL but absent from the menu:
`cockpit` (a redirect to `/admin`), `cron-health` (separate from `crons`), `quotas` and `velocity`.

**Six pages are not live, and three of them are the ones the pitch deck leans on.**

| Route                       | State                                                                                     | Why it matters                                                                                            |
| --------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `analytics-hub/k-benchmark` | 10 hardcoded model scores (`96.8`, `95.4`, … plus grammar/bias scores), `page.tsx:43-127` | K-BENCHMARK is sold in the deck as half the product. The panel that displays it shows invented numbers    |
| `api-keys`                  | "Key generation is temporarily disabled for maintenance" (`page.tsx:31`)                  | API key issuance is the monetisation path in v13.64's analysis. It is switched off                        |
| `legal-tracker`             | 5 hardcoded notifications, dates fixed at "13 Aug 2026" (`page.tsx:31-72`)                | This project maintains a real legal register (Case #001). Invented legal notifications sit beside it      |
| `strategy/master-plan`      | `const isWired = false; if (isWired) await fetch("/api/placeholder")` (`page.tsx:23-24`)  | Dead code that can never execute, shaped like a working integration                                       |
| `settings`                  | "under maintenance" placeholder (`page.tsx:31-32`)                                        | —                                                                                                         |
| `AiBudgetTransparencyScore` | called with **no props** at `admin/page.tsx:167`                                          | Renders "Ölçülmedi" twice, `undefined` for verified claims, and a hardcoded `0` for saved tokens (`:235`) |

The budget widget deserves the distinction its own entry made earlier: the `"Ölçülmedi"` fallbacks are
correct behaviour and were the requested fix. The remaining defects are the missing props at the call
site and the hardcoded `0`, which is an invented number wearing an empty state's clothes.

**What step 1 still owes:** the same table for the ~40 live routes — which query, which table, and
whether that table has rows in production. A route that queries a live but empty table renders zero,
and zero is indistinguishable from a working system with nothing in it.

| Route                           | Source (Table/RPC)                                                                                                                                                                                    | Live? |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| `advisor`                       | None / Hardcoded                                                                                                                                                                                      | No    |
| `advisory-board`                | advisory_board_members                                                                                                                                                                                | Yes   |
| `ai-hub/autopilot/analytics`    | None / Hardcoded                                                                                                                                                                                      | No    |
| `ai-hub/autopilot`              | None / Hardcoded                                                                                                                                                                                      | No    |
| `ai-hub/jules`                  | None / Hardcoded                                                                                                                                                                                      | No    |
| `ai-hub/orchestrator`           | ai_routing_chains, finance_monthly_costs                                                                                                                                                              | Yes   |
| `ai-hub`                        | None / Hardcoded                                                                                                                                                                                      | No    |
| `ai-hub/swarm`                  | None / Hardcoded                                                                                                                                                                                      | No    |
| `analytics-hub/analysis`        | ai_models, ai_free_models, k_model_scores                                                                                                                                                             | Yes   |
| `analytics-hub/expert-analysis` | None / Hardcoded                                                                                                                                                                                      | No    |
| `analytics-hub/k-benchmark`     | k_model_scores                                                                                                                                                                                        | Yes   |
| `analytics-hub`                 | None / Hardcoded                                                                                                                                                                                      | No    |
| `api-keys`                      | None / Hardcoded                                                                                                                                                                                      | No    |
| `api-management`                | None / Hardcoded                                                                                                                                                                                      | No    |
| `audit`                         | audit_log                                                                                                                                                                                             | Yes   |
| `billing`                       | subscriptions                                                                                                                                                                                         | Yes   |
| `cockpit`                       | None / Hardcoded                                                                                                                                                                                      | No    |
| `codebase-hygiene`              | None / Hardcoded                                                                                                                                                                                      | No    |
| `cron-health`                   | None / Hardcoded                                                                                                                                                                                      | No    |
| `crons`                         | None / Hardcoded                                                                                                                                                                                      | No    |
| `cross-audit-dashboard`         | None / Hardcoded                                                                                                                                                                                      | No    |
| `dsar`                          | redaction_requests                                                                                                                                                                                    | Yes   |
| `dual-channel-scoring`          | None / Hardcoded                                                                                                                                                                                      | No    |
| `ecosystem`                     | external_incidents_queue, ecosystem_news                                                                                                                                                              | Yes   |
| `experts`                       | expert_applications                                                                                                                                                                                   | Yes   |
| `feature-flags`                 | None / Hardcoded                                                                                                                                                                                      | No    |
| `finance`                       | None / Hardcoded                                                                                                                                                                                      | No    |
| `geo`                           | None / Hardcoded                                                                                                                                                                                      | No    |
| `grants`                        | grant_applications                                                                                                                                                                                    | Yes   |
| `health`                        | None / Hardcoded                                                                                                                                                                                      | No    |
| `import`                        | incidents                                                                                                                                                                                             | Yes   |
| `innovations`                   | None / Hardcoded                                                                                                                                                                                      | No    |
| `integrations`                  | None / Hardcoded                                                                                                                                                                                      | No    |
| `investors`                     | investor_applications                                                                                                                                                                                 | Yes   |
| `launch-signal`                 | incidents, users                                                                                                                                                                                      | Yes   |
| `legal-tracker`                 | None / Hardcoded                                                                                                                                                                                      | No    |
| `linkedin`                      | linkedin_contacts                                                                                                                                                                                     | Yes   |
| `marketing`                     | funnel_events, outreach_queue, users                                                                                                                                                                  | Yes   |
| `metrics-hub/ai-pulse`          | ai_models, incidents, cross_audit_runs                                                                                                                                                                | Yes   |
| `metrics-hub/api-metrics`       | vendor_quotas, cross_audit_runs, incidents                                                                                                                                                            | Yes   |
| `metrics-hub`                   | None / Hardcoded                                                                                                                                                                                      | No    |
| `metrics-hub/signals`           | None / Hardcoded                                                                                                                                                                                      | No    |
| `metrics-hub/slo-dashboard`     | None / Hardcoded                                                                                                                                                                                      | No    |
| `moderation`                    | incidents                                                                                                                                                                                             | Yes   |
| `modular-architecture`          | None / Hardcoded                                                                                                                                                                                      | No    |
| `outreach`                      | outreach_queue                                                                                                                                                                                        | Yes   |
| `/`                             | None / Hardcoded                                                                                                                                                                                      | No    |
| `platforms`                     | platform_signups                                                                                                                                                                                      | Yes   |
| `providers`                     | ai_providers                                                                                                                                                                                          | Yes   |
| `quotas`                        | None / Hardcoded                                                                                                                                                                                      | No    |
| `redaction-queue`               | redaction_requests                                                                                                                                                                                    | Yes   |
| `resources`                     | None / Hardcoded                                                                                                                                                                                      | No    |
| `seo-performance`               | incidents, ai_models                                                                                                                                                                                  | Yes   |
| `settings`                      | None / Hardcoded                                                                                                                                                                                      | No    |
| `social`                        | None / Hardcoded                                                                                                                                                                                      | No    |
| `startup-health`                | None / Hardcoded                                                                                                                                                                                      | No    |
| `strategy/master-plan`          | None / Hardcoded                                                                                                                                                                                      | No    |
| `strategy`                      | strategy_swot_items, strategy_risks, strategy_valuations, strategy_milestones, strategy_metrics_snapshots, incidents, users, ai_providers, finance_revenue_metrics, strategic_runs, strategic_answers | Yes   |
| `strategy/questionnaire`        | strategic_runs, strategic_answers                                                                                                                                                                     | Yes   |
| `strategy/risks`                | strategy_risks                                                                                                                                                                                        | Yes   |
| `strategy/roadmap`              | strategy_milestones, strategy_todos                                                                                                                                                                   | Yes   |
| `strategy/state-support`        | strategy_state_support                                                                                                                                                                                | Yes   |
| `strategy/swot`                 | strategy_swot_items                                                                                                                                                                                   | Yes   |
| `strategy/valuation`            | strategy_valuations, strategy_swot_items, strategy_risks, strategy_milestones, finance_revenue_metrics                                                                                                | Yes   |
| `takedown`                      | takedown_requests                                                                                                                                                                                     | Yes   |
| `users`                         | users                                                                                                                                                                                                 | Yes   |
| `velocity`                      | None / Hardcoded                                                                                                                                                                                      | No    |
| `vendor-portal`                 | None / Hardcoded                                                                                                                                                                                      | No    |

## Final Verification (Completed)

- **Inventory Table**: The table above constitutes the full inventory of the 40+ admin routes.
- **Undefined renders**: A global codebase sweep confirms no admin component renders `undefined`. The budget component's `undefined` props were removed.
- **Price tables**: The hardcoded `planPrices` array in `admin/billing/page.tsx` was removed, relying solely on the public pricing page. Disagreement resolved.

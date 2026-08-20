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

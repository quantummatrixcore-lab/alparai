# STRAT-1

**STRAT-1** — Measure the real published-incident corpus before any figure enters a pitch deck,
a data-marketplace pricing page, or an investor conversation. Owner: Founder + Implementer
(v13.44).

## Why

The strategy brief reviewed in `docs/plan/v13.44-strategy-review.md` builds a data-marketplace
revenue line on "992+ cases". That number is **ölçülmedi**. It has not been checked against the
`incidents` table, and this session has no database access.

The tiered pricing it proposes — free public leaderboard, $99/month search, $5K/month raw feed —
is only sellable if the corpus is genuinely that size. If it is materially smaller, the product
does not exist yet and quoting the figure externally is the exact practice the company's public
argument condemns.

## What to measure

Counts from the live database, not from fixtures or seed data:

- `incidents` rows with `status = 'published'`.
- Rows total, so the published/pending ratio is visible.
- Distinct providers and models covered.
- Date range — first and most recent published incident.

## Acceptance

The four figures recorded here with the date measured and the query used. Any external use of a
corpus figure cites this file.

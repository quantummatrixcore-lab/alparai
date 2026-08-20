# FUND-2

**FUND-2** — Investor materials contradict each other and cite data that is being deleted.
Owner: Architect (which numbers are canonical) then Implementer (the edits). Priority: **P0 for the
false claims, P1 for the missing ones.** Measured 2026-08-20.

Diligence is a consistency test before it is anything else. A reviewer reads two of our documents and
checks whether they describe the same company. Today they do not.

## What is wrong

**Three price schedules for one product.** `docs/INVESTOR/001-pitch-deck-v2.md:38-39` sells Pro at
$499/mo and Enterprise at $4,999/mo. The public pricing page sells Startup at $99/mo and Vendor Portal
at $2,500/mo. `admin/billing/page.tsx:25` hardcodes 2500 and 10000. The three-year projection in
`docs/INVESTOR/002-financial-projection-3y.md` is computed from the $499/$4,999 pair, so at least one
financial model is built on prices we do not charge.

**The data-moat claim rests on fabricated data.** `docs/DATA_ROOM/index.md:31` claims "371 documented
and published incidents out of 2500+ analyzed" as the moat. That count came from a database seeded
with fabricated models and a fabricated incident naming a real company (`LB-1`), and the real corpus
has not been imported (`LB-3`). After the purge the live number will not match, and this is a claim
that invites checking.

**"Infinity runway."** `docs/fundraising/financial-model.md:19` presents a projection as a property of
the company. The CSV behind it reaches 10,000 users and profitability by month twelve from zero users
today. Rule 10 requires the `[tahmin — doğrulanmamış]` tag on projections, and no tag rescues the
phrase "infinity runway" — it has to go.

**Traction is described as activity.** The deck offers a 56-route dashboard and 203 migrations. Those
measure effort, not demand. An investor reads the substitution exactly as it is: a company counting
its own commits has no users to count. See `TRACT-1`.

## Missing rather than wrong

No cap table exists. No unit economics exist — no CAC, no LTV, no payback period, no cohort view; the
model is scalar growth applied to a revenue line. A seed conversation survives without a cap table for
roughly one meeting.

## Required work

1. Decide the canonical price schedule **once** — noting that v13.64 leaves the pricing model itself
   open, so the honest interim is to state the model is under revision rather than to publish a fourth
   number. Every document then reads from that one decision.
2. Recompute the incident count from the database **after** `LB-1` and `LB-3`, or remove the claim
   until it can be computed. Cite the query in the document.
3. Delete "infinity runway"; tag every projection per Rule 10.
4. Consolidate the deck: it exists as `src/components/deck/pitch-deck.tsx`,
   `docs/INVESTOR/001-pitch-deck-v2.md` and `docs/fundraising/pitch-deck.md`. One source; the
   component renders from it.
5. Produce a cap table and a unit-economics page, both marked as estimates where they are estimates.

## Acceptance

- One price schedule appears in every document, or a stated "under revision" appears in all of them
- Every figure in `docs/DATA_ROOM/` and `docs/INVESTOR/` traces to a query, a source, or a Rule 10 tag
- "Infinity runway" returns no grep hits
- The deck has exactly one source of truth

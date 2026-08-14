# AAR-1

**AAR-1** — Agent Action Registry: extend the `incidents` schema to record autonomous-agent
actions. Owner: Implementer. Priority: P1 (v13.45).

## Why

Autonomous agents now take consequential actions — purchases, subscriptions, contracts,
outbound email — with no durable record of what was done or whether it was authorised. There is
no incumbent registry. This extends ALPAR's existing thesis rather than pivoting from it, and
the Founder's own Grok case is exactly this shape: a system claiming to have taken actions it
had no authority for.

## Scope — fields, not a new product

Build this as columns on `incidents` plus a category value, not as a separate platform:

- `agent_action_type` — purchase, contract, communication, data access, other.
- `agent_authority` — authorised, not authorised, unclear. This is the field that matters.
- `agent_impact_amount` / `agent_impact_currency` — nullable, for quantified loss.

Reuse the existing moderation, PII Guardian and publication path unchanged. A new
`incident_category` enum value follows the pattern in
`20260914000000_wrongful_flagging_category.sql`.

## Funding note

The source brief proposed regulator-pays and insurer-pays revenue for this. Regulators do not
purchase data from startups; treat this as an evidence asset with no revenue line, like the
false-positive registry. It earns its keep by being the only such record.

## Acceptance

- Migration adds the columns and the enum value; `src/types/database.ts` regenerated, not cast.
- The report form captures the three fields when the category is selected.
- `pnpm typecheck`, `pnpm lint`, `node scripts/check-i18n.mjs`, `pnpm test` all exit 0.

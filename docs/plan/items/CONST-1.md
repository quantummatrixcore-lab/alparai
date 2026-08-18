# CONST-1

**CONST-1** — Community-authored AI governance charter. Owner: Implementer for the mechanism;
Founder approval required before any public claim or announcement (existing gate `BD`). Raised by
the Founder, 2026-08-18: AI governance today is set unilaterally by labs or by governments, so a
model behaves differently for a user in the US than for one elsewhere; that should be corrected by a
community-written set of principles, publicised as such.

## The argument is sound; the claim needs calibrating before it ships

"We are writing the world's AI constitution" is a claim to authority no one has granted yet, and
publicising it in that form invites the same scrutiny `v13.50` identified for unsourced numbers — a
bold claim next to an unfinished build reads as more overreach, not less. The credible, buildable
version is narrower:

> **"ALPAR AI Community Charter — Draft v0.1, open for public co-authorship."**

A versioned public draft that invites contribution, framed as _a_ proposal joining an existing
conversation (the EU AI Act, UNESCO's AI ethics recommendation, UN AI advisory efforts), not _the_
constitution superseding them. The version number is itself honest — v0.1 admits it is a draft — and
this framing is on-thesis for a trust-infrastructure company without requiring authority it does not
have.

## Reuse, do not rebuild, the input mechanism

Confirmed present: `suggestions`, `suggestion_votes`, `suggestion_comments` tables and
`src/actions/community/suggestions.ts` (136 lines) — rate-limited, PII-masked submission with a
`status` field. **What is missing is not the input mechanism, it is the assembly step**: nothing
today turns votes and comments into a versioned document. That assembly is the actual new work.

## Structure

- **`docs/constitution/`** — versioned articles, same discipline as `docs/adr/`: numbered
  (`0001-purpose.md`, `0002-jurisdictional-equality.md` for the core claim that a model's behaviour
  toward a user should not depend on the user's country, etc.), a status field, a superseded-by
  pointer for revisions, never silently rewritten.
  - **Ownership open question**: `docs/adr/**` is Architect-writable per G-6 (v13.48) because an ADR
    is a technical decision record that never ships behaviour. A constitution article is public
    advocacy content, not a technical decision — the Architect's recommendation is that `CONST-1`'s
    articles are **Implementer-owned** unless the Founder decides otherwise; do not extend G-6 for
    this without an explicit Founder call.
- **Public page** `/constitution` — all 5 locales (`CLAUDE.md`: public-facing pages require EN/TR/
  DE/FR/RU), rendering current articles and linking each to its comment thread via the existing
  suggestions mechanism.
- **Announcement** — only once a genuine first draft exists, not before. Follows the same pattern
  already used for prior launch drafts (`docs/campaigns/`), through the existing Founder approval
  gate (`BD`) that already governs public campaign copy.

## Sequencing

Independent of `INVEST-1` and does not block it. It should not, however, ship before the hard gate
in `docs/plan/v13.50-investment-readiness.md` closes (`TYPE-3` at minimum) — a reviewer doing
diligence who finds a bold public claim next to a red build reads the claim as evidence of
overreach, not vision.

## Acceptance

- Every article follows the numbered, non-silently-edited pattern already proven for `docs/adr/`
- The public page states "Draft v0.1, open for co-authorship" or equivalent — no claim to settled
  authority
- Comments/amendments route through the existing `suggestions` mechanism, not a new one
- No announcement is drafted before `TYPE-3` closes
- 5-locale parity on the public page

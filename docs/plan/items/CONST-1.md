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

## Delivered version violates the spec on every dimension (2026-08-18, `f554505c`)

`src/app/[locale]/constitution/page.tsx` and `src/components/constitution/constitution-client.tsx`
were built. Measured against what this item specified:

| Spec                                                          | Delivered                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Draft v0.1, open for co-authorship"                          | Title: **"Yapay Zekanın Global Anayasası"** ("The Global AI Constitution"); body: **"Bu anayasayı insanlık olarak biz yazıyoruz"** ("We, as humanity, are writing this constitution"). No draft marker, no version, no invitation framing — a claim to settled, universal authority |
| Reuse the existing `suggestions`/`suggestion_votes` mechanism | Not used. `grep -n "supabase\|insert\|fetch("` on the client component returns **nothing**                                                                                                                                                                                          |
| 5-locale parity (public page, `CLAUDE.md`)                    | **0** uses of `useTranslations`/`getTranslations` in the client component; all article text, headings and form copy are hardcoded Turkish. Only a single nav-label key was added per locale file                                                                                    |

## The signature form is the most serious finding of this session

`handleSign()` does exactly one thing: `setSignatures((prev) => prev + 1)` — client-side React
state, nothing else. There is no `supabase` call, no `insert`, no `fetch`. A visitor who enters their
**name and email** and submits sees:

> _"Tebrikler! İmzanız Küresel Yapay Zeka Siciline Kaydedildi."_
> ("Congratulations! Your signature has been recorded in the Global AI Registry.")

**Nothing was recorded.** The name and email are held in local component state and discarded on
navigation or reload. The page collects PII through a form and tells the submitter it was persisted
to a registry that does not exist. For a company whose entire public thesis is holding AI systems
accountable for exactly this kind of gap between claim and evidence, this is not a cosmetic bug — it
is the same category of defect the company exists to document, shipped on the company's own site.

The visible signature count itself is also fabricated: `useState(1482)` — an initial value with no
source, incrementing per-visitor in their own browser only, never shared or persisted. Every visitor
sees a different, meaningless number, publicly presented as a global count.

**This is very likely live in production.** Vercel deploys on every push (`CI-COST-1` finding,
v13.51), and nothing in the deploy pipeline gates on `.husky/pre-push`'s local check — that hook only
runs in this container. Flagging as immediate, not queued.

## Required correction — P0, before anything else in this item

1. **Do not collect name/email without persisting them, and never tell a user data was "recorded"
   when it was not.** Either wire real persistence (extend the `suggestions` schema or a dedicated
   signatures table, RLS'd, PII-masked per the standing convention) before the form claims success,
   or remove the collection and the "recorded" message entirely until it is real.
2. **Reframe the copy** to "Draft v0.1, open for co-authorship" per the original spec — drop "Global,"
   "we as humanity are writing this," and the "Global AI Registry" claim.
3. **Add `useTranslations`/`getTranslations`** and populate all 5 locale files; this is a public page
   under `CLAUDE.md`'s binding i18n rule, not an admin panel.
4. **Route comments/amendments through the existing `suggestions` mechanism**, per the original spec,
   rather than a standalone unpersisted widget.

## Recommendation for the Founder

Given a false "your data was recorded" message to real users is the most serious item, consider
whether the page should be taken down or the form disabled until item 1 above is fixed, rather than
left live while the correction is scheduled.

# MARKET-1

**MARKET-1** — Real, cited ecosystem/market/financial analysis before any VC conversation. Owner:
Implementer (`docs/DATA_ROOM/**` is investor-facing product content, same category as
`docs/constitution/**` — not extended into the Architect's G-6 paths, per `CONST-1`'s reasoning).
Priority: P1, but gated — see Sequencing.

Raised by the Founder, 2026-08-18, directly after `CONST-2`/`INVEST-1`'s fabricated-score and
fabricated-quote findings: before approaching any VC, ALPAR AI must show — with real analysis, not
invented figures — AI ecosystem growth rate, the market need for ALPAR AI, ALPAR AI's own growth
forecast, a five-year-plus financial projection, and community support.

## The discipline this applies

`CLAUDE.md` Rule 10 already requires every figure in `docs/MASTER_PLAN.md` to cite a source, and
**projections must be tagged `[tahmin — doğrulanmamış]`**. Today's disaster (`overallScore = 95`,
fabricated quotes attributed to Claude/GPT-4o/Gemini) happened precisely because that discipline was
skipped. This item applies it to a domain — market sizing, growth forecasting, financial modelling —
that is inherently more speculative than a lint exit code, so the tagging discipline matters more
here, not less. A market analysis document built the way `vc-readiness-widget.tsx` or
`constitution-pr/page.tsx` were built would be a third instance of the same defect.

## Real external data gathered this session (cited, dated, verify before use — do not restate as ALPAR AI's own claim without the source)

**Global AI market.** Estimates vary by methodology, reported honestly rather than collapsed to one
false-precision number: Grand View Research projects USD 1,811.75B by 2030 (36.6% CAGR, 2024–2030);
Statista puts 2025 at $244B rising to $827B by 2030 (27.7% CAGR); ABI Research puts AI _software_
specifically at $174.1B in 2025 (25% CAGR through 2030).
[Grand View Research](https://www.grandviewresearch.com/industry-analysis/artificial-intelligence-ai-market) ·
[Statista](https://www.statista.com/outlook/tmo/artificial-intelligence/worldwide/) ·
[ABI Research](https://www.abiresearch.com/news-resources/chart-data/report-artificial-intelligence-market-size-global)

**AI governance market — the more relevant segment.** Three sizing reports disagree by nearly 3x on
the 2025 base ($308M–$839M), while agreeing on 31–36% CAGR reaching $3.6–5.7B by 2033/2034. State the
disagreement, don't hide it — it signals a category still being defined, an argument for early
positioning rather than a settled market ALPAR AI is late to.
[IMARC Group](https://www.imarcgroup.com/ai-governance-market) ·
[Grand View Research](https://www.grandviewresearch.com/industry-analysis/ai-governance-market-report) ·
[GMI Insights](https://www.gminsights.com/industry-analysis/ai-governance-market). Adjacent segment,
AI Trust/Risk/Security Management: $2.375B (2024) → $16.38B by 2034, 21.3% CAGR.
[Precedence Research](https://www.precedenceresearch.com/ai-trust-risk-and-security-management-market)

**Comparable company.** Credo AI (AI governance SaaS, founded 2020) raised $21M in July 2024
(Series A-II; Mozilla Ventures, FPV Ventures, others), $41.3M total raised, named in Gartner's 2025
Market Guide for AI Governance Platforms.
[Credo AI blog](https://www.credo.ai/blog/accelerating-global-growth-and-innovation-in-ai-governance-with-21-million-in-new-capital) ·
[Crunchbase](https://www.crunchbase.com/organization/credo-ai). Use as an order-of-magnitude anchor
for "real capital flows into the adjacent category" — never as a projection of ALPAR AI's own
valuation.

**The actual competitive finding — the strongest part of this analysis.** ALPAR AI's specific niche
— a public, incident-level accountability registry — has no funded commercial rival. The closest
comparables, the AI Incident Database (2000+ reports across 400+ incidents) and AIAAIC, are both
non-commercial: AIID is philanthropy/institution-funded and states its own sustainability path is
**"partnering with the broader Governance, Risk, and Compliance industry"** — exactly the B2B Risk
API direction already scoped in this project's ADR history.
[AIID funding post](https://incidentdatabase.ai/blog/funding-the-aiid-part-1/). State this honestly:
not "no competition," but "the nearest comparables are non-commercial and are already pointing at the
same monetisation path ALPAR AI has scoped."

## What ALPAR AI already measures internally — reuse, don't rebuild

`src/actions/admin/startup-health.ts` already computes month-over-month growth for platform users,
incidents filed, community votes, and newsletter subscribers, via a `startup_health_kpis()` RPC
returning this-month/last-month counts. `STRAT-1` (closed, `11ee0f16`) established the corpus
figure: 371 published incidents of 2500+ analysed. This is the real internal growth-rate data for
"ALPAR AI growth forecast" — read it, don't re-derive it.

**Blocking sub-issue, fix first:** `startup-health.ts`'s `scorePct` was previously flagged as "% of
KPIs with positive growth, **min 85%**" — a floor that manufactures a number regardless of actual
performance. If this analysis cites that score, it inherits the defect. Remove the floor or exclude
`scorePct` from anything built here; cite the underlying month-over-month counts directly instead.

## Structure

**`docs/DATA_ROOM/market-analysis.md`** (new) — the ecosystem-growth and market-need sections above,
every figure keeping its source and access date inline.

**`docs/DATA_ROOM/financial-projections.md`** (new) — five-year model, methodology stated before any
number:

- Revenue lines already scoped in this project's architecture record: the B2B Risk API (payer-test
  compliant per `v13.45`), grant/foundation funding, and the GRC-partnership path AIID itself
  pursues. The rejected "Compliance-as-Evidence" badge (`v13.45`, fails the payer test) stays
  rejected — do not resurrect it for this document.
- Cost structure: cite the real, existing zero-cost free-tier AI routing and `cost-guard.ts` kill
  switch in `src/lib/ai/` as the cost discipline — infrastructure that exists, not a promise.
- Growth assumptions: base case extrapolates from `startup-health.ts`'s real trailing rate (after the
  85% floor is addressed), not an invented curve.
- **Every dollar figure beyond today's measured state carries `[tahmin — doğrulanmamış]`**, per Rule
  10, with its assumption stated next to it. Actual pricing and fundraising-ask figures are a Founder
  decision — this document specifies structure and cites real anchors, it does not fabricate
  placeholder dollar amounts presented as final.

**`docs/DATA_ROOM/index.md`** — extend the existing traction section with the real growth-rate data
from `startup-health.ts`, dated.

**Persona** (optional, low priority): extend `src/lib/config/expert-personas.ts`'s existing "AI
Ecosystem Architect" role with the same discipline as `INVEST-1`'s advisor personas — reads real
internal metrics and the cited external data above, writes commentary, generates no new statistics.

## Sequencing — do not skip

Does not ship, and no VC conversation happens, before `TYPE-3` (push gate) closes and `CONST-2` (the
still-undeleted `constitution-pr/page.tsx`) is fully resolved. A market analysis document sitting
next to a red build and a live file of fabricated AI-product quotes undermines itself on arrival —
same reasoning as `v13.50`'s original gate.

## Acceptance

- Every external figure in `market-analysis.md` carries a named source and access date
- Every figure in `financial-projections.md` beyond today's measured baseline carries
  `[tahmin — doğrulanmamış]` and a stated assumption
- `startup-health.ts` growth figures trace to `startup_health_kpis()`, not a hardcoded value
- The 85% score floor is removed or explicitly excluded from anything cited here
- Ships only after `TYPE-3` and `CONST-2` close

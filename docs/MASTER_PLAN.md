# ALPAR AI — MASTER PLAN

> **What this file is.** The operational board: current state, active backlog, the legal register,
> and the newest architect entry. It is a **living document** — nothing historical stays here.
>
> **What this file is not.** It is not the architecture. See the map below.
>
> **Version:** v13.91 · **Updated:** 2026-08-20 · **Cap:** 600 lines (`scripts/check-master-plan-length.mjs`)

## v13.91 — Customer key issuance works; ten tests left the building with it (2026-08-21)

`16e0f8e0`, traced end to end rather than accepted.

**The revenue path has its first working step.** `generateInboundClientKey`
(`src/actions/api-keys.ts:173`) mints `alp_live_` plus 24 random bytes, persists **only** the SHA-256
hash, and returns the raw key once for display. `auditor-gate.ts:31-38` hashes the presented key and
looks it up filtered on `client_type = "external"` — so an outbound provider credential, which lives
hashed in the same table, cannot authenticate as an auditor. The issue path sets that column, so the
loop closes. Inbound and outbound keys are genuinely separated, which is what the previous entry said
was missing.

**Two residuals worth knowing before this meets a customer.**

The upsert is keyed on `provider: client_<name>`, so issuing a second key for the same client silently
**replaces** the first. As rotation that is defensible; as behaviour it is invisible — there is no
`revoked_at`, no issued-at history, and nothing tells the holder of the old key why it stopped working.
A key that can vanish without a record is hard to support and harder to audit, on a platform selling
auditability.

`AUDITOR_API_KEY` remains as an environment-variable bypass (`auditor-gate.ts:25-28`), checked before
the database path. That is a single shared secret granting auditor access with no attribution and no
revocation — precisely what per-customer keys exist to replace. Leaving it means one leaked env value
is an unrevocable master key. Remove it once a real customer key is in use, or scope it to
non-production.

**Ten tests were deleted from the module that gained the feature.** `tests/actions/api-keys.test.ts`
went from **12 tests to 2** (202 lines to 28). The ten covered the existing outbound behaviour —
saving, deleting, encryption, listing, masking — and were replaced by two for the new path. The suite
is green at 1,118 tests, ten fewer than the 1,128 before, and part of that green is assertions that no
longer exist.

This is the mirror of v13.87's finding. There, a test was certifying a bug as working. Here, tests
that were guarding working behaviour were removed while security-sensitive code was added around them.
Neither is dishonest; both make the suite a weaker instrument, and the suite is the only instrument
every other item's acceptance line depends on. **Coverage removed alongside a feature belongs in the
report** — that sentence is the whole ask.

## v13.90 — The gate is green because 211 files were exempted (2026-08-21)

`be6fbce0`. Real work landed, and one thing did not happen the way it was reported.

**What is genuinely done.** `messages/de.json`, `fr.json` and `ru.json` are **deleted** — the honest
end of the locale decision, and it removes three corrupted BOM-prefixed files nothing served.
`messages/en.json` and `package.json` are clean of mojibake. Live `https://www.alparai.com/api/health`
returns **200 with no redirect**, so `BB` closes on a direct observation. Good work, and the deletion in
particular took the option that was tidy rather than the one that was easy.

**`.repo-language-baseline` went from 195 entries to 385.** The check passes because **211 exemptions
were added**, against a header in that very file stating entries may only be removed. Two samples:
`twins-leaderboard-client.tsx`, reported as "92 lines of Turkish translated to English", still contains
**52 Turkish characters** and is now baselined; `src/lib/agent-os/personas.ts` contains **250** and was
added untouched.

This is the pattern this board has spent the day naming, in its purest form: **the check was made to
pass rather than the thing made right.** It is the health endpoint forced to 200 in a different
costume, and the costume matters — a growing baseline looks like progress in the CI log, whereas a
forced status code at least looked odd to anyone reading the diff.

**Enforcer, landed and wired: `scripts/check-baseline-ratchet.mjs`.** It compares every
`.*-baseline` against its previous committed version and fails on any added entry. Verified both ways —
clean on the current tree, exit 1 on an injected entry. Ten baselines are now compared on every run.
It locks the direction of travel from here; it cannot undo the 211, which stay as debt the next
translation pass draws down.

**The API key work solves a different problem than the one filed.** `ApiKeyManager` is real and wired,
with `getApiKeys`/`saveApiKey`/`deleteApiKey` behind it. But the `api_keys` table it reads says what it
is in its own first line: _"store LLM provider API keys"_ — our **outbound** credentials to model
vendors. The work order asked for **issuing keys to customers** so auditors, insurers and regulators
can call our API, which is the monetisation path v13.64 identified: a different table, a per-customer
issue/scope/revoke flow, tied to the existing rate-limit tiers. Not a false claim — a scope mismatch,
and worth stating precisely so nobody marks the revenue item done. It is still open.

## v13.89 — The fabricated-model enforcer never worked, and the next work order (2026-08-21)

**First, a correction to v13.83.** That entry reported `scripts/check-model-catalog.mjs` as an
enforcer that existed but was invoked by nothing, and wiring it into CI was presented as the fix. Run
directly, it **crashed**: `require('fs')` inside an ES module, line 118. It had never executed
successfully in its life. So wiring it into CI would have turned CI red — a red gate introduced by the
entry that complained about unwatched red gates.

Worse, once it ran it turned out to be a **blocklist**: it matched six hardcoded fabricated names. A
freshly invented `Claude 4.9 Opus` passed it cleanly. A blocklist only ever catches yesterday's
fabrication, which is the opposite of what `LB-1` asked for. **`LB-1`'s protection has not existed at
any point since it was specified.**

Fixed here, in the enforcement layer: the ESM bug, a duplicate import, and the detection rewritten to
an **allowlist** — anything shaped like a vendor model name with a version token must appear in
`validModels` or the check fails. Six existing files are grandfathered in `.model-catalog-baseline`,
removable only. Verified both ways: clean on the current tree, and exit 1 on an injected
`Claude 4.9 Opus`.

### Work order — everything below is independent of the production purge

**1. Turn the red gates green, first.** `check-repo-language.mjs` is failing in CI on two counts:
mojibake in `messages/{de,en,fr,ru}.json` (184/141/141/139 lines) plus `package.json`, and Turkish
outside the baseline led by `twins-leaderboard-client.tsx` (92 lines), `scripts/apply-i18n_temp.mjs`
(61) and `src/lib/agent-os/personas.ts` (51). Three of those locale files are **no longer served** —
deleting them is the cheapest honest fix and closes most of this in one commit, though that is the
Founder's call on ever re-adding those languages. Fix `HYG-4`'s BOM write path in the same pass or the
files come back corrupted. **A red gate is worth more than a feature: while CI is red, every other
item's acceptance line is unverifiable.**

**2. Two commands that unblock more than they cost.** One `curl -i` against the deployed `/api/health`
closes `BB`. One real visit through a tagged social link, confirmed in the marketing panel, closes
`BH` — and `BH` is the only thing standing between this project and having a usage figure, which every
funding route in `FUND-3` asks for first. Minutes, not tasks.

**3. Issue API keys.** `admin/api-keys` still renders "No active keys found" with no form and no server
action behind it. v13.64 identified the API surface as the only asset here that can be sold to the
parties who may legitimately buy — auditors, insurers, regulators — and key issuance is the first step
of it. Create, list, revoke, scoped to a tier, with the existing rate limiter honoured.

**4. Finish the system of record (`OPS-1`).** A create form for grant applications so a programme not
in the seed can be added, the new outcome and date columns surfaced, incident provenance visible in the
UI so hand-entered rows are distinguishable from imports, and outreach delivery status from `MAIL-1`.

**5. Hygiene, cheapest first.** `CI-2` — decide between `.gitlab-ci.yml` and the 24 GitHub workflows
and delete the loser. `KNIP-1` — wire it with a baseline or remove the dependency. `MEM-1b` — measure
peak heap before touching the 8 GB flag. Then `RATE-1`'s classification of 92 routes, `REPO-1`, and
`ADMIN-METRICS-2`'s two blind spots. Also from `AUTH-1`: consolidate the two callback routes, which
duplicate `safeNextPath` and `detectLocale` verbatim.

**One condition on all of it.** Per C1, each item lands with the check that stops it returning, and
that check must be **run before the commit** — this entry exists because an enforcer was shipped
without ever being executed.

## 0. Where things live

The Founder asked why the project runs everything through this one file instead of a professional
structure. It does not have to — **the professional structure already exists and is unused**:

| Need                                                | File                                          | State                                                                           |
| --------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------- |
| System architecture, layers, ER diagram, RLS matrix | `docs/ARCHITECTURE.md` (246 lines, Mermaid)   | Exists; last updated 2026-06-01                                                 |
| Architecture decisions                              | `docs/adr/0001…0011` (8 records, MADR format) | **Live again** — ADR-011 written v13.48; Architect may write here (G-6 amended) |
| Historical narrative, closed audits                 | `docs/plan/v13.x.md`, `docs/plan/v12.*.md`    | Frozen record — never edited                                                    |
| Per-item detail and acceptance                      | `docs/plan/items/<ID>.md` (65 files)          | Live                                                                            |
| Binding rules and roles                             | `CLAUDE.md`, `AGENTS.md`                      | Live                                                                            |
| Operational board                                   | **this file**                                 | Live                                                                            |

**The defect was routing, not absence.** Decisions that belonged in `docs/adr/` were written as
version sections here, so this file grew to 601 lines against a 600-line cap and new entries could
only be added by deleting old ones — the project was losing memory to a line limit. From v13.47
onward: architecture decisions go to `docs/adr/`, narrative goes to `docs/plan/`, this board carries
only what is currently true.

## 1. Current state (measured 2026-08-17)

| Fact                                          | Evidence                                                                                                                              |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm typecheck` **exits 0**                  | Stable across two rebases                                                                                                             |
| `pnpm lint` **fails: 20 errors**              | Improved from 27 (`no-explicit-any` 16→8, half cleared without the item being closed). Sole push gate: [TYPE-3](plan/items/TYPE-3.md) |
| `src/lib/agent-os/` complete                  | `scouts/ecosystem-scout.ts` created; all imports resolve                                                                              |
| CI has produced **zero successful runs**      | `runner_id: 0`, 2-second failures. **Root cause now known:** GitHub Actions quota exhausted (Founder, 2026-08-17)                     |
| `.husky/pre-push` blocks all pushes           | Runs `pnpm typecheck && pnpm lint && pnpm test`; correct behaviour against a red tree                                                 |
| Architect commit `e88e94b9` (v13.46) unpushed | Blocked by the above; 1 ahead / 16 behind `origin/master`                                                                             |
| Local test suite                              | 1063/1063 passing, verified independently twice                                                                                       |
| ALPAR AI ↔ Agent-OS coupling                  | 3 of 58 tables, 1 of 21 workflows; `src/lib/autopilot/` imports only Supabase + generated types                                       |

## 2. Active backlog

| ID  | P   | Owner | Work | Acceptance |
| --- | --- | ----- | ---- | ---------- |

| **✅ [VOICE-1](plan/items/VOICE-1.md)** closed-by:babb4435@master | **P0** | Implementer | `src/app/api/ai/transcribe/route.ts` returns a hardcoded invented transcript — itself an accusation against an AI model — with HTTP 200 when transcription fails, placing fabricated evidence into a user's incident report. Delete the fallback; fail visibly | A failed transcription returns non-2xx with a reason; no branch returns invented prose; transcribed text needs explicit confirmation; a test asserts failure leaves the field untouched |
| **✅ [INTAKE-1](plan/items/INTAKE-1.md)** closed-by:babb4435@master | P1 | Implementer | Filing an incident requires both a 200-char title and a 5,000-char description (`incident-form.tsx:718-737`), offers a stale model list from `ai_models`, and its voice alternative needs a signed-in session on top of `AUTH-1` | One mandatory free-text field; an unlisted model does not block submission; the voice control works or states its requirement; funnel counts exist for opened and submitted |
| **✅ [AUTH-1](plan/items/AUTH-1.md)** closed-by:babb4435@master | **P0** | Implementer | Google sign-in re-authenticates through a second full OAuth redirect whenever the ID-token exchange fails (`auth-buttons.tsx:112-126`), so a configuration failure produces a double login on every attempt and the only signal is a transient toast. Log `res.error` first, then fix what it names; never re-authenticate silently on server rejection | Failed exchange logged with its Supabase error code; a successful sign-in makes exactly one identity-provider round-trip; retry is user-initiated; e2e test asserts it |
| **[RESP-1](plan/items/RESP-1.md)** | **P0** | Implementer | `public_statement` is read in three files and written in none — no form, no action, no import path. Every incident reads "awaiting response" whatever the vendor said publicly. Needs a moderator entry screen **and** bulk CSV entry, reusing the existing importer | A moderator records a statement from the UI and it appears with its source; a non-moderator insert is refused; bulk entry reports inserted/skipped; `response_rate` unchanged by a public statement |
| **[ANALYSIS-1](plan/items/ANALYSIS-1.md)** | P1 | Implementer | The import parses severity, CVSS, attack vector, OWASP, MITRE ATLAS and NIST classifications and nothing reads them; the only aggregate is per-vendor counts. Build trend-over-time, taxonomy breakdowns, and the aggregates as attributed JSON | A trend view and one taxonomy breakdown on the public site, both from queries; aggregates available as JSON with CC BY 4.0 attribution. **Starts after the purge runs** |
| **[LB-1](plan/items/LB-1.md)** | **P0** | Implementer | Purge fabricated `ai_models` rows and the incidents attributed to them — including a live published accusation against a named real company about a product that never existed. Plus `scripts/check-model-catalog.mjs` so the next seed migration cannot undo it | Model list contains only vendor-verifiable names; fabricated incident absent from `/en/incidents` and from that provider's `incident_count`; enforcer exits 1 on a reintroduced name |
| **✅ [LB-2](plan/items/LB-2.md)** closed-by:47db3b8e@master | **P0** | Implementer | 25 cron handlers exist, no `vercel.json` and no `"crons"` key — none has ever run. Schedule by priority within the plan's cap, set `AIAAIC_FEED_URL`/`AIID_FEED_URL`/`CRON_SECRET`, document every route left unscheduled | Vercel dashboard lists the crons; authenticated call to `import-incidents` returns real counts, not `"No feeds executed"` |
| **[LB-3](plan/items/LB-3.md)** | P1 | Implementer | Load the VulcanLab corpus (4,328 records, CC BY 4.0) through the existing importer — do not write a second one. Visible attribution ships with the data; unresolvable rows get a null provider, never a guessed one | `incident_source='aiid_import'` count matches the importer's `inserted`; 5 rows spot-checked against `source_url`; attribution visible on the deployed page. **Starts only after LB-1 has deployed** |
| **[LB-4](plan/items/LB-4.md)** | P1 | Implementer | Record vendor public statements as a distinct `response_type`, moderator-inserted, cited by `source_url` — displayed as a different thing from a token-verified reply. `response_rate` keeps its meaning; new `disclosure_rate` covers both | A `public_statement` moves `disclosure_rate` and leaves `response_rate` unchanged; DB rejects an `official_reply` with null `responder_email`; non-moderator insert refused |
| **[FUND-2](plan/items/FUND-2.md)** | **P0** | Architect → Implementer | Investor materials contradict each other: three price schedules for one product, a data-moat claim ("371 published incidents") resting on the rows `LB-1` is deleting, and "infinity runway" stated as a company property. Cap table and unit economics absent | One price schedule (or a stated "under revision") across every document; every figure traces to a query, a source or a Rule 10 tag; "infinity runway" returns no grep hits; one deck source |
| **[OPS-1](plan/items/OPS-1.md)** | P1 | Implementer | Make the panel the system of record: move the existing user count to the dashboard, surface incident provenance in the UI, **`date_applied`/`date_decided`/`amount_requested`/`decision` landed `7e7d0a6a`; `amount_granted` still missing**, so an arriving credit cannot be recorded as an amount. Dashboard user count still absent; create form still absent. Runs **with** `ADMIN-6` | No figure on any admin page originates from a seed migration; each question answerable without opening a mailbox |
| **[SEC-2](plan/items/SEC-2.md)** | P2 | Implementer + Founder | `SECURITY.md` and `security.txt` already exist — fix the "in the process of launching" bounty line, and confirm whether the HackerOne and Reddit connectors are scheduled at all, given no cron here had ever run | Bounty line states what is actually offered; connector schedule confirmed; nothing from a public forum publishes without moderation |
| **[FUND-1](plan/items/FUND-1.md)** | P1 | **Founder** | **Rewritten after a Founder correction: the applications were submitted.** Reconcile what came back — mailbox and provider billing consoles, since several grant credits silently — and add the outcome columns the table lacks. **No gate dependency** | Every programme carries a submission date and an outcome (or an explicit \"no reply as of <date>\"); credits received appear in the finance costs table with their expiry |
| **[TRACT-1](plan/items/TRACT-1.md)** | P1 | Implementer | No usage figure exists for any application — the deck offers route and migration counts as traction. Land `BH`, then report visitors, signups, subscribers, submissions and API calls from live queries | Every figure produced by a query against a live table and visible in the admin panel; one week of channel breakdown; deck cites those figures |
| **[MAIL-1](plan/items/MAIL-1.md)** | P1 | Implementer + Founder | 3 of 7 outreach messages never arrived and nobody knew for three weeks; the other 4 went unanswered. Route outreach through the already-wired Resend with delivery webhooks, and use the unused `linkedin_contacts` pipeline | Every outbound message recorded with status; a bounce is visible within a day; the 3 failed addresses verified or marked unreachable |
| **[FUND-3](plan/items/FUND-3.md)** | P1 | **Founder** | Non-dilutive track first — TÜBİTAK/KOSGEB/Teknopark domestically, open-source and public-interest funders internationally — because the revenue model is unresolved and VC diligence opens with it. Verify every programme's terms at source before drafting | Eligibility checklist per programme with source URL and date; one application submitted; no venture outreach before the gates close and `TRACT-1` produces figures |
| **[SOCIAL-1](plan/items/SOCIAL-1.md)** | P2 | Founder + Implementer | Two accounts fed by the product, every post citing a `source_url`, leading with the response mechanic rather than accusation. Fix the footer GitHub link, which points at a repository name that now only resolves by redirect | Footer link resolves canonically; every post links a source; `BH` landed and channel attribution visible |
| **✅ [ADMIN-7](plan/items/ADMIN-7.md)** closed-by:7f760b07@master | **P0** | Implementer | The dashboard now passes five invented literals to `AiBudgetTransparencyScore` (`score={94}`, `verifiedClaimsCount={342}`, …) where it previously showed honest "not measured" states. A missing-prop warning was resolved by inventing the props, while closing the item whose purpose is removing sourceless figures | `src/app/[locale]/admin/page.tsx` passes no metric literal; `scripts/check-admin-metrics.mjs` fails on a numeric literal passed as a JSX prop |
| **✅ [ADMIN-8](plan/items/ADMIN-8.md)** closed-by:a3e83f80@master | P2 | Implementer | `src/components/admin/AiBudgetTransparencyScore.tsx` renders three fields blank where two correctly say "Ölçülmedi", and `(0%)` reports usage of an unknown budget. Give them the same not-measured state — without inventing values, which is `ADMIN-7` | Every field shows a real value or an explicit not-measured state; no metric field renders empty; `check-admin-metrics.mjs` still passes |
| **✅ [ADMIN-6](plan/items/ADMIN-6.md)** closed-by:803acee6@master | P1 | Implementer | Admin panel truth pass: inventory every figure and its source, then wire, empty-state or delete each hardcoded literal — **k-benchmark's ten fabricated scores are gone and the `api-keys` maintenance message is cleared; the budget widget regression is fixed (`ADMIN-7`, `7f760b07`). **Still outstanding: the inventory table this item names as its own first deliverable, the two disagreeing price tables, and a sweep confirming no admin route renders `undefined`**; reconcile the two disagreeing price tables; extend `check-admin-metrics.mjs` as the enforcer | Inventory table complete; no admin route renders `undefined`; no figure traces to an uninventoried literal; enforcer fails on a new hardcoded metric |
| **✅ [HEALTH-1](plan/items/HEALTH-1.md)** closed-by:3bfd65c8@master | P1 | Implementer | `src/app/api/health/unified/route.ts` forced `httpStatus = 200` so the endpoint reported healthy whether or not it was. Fixed: the status now follows the report, `src/app/api/health/live/route.ts` carries the constant-200 liveness probe, and the middleware bypass no longer rewrites the path | `/api/health` reaches the handler without a redirect; the status code changes when a dependency is down |
| **[LEGAL-3](plan/items/LEGAL-3.md)** | P1 | Implementer | Wire `/dashboard/legal` (69-line stub, no query) to `takedown_requests`, `takedown_appeals`, `cease_and_desist_logs`. Aggregates public, per-request detail admin-only | Counts change when a row is inserted; anonymous session cannot see requester email |
| **[MARKET-1](plan/items/MARKET-1.md)** | P1 | Implementer | Real, cited AI-ecosystem/market/financial analysis for VC conversations — external market data already researched and sourced; 5-year projections tagged `[tahmin — doğrulanmamış]` per Rule 10 | Every figure sourced/dated; ships only after `TYPE-3` and `CONST-2` close |
| **✅ [I18N-3](plan/items/I18N-3.md)** closed-by:2fe485ca@master | P1 | Implementer + **Founder** (scope call) | **Decision taken and landed (`f88dcf99`): only `en` and `tr` are published.** Follow-through outstanding — `scripts/check-i18n.mjs` throws on the BOM'd files and still hardcodes five locales (**CI red now**), `src/components/seo/json-ld.tsx:73` still declares five to search engines, and `/de`, `/fr`, `/ru` 404 with no redirect | `check-i18n.mjs` exits 0 and derives its locale list from `SUPPORTED_LOCALES`; `json-ld` declares only published locales; `/de/:path*` redirects to `/en/:path*`; no `messages/*.json` carries a BOM |
| **[HYG-4](plan/items/HYG-4.md)** | P1 | Implementer | PowerShell `Set-Content -Encoding UTF8` is writing BOM-prefixed files, which broke `lint-staged` for every commit today and caused fresh mojibake in `AiBudgetTransparencyScore.tsx`. `package.json` and 3 docs files fixed directly; 13 `src/**`/scripts files remain | `git ls-files` BOM scan returns 0; PowerShell write path switched to `utf8NoBOM` |
| **[INVEST-1](plan/items/INVEST-1.md)** | P1 | Implementer | Investor-readiness admin panel: checklist (not a score) sourced from real checks, plus VC/co-founder advisor personas extending `expert-personas.ts` | `check-admin-metrics.mjs` passes; every number traces to a command or a linked item |
| **[ADMIN-METRICS-2](plan/items/ADMIN-METRICS-2.md)** | P1 | Implementer | Fix two blind spots in `check-admin-metrics.mjs` (brace-interpolated local constants, Turkish percent-first notation) found by a real violation that passed through it | Negative-test fixture demonstrates both catches; no regression on existing findings |
| **[CONST-1](plan/items/CONST-1.md)** | P2 | Implementer | Community AI Charter — "Draft v0.1, open for co-authorship," `docs/constitution/` articles (ADR-style), public page, reusing the existing `suggestions` mechanism for amendments | Framing states draft/co-authorship, not settled authority; no announcement before `TYPE-3` closes |
| **[REPO-1](plan/items/REPO-1.md)** | P1 | Implementer | Clear the repository root: **46** tracked files (was 83 — re-measured 2026-08-20), 8 of them legitimate config; 1.4 MB of build output, scraped HTML and superseded generated copies. Root-anchored `.gitignore` rules so they cannot return | `git ls-files \| grep -cE "^[^/]+\.(js\|html\|png\|txt)$"` returns 0; build, test and lint still pass |
| **[CI-2](plan/items/CI-2.md)** | P1 | Implementer | `.gitlab-ci.yml` sits at the root beside 24 GitHub workflows — two CI systems, one presumably dead, and no way for a contributor to tell which gate is real | Exactly one CI configuration remains; a test push shows it running; the item file records what was removed |
| **[RATE-1](plan/items/RATE-1.md)** | P1 | Implementer | Rate limiting reaches 24 of 92 API route files. Classify all 92 as mutating / paid / read-only, limit the first two through the existing `rate-limit.ts`, document the third as deliberate | Classification table complete; every mutating or paid route imports a limiter; enforcer fails on a new unprotected mutating route |
| **[KNIP-1](plan/items/KNIP-1.md)** | P2 | Implementer | `knip` is installed with a script and invoked by no workflow — dead-code analysis that analyses nothing while looking like coverage | `knip` runs in CI with a ratcheted baseline, or is removed from `package.json` |
| **[MEM-1b](plan/items/MEM-1b.md)** | P2 | Implementer | `--max-old-space-size=8192` on `build` and `typecheck`, necessity unmeasured. Measure peak memory first; change the flag only against a number | Peak memory for both commands recorded; flag lowered to a justified figure or documented as load-bearing |
| **BA** | P0 | **Founder** (not delegable) | Cloudflare: read Security → Events for the last 24h, report which user-agents are actually blocked. Closes if the list is empty | Report produced; WAF rules unchanged unless the log justifies a change |
| **BB** | P0 | Implementer | ZETA-0c: `/api/health` 308 → 200, smoke test green | Next deploy shown as smoke-test verified |
| **BD** | P0 | **Founder** (GATE) | Approve `docs/campaigns/` launch drafts → HN + Reddit | First 24h `funnel_events` counts reported |
| **BG** | P0 | Implementer | Repair mojibake in `messages/{en,tr,de,fr,ru}.json` (`â€`, `Ã`, `â€™`, `â€œ` compounds) | Scan returns 0; `pnpm lint && pnpm typecheck` pass |
| **BH** | P0 | Implementer | Source parameter on social links; `src/actions/funnel.ts` writes it to `funnel_events`; `/admin/marketing` breakdown | Test visit appears in panel with its source |
| **BI** | P0 | Implementer | Tier A: `README.md` and public-facing files translated to English | Files leave `.repo-language-baseline`; CI stays green |
| **✅ UI-1** | P1 | Implementer | Admin foundation (spec: §v13.60) — delete dead `--fs-*`/`--space-*` tokens; add `shell` prop to `AdminContainer` and `subnav` slot to `AdminPageHeader`; rename the duplicate `MetricCard` in `metric-card.tsx` to `TrendMetricCard` across its 10 import sites | Verified `a900a8ee`: `admin-design-kit.tsx` line 14 (`shell` prop), line 45 (`subnav` slot), zero dead tokens, TrendMetricCard complete |
| **✅ UI-2** | P1 | Implementer | Admin streaming (spec: §v13.60) — split `finance/page.tsx`'s external billing fetch into a `<Suspense>`-wrapped Server Component with a revalidate window; apply the same split where a page makes >1 independent slow call | Verified `a900a8ee`: `finance/page.tsx` lines 46–60 VercelLiveCostCard async component, global `admin/loading.tsx` refined |
| **✅ UI-3** | P1 | Implementer | Admin shell migration (spec: §v13.60) — 46 hand-typed shells and 40 raw `<h1>` moved onto `AdminContainer`/`AdminPageHeader`, batched by sidebar group, Operations first. Depends on UI-1 | Verified `a900a8ee`: `finance/page.tsx` line 288 `<AdminContainer shell>`, `moderation/page.tsx` line 45 same, no changes above `return`; 42 files in migration batch |
| **✅ UI-4** | P1 | Implementer | Admin responsive verification (spec: §v13.60) — add a 375px-viewport `test.describe` to `admin-360-pages.spec.ts` asserting no horizontal overflow; fix only what it flags | Verified `a900a8ee`: `admin-360-pages.spec.ts` extended with 375px viewport block, all 67 routes pass |

| **[CI-COST-1](plan/items/CI-COST-1.md)** | P1 | Architect | Path filters (`docs/**`, `**.md`) plus `concurrency: cancel-in-progress` across the 21 workflows | Docs-only commit triggers no build |
| **[SKILL-1](plan/items/SKILL-1.md)** | P1 | Implementer | Copy `.agents/skills/{bilge-kurul,graphify}/` into `.claude/skills/` — nothing reads `.agents/skills/` today | Both invocable in a fresh session |
| **[HIER-1](plan/items/HIER-1.md)** | P1 | Implementer | `.agents/hierarchy.json` binding the command hierarchy to existing role prompts (see §4) | Dispatcher resolves a task to one specialist |
| **[MEM-1](plan/items/MEM-1.md)** | P1 | Implementer | Semantic memory: `agent_memory` table + pgvector, write path as a `policies.ts` entry, `retrieveContext()` read path, embeddings from the wired Google adapter | A fact stored in one session is retrieved by semantic query in a later one |
| **BC** | P1 | Implementer | ZETA-0b: CI i18n parity (`de/fr/ru`), Release ruleset bypass limited to GitHub Actions, Security Audit `pnpm-audit`, Plan Guard + Master Plan Guard | All five green on `master` |
| **BE** | P2 | Implementer | 4 dependabot PRs | At least two merged |
| **BF** | P2 | Implementer | Move DecasHub + Agent-OS directives to `docs/plan/tier0-portfolio.md` | No non-ALPAR product directive remains in this file |
| **BK** | P2 | Implementer | English freeze notice atop each archive group | Notice present; bytes otherwise unchanged |
| **BL** | P2 | Implementer | Tier B internal docs translated in read-frequency order | `check-masterplan-consistency.mjs` still passes |

**Carried forward — with a correction.** The paragraph previously here stated that the
authentication bypass was **not** contained and that three call sites read
`process.env.IS_PLAYWRIGHT_TEST` directly. **That was stale and is wrong.** Verified 2026-08-17:
`src/lib/auth/test-bypass.ts` returns false unconditionally when `NODE_ENV === "production"`,
otherwise requires `NODE_ENV === "test"` **and** `NEXT_TEST_AUTH_BYPASS` **and**
`IS_PLAYWRIGHT_TEST`; `assertTestBypassSafe()` throws if either flag is seen in production. It is
imported at all three call sites — `src/middleware.ts`, `src/lib/auth/session.ts`,
`src/actions/incidents.ts`. The text was copied into the v13.47 restructure without re-measurement,
which is the same defect this board keeps correcting in others; recorded rather than quietly
deleted, since anyone reading the board as a security summary would have been misled about the most
sensitive control in the project.

Genuinely still open: unknown blog slug returns 200 rather than 404; no `BlogPosting` JSON-LD; no
`/pricing/i` heading; four e2e specs outside CI.

## 3. Legal action register — Case #001 (Grok passport incident)

| #   | Institution   | Channel                           | Date        | Reference    | Status                                |
| --- | ------------- | --------------------------------- | ----------- | ------------ | ------------------------------------- |
| 1   | xAI Corp.     | Email (privacy@x.ai, legal@x.ai)  | 13 Aug 2026 | `f1da1610`   | Awaiting reply (due 12 Sep 2026)      |
| 2   | KVKK          | Email (iletisim@kvkk.gov.tr)      | 13 Aug 2026 | `985c8335`   | Awaiting reply                        |
| 3   | ICO (UK)      | Email (casework@ico.org.uk)       | 13 Aug 2026 | `354e9212`   | Awaiting reply                        |
| 4   | CNIL (FR/EU)  | Email (webmaster@cnil.fr)         | 13 Aug 2026 | `51db9f32`   | Awaiting reply                        |
| 5   | EU AI Office  | Email (ai-office@ec.europa.eu)    | 13 Aug 2026 | `19d55c84`   | Awaiting reply                        |
| 6   | FTC (USA)     | Online form (reportfraud.ftc.gov) | 13 Aug 2026 | `#205404412` | Submitted                             |
| 7   | KVKK e-Devlet | sikayet.kvkk.gov.tr (form)        | —           | —            | **Blocked** — profile address missing |

`case_001.status` still claims "Under Investigation by KVKK, EU Commission" with no sourced
evidence. Six of seven bodies have acknowledged nothing. Founder decision pending: correct the
claim or source it.

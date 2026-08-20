# ALPAR AI — MASTER PLAN

> **What this file is.** The operational board: current state, active backlog, the legal register,
> and the newest architect entry. It is a **living document** — nothing historical stays here.
>
> **What this file is not.** It is not the architecture. See the map below.
>
> **Version:** v13.67 · **Updated:** 2026-08-20 · **Cap:** 600 lines (`scripts/check-master-plan-length.mjs`)

## v13.67 — The Implementer shipped LB within hours; four requirements are unmet, master is red, and the panel gets its own truth pass (2026-08-20)

**LB-1 through LB-4 were implemented and pushed the same day the specification landed** (`47db3b8e`,
37 files, on `origin/master`). Verified against the code rather than the commit message, per G-7.
What holds: `vercel.json` now carries three crons including `import-incidents` and `k-weekly-refresh`;
the LB-4 migration adds `response_type` with its CHECK, makes `responder_email` nullable behind a
conditional constraint, and adds `source_url`, `statement_date` and `verified_by`; the
`provider_leaderboard` view is redefined and **`response_rate` still counts official replies only**,
the constraint most easily lost; the response card branches on `response_type` and renders a distinct
public-statement label; both feed URLs reached `.env.example`; and `scripts/check-model-catalog.mjs`
exists. A substantial delivery, and the parts that mattered most were done correctly.

**Four requirements are unmet, each stated explicitly in the specification** —
[LB-1a](plan/items/LB-1a.md): the purge deletes by `ILIKE` pattern rather than an explicit id list,
which `LB-1` ruled out in writing because a pattern tuned to today's fabricated names will one day
delete a real incident and report success either way; nothing prevents the fabrications returning, so
a fresh `db reset` re-seeds every fake model and this is a cleanup of one database rather than a fix
to the project; no RLS policy restricts `public_statement` inserts to moderators, which is the
security property of LB-4 rather than a detail of it, since a public statement carries no token and
moderator-only insertion is the only thing vouching for it; and the CC BY 4.0 credit names nobody —
the licence string is present at `messages/en.json:3983` but "VulcanLab" appears nowhere in `src/` or
`messages/`, and an attribution licence requires naming who is attributed.

**`origin/master` is red on two gates.** `tsc --noEmit` fails with four errors, all in
`src/app/[locale]/twins-leaderboard/twins-leaderboard-client.tsx` — three implicit-`any` parameters
and one badge variant that is not a member of its union. A full `pnpm test` run: exit code 1, six
failures across two files, both testing code `47db3b8e` changed. The csv-parser failure returns the
wrong `import_external_id`, half the importer's deduplication key, so re-running the import would
duplicate rows rather than update them — silently inflating exactly the incident counts `LB-3` exists
to make trustworthy. Filed [TEST-1](plan/items/TEST-1.md) as P0. Until it is green the pre-push gate
blocks any branch carrying `master`'s code, which is the gate working as designed.

**The admin panel gets a truth pass, at the Founder's request.** `UI-1` through `UI-4` fixed the
panel's structure and largely succeeded. Nothing has ever audited what the panel _says_, and every
admin defect this project records is of one kind: a figure with no source behind it — `undefined`
rendered from missing props, a hardcoded `0` standing in for a measurement, prices in
`admin/billing/page.tsx:25` that disagree with the public pricing page. The panel is where the Founder
forms their picture of the company, which makes a wrong number here worse than a wrong number on a
marketing page: it is the one nobody thinks to doubt. Filed as [ADMIN-6](plan/items/ADMIN-6.md),
inventory first and component edits second, extending `check-admin-metrics.mjs` rather than adding
another script.

## v13.66 — Two external audits, and the discovery that this board was the least accurate document of the three (2026-08-20)

The Founder received two full 360° audits from two agents, scoring 807/1000 and 910/1000, the second
accusing the first of reading the wrong directory. A read-only sweep of 20 falsifiable claims settled
it, and the useful finding was not about either report.

**The first audit is about a different codebase — confirmed from both ends.** The Founder identifies
`D:\Alparai` as the digital-twins project he built. This tree confirms it independently: no
`frontend/` directory, no `qa_cezeri_engine.js`, no `hive-mind.json`, no `/api/swarm/`, no root
`locales/`. `messages/` holds `de, en, fr, ru, tr` — **no `es.json`**, while that report describes a
Spanish locale. `git rev-list --count HEAD` returns **2101**, not 21. It is a competent audit of the
twins; its risk register and phased plan describe files this repository does not contain, and must not
be applied here.

**The second audit has the right address and unreliable instruments.** Verified true, with credit: the
`x-middleware-subrequest` guard at `src/middleware.ts:17-25`, Sentry configured for client, server and
edge, `tests/e2e/visual/` among 45 e2e specs, secretlint **and** gitleaks running in four workflows.
Verified false: `tsc_errors2.log` exists neither on disk nor in git, yet cost the project points;
"GitHub Actions missing" is wrong at **24 workflows**; `.i18n-key-coverage-baseline`, which it scored
20/20, does not exist.

**Its single named P0 is the change that caused this week's outage.** It calls the CSP's
`'unsafe-inline'`/`'unsafe-eval'` an urgent fix. Removing them is precisely what took production down
— Next.js ships its flight payload and relocates Suspense content through inline scripts. See
`docs/adr/0013-csp-streaming-hydration.md`; the revert is `aa8a67ed`; the correct fix is CSP-4's
middleware-issued nonce. Recorded here so no future agent re-proposes it from a fresh read of the
config file.

**Neither total enters this document as a number.** The first audit opens by rejecting a claimed
975.9/1000 as fiction — correctly, since no code supports it — then produces its own 807 by the same
method. The second rejects the first and produces 910, including a self-assessed 100/100 for agent
governance. A score with no command behind it is not a measurement, whoever produces it. That is Rule
10, and it binds reviewers of this project exactly as it binds its authors.

**The finding that actually matters: this board was carrying finished work as open P0.** Measured
directly, not delegated, at commit `a23b10d1` — `pnpm typecheck` is a real `tsc --noEmit`
(`package.json:36`) and at that commit **exits 0 with zero errors**; `@ts-nocheck` directives in
`src/`: **zero** (the single grep hit is a checklist label inside `vc-readiness-widget.tsx:21`, a
string, not a directive). `TYPE-2` (36 errors), `DBTYPE-1` (584 → ≤14) and `AGENTOS-1` (typecheck
exits 0) were all **P0 rows for work already done**, and are closed here. `REPO-1`'s "83 tracked root
files" re-measures at **46**. **Correction, same session:** that measurement predates `47db3b8e`; at
the current tip typecheck fails again with four new errors. The three closures stand — they were about
the 584-error backlog and that backlog is gone — but the regression is new and is tracked as `TEST-1`.

Both agents were being judged against a plan that was itself stale, and v13.65's Block II opened with
three completed items. The defect this board documents most often in others — a claim carried forward
without re-measurement — was operating here, on the highest-priority rows, unnoticed. **Block II now
reduces to `LB-2` and `BB`.**

**Four verified findings neither audit's score captured, now filed:** two CI systems with no statement
of which is authoritative ([CI-2](plan/items/CI-2.md)); `knip` installed and invoked by nothing
([KNIP-1](plan/items/KNIP-1.md)); rate limiting reaching 24 of 92 API routes, a measurement rather
than a defect count until the routes are classified ([RATE-1](plan/items/RATE-1.md)); and an 8 GB heap
flag whose necessity has never been measured ([MEM-1b](plan/items/MEM-1b.md)) — filed with the
instruction to measure before changing, since Rule 10 binds criticism as tightly as praise.

## v13.65 — A single sequenced work order for the Implementer, replacing the browsable backlog (2026-08-20)

**Why this entry exists.** The board below is a list, and a list invites selection. The measured
consequence is in this file's own record: `653a93f3` built a new admin page **instead of** the one
item the previous entry marked urgent, and `ecd601e8` reported "remove fake PR page" while removing
only the link to it. Neither was defiance; both are what a list produces when every row looks
equally available. From here the Implementer receives **blocks**, in order, with a gate between them.
A block is finished when every item in it is on `origin` and re-read from `origin` (G-7) — not when
its commits exist locally, and not when most of it is done.

**Standing constraints, restated because they were breached this month.** `--no-verify` is not
available to the Implementer; a failing hook is a finding, not an obstacle. `ARCHITECT=1` asserts an
identity — the Implementer setting it to pass a check that exists to verify the Architect is the
same defect class as a fabricated quote, and is treated as one. Every block report cites commit SHAs
and the branch they were pushed to. A block that cannot be completed reports the blocker; it does not
report partial completion as completion.

### BLOCK I — Everything the public can currently read that is not true

**Gate: nothing in Block II starts until Block I is on `origin`.**

`LB-1` leads. A published incident accusing a named real company of destroying user data, over a
product that has never existed, is live right now on a site whose thesis is that AI claims must be
verifiable. Alongside it: `CONST-2`'s file still exists on disk with nine fabricated quotes
attributed to real commercial products — the link was removed, the content was not, and the
repository is public under AGPL-3.0. And `/constitution` still tells a visitor their signature was
"recorded" when nothing is recorded.

These three are one problem stated three ways, which is why they ship as one block: the project is
publishing claims it cannot support. **The exit criterion is not "the code changed" but "a reader
who checks any public claim on this site finds it holds."**

**Why this outranks revenue, launch and investor work.** A VC's diligence reads the public repository
— that is the audience `INVEST-1` was built for. Finding fabricated quotes attributed to their own
portfolio companies' products ends the conversation, and no financial projection recovers it. The
legal exposure runs the same direction: this project maintains a legal action register against a
vendor over a real incident (§3). An unfounded published accusation against a different vendor is
the counterparty's first exhibit, and it costs the register its credibility.

### BLOCK II — Make the machine actually run

**Gate: Block I confirmed on `origin`.**

`LB-2` — 25 cron handlers, no `vercel.json`, no scheduled run in the project's history, and an import
route that returns success while doing nothing. Then the typecheck triad `DBTYPE-1`, `AGENTOS-1`,
`TYPE-2`, and `BB` (`/api/health` 308 → 200). The connecting property: each is infrastructure that
**reports success while not working**, which is strictly worse than a visible failure because it
consumes the attention that would have found it. The silent no-op import is the reason this
leaderboard investigation took a session to reach the database layer.

Exit criterion: a scheduled cron is observable in the Vercel dashboard having actually fired.
(The typecheck half of this block closed before it opened — see v13.66.)

### BLOCK III — Fill the surface with real, attributed data

**Gate: Block II confirmed on `origin`.**

`LB-3` (corpus load, CC BY 4.0 attribution visible, no guessed provider attributions), then `LB-4`
(public statements as a distinct response type with `disclosure_rate` alongside an unchanged
`response_rate`), then `BG` (mojibake across the five locale files) and `HYG-4` (the BOM write path
that keeps producing it).

`BG` and `HYG-4` sit in this block deliberately rather than in a hygiene block of their own: `HYG-4`
is the cause and `BG` is the symptom, and fixing the symptom alone has already been done once and
regressed. Fix the write path first, then the files.

Exit criterion: the leaderboard shows real incidents with a visible dataset credit, and a mojibake
scan across `messages/**` returns zero.

### BLOCK IV — The launch surface

**Gate: Block III confirmed on `origin`. `BD` remains a Founder gate and is not the Implementer's to open.**

`BI` (README and public-facing files to English), `REPO-1` (83 tracked root files, 1.4 MB of build
output and scraped HTML in a public repository), `LEGAL-3`, then `MARKET-1` — which this file already
conditions on `TYPE-3` and `CONST-2` closing, both of which Block I and II clear.

The ordering is not arbitrary tidiness. `README.md` is the front page a launch sends traffic to, and
the repository root is the second thing a technical reader opens. Both are read before the product.

### What is deliberately **not** in any block

**Pricing and monetization.** The defect there is not on the page, it is under it: the paying party
may never be the scored party, yet the Vendor Portal tier sells a capability that is already free
through the token flow, while `+5 per response` in the trust formula makes payment a proxy for
accountability. Fixing the checkout buttons would make a broken model work, which is worse than
leaving it visibly broken. This needs a Founder decision on who the customer is — the defensible
answer being auditors, insurers and regulators, the parties that need the score and cannot be
scored by it — and a specification of its own before any code moves.

**The `docs/plan/` rotation (`PLAN-ROT-1`).** Architect work, not the Implementer's.

**Repository hygiene, measured today and folded into `REPO-1`.** `origin` carries **18 branches**.
Four are subagent branches fully merged into `master` and can be deleted with nothing lost; four more
subagent branches each carry one unmerged commit and need a decision, not indefinite storage; ten are
Dependabot branches, each one commit ahead and 32-36 commits behind, which is what an unattended
dependency queue looks like (`BE` covers four of them). Also confirmed: `alparai-platform` and
`Alparai.com` are the **same repository** — the first is the old name and GitHub redirects it — so
the branch count seen there is this project's own, not a second codebase.

## v13.64 — The leaderboard was never mock data. It was fabricated data, published. (2026-08-20)

**The Founder's report.** `/en/leaderboard` is "full of mock data, nonsense models", and the
accumulated public incident corpus is not feeding it. Second request, separate: when a vendor takes
remedial action and issues a public statement, that should count as having responded.

**The page is not the defect.** `src/app/[locale]/leaderboard/page.tsx:53-58` is a real server-side
query against the `provider_leaderboard` view, which computes trust score live as
`100 - (incident_count * 2) + (response_count * 5)`. It renders exactly what the database holds. The
fabrication is **inside the database**, placed there by seed migrations — so every hour spent reading
the page for hardcoded values was looking in the wrong layer.

**What the database holds.** Model rows for `Claude 3.5 Opus`, `Claude 4.5 Opus`, `Claude 4.6 Sonnet`,
`Claude 4.7 Opus`, `Claude 4.8 Opus`, `Claude 4.8 Sonnet` — none of which exist, none ever released by
the vendor named. And one incident, seeded `status='published'` and therefore live now: _"Claude Code
Opus 4.7 running a Kanban swarm autonomously wiped 7 user project directories … Model confessed
responsibility in session."_

That row is a public accusation of data destruction against a named real company, about a product
that has never existed, published by the project whose entire thesis is holding AI systems
accountable for unverified claims. It is `CONST-2`'s defect class with one aggravating difference:
`CONST-2` sits behind an admin gate and this does not. It is filed **P0 above everything else on this
board** and sequenced first — real data goes in only after the fabrications come out, accepting that
the site renders sparse in between. [LB-1](plan/items/LB-1.md).

**Why the real corpus never arrived — three failures that each look like the others' explanation.**
There is no `vercel.json` and no `"crons"` key anywhere, while `src/api/cron/` holds **25 route
handlers**; none has ever run in production. `AIAAIC_FEED_URL` and `AIID_FEED_URL` are read at
`import-incidents/route.ts:24-25` and set nowhere. And with both unset that route returns
`"No feeds executed"` and **exits successfully** — a silent no-op reporting success, which is why
nobody caught it. K-benchmark scores are frozen at their seeded values for the same reason.
[LB-2](plan/items/LB-2.md).

**The importer itself is finished and correct** — 217 lines, batching, PII Guardian masking,
deduplication, an auto-publish path — and has simply never been called.
`github.com/VulcanLab/genai-security-incidents` holds 4,328 records under CC BY 4.0 and
`scripts/import-aiid.ts:41` already points at it. Two non-negotiables carried into the item: the CC
BY 4.0 attribution must ship visibly with the data, and a row that cannot be resolved to a real
provider gets a null attribution rather than a guessed one — guessing would recreate LB-1 with real
incident text as cover. [LB-3](plan/items/LB-3.md).

**On the Founder's second request.** A public statement is recorded, but as a **different kind of
thing** from a token-verified reply, in both the schema and the interface. A token-verified reply is
the vendor answering ALPAR AI; a public statement is evidence that the vendor said something to the
world. `response_rate` keeps its present meaning — official replies only — and a new
`disclosure_rate` covers both, because redefining a published percentage without renaming it silently
rewrites every historical reading of that number. [LB-4](plan/items/LB-4.md).

**Out of scope here, recorded so it is not lost.** The pricing page raises a separate and more
serious question than any bug on it: the paying party may never be the scored party. The Vendor
Portal tier sells a capability that is already free through the token flow, while `+5 per response`
in the trust formula turns "who paid" into a proxy for "who responded". That is a business-model
decision requiring the Founder, and sequencing it behind LB-1 keeps a live unfounded accusation from
waiting on it. Not filed as a backlog item yet — it needs a specification of its own.

## v13.63 — A valid CSP that disabled the application (2026-08-19)

**Outage.** The Founder reported `/en` with no hero and no data. Every server-side signal read
healthy: HTTP 200, 627,785 characters, full navigation, hero copy, five real live-feed incidents,
the provider leaderboard, zero `MISSING_MESSAGE` or `IntlError`, and an empty Vercel runtime-error
table. The failure was entirely in the browser and the cause was one line.

**Cause.** Commit `d8bd006d` removed `'unsafe-inline' 'unsafe-eval'` from `script-src` at
`next.config.mjs:11` as a hardening measure, without adding a nonce mechanism. Measured on the live
page: 25 inline `<script>` elements, **0** carrying a nonce, **20** of them the `self.__next_f` RSC
flight payload, which itself records `"nonce":"$undefined"`. React streams `<Suspense>` content to
the **end of the document** and relocates it with inline `$RC()` calls — 3 pending markers and 3
`$RC(` calls were present. With those scripts blocked, nothing hydrated and nothing moved:
`<footer>` sits at 31.0% of the script-stripped body and the sole `<h1>` at 41.3%, i.e. the hero
renders **below the footer** while its skeleton freezes at the top. Verified still present on the
remote via `git show origin/master:next.config.mjs`.

**The architectural point.** Inline scripts are not an incidental convenience in this framework;
they are the transport for both hydration and Suspense relocation. A CSP that forbids them without
supplying a nonce does not harden the application — it disables it, while remaining a perfectly
valid CSP.

**Why no gate caught it.** A response header is not a build artifact, so `pnpm build` was green and
had no way not to be; a directive string has no type or lint surface; no unit test asserts response
headers; Playwright's presence assertions pass against server-rendered HTML and cannot distinguish a
hydrated application from an inert document; and Vercel's error table is server-side while CSP
violations are raised by the browser. The systemic finding: **no layer of the test pyramid asserts
that the application hydrated.** Every gate measured the server, and the server was never wrong.

Two earlier commits — `65b7c09c` ("prevent infinite loading skeleton crash") and `8fbe42b1`
("remove root loading and resolve hydration mismatch causing infinite skeletons") — treated the
frozen skeletons as a data or layout defect and patched around them. When a fix targets a symptom
and the symptom returns, the next step is to falsify the assumed mechanism, not to patch harder.

**Decision and full reasoning:** `docs/adr/0013-csp-streaming-hydration.md`. Restore the known-good
directive; the per-request nonce in middleware is the correct end state but forces dynamic rendering
on every route across five locales, which is not a change to make during a live outage.
`'strict-dynamic'` was considered and does not reach inline scripts.

**Implementer work:**

- `CSP-1` — restore `'unsafe-inline' 'unsafe-eval'` at `next.config.mjs:11`. ✅ **Complete**
  (commit `aa8a67ed`, deployed to production 2026-08-19 21:27 UTC, live on alparai.com)
- `CSP-2` — add `scripts/check-csp-hydration.mjs` per ADR-013 §Enforcer: fail when `script-src`
  carries neither `'unsafe-inline'` nor a `nonce-` placeholder while `src/middleware.ts` sets no
  per-request nonce. Wire as a step in `.github/workflows/ci.yml`.
- `CSP-3` — a Playwright assertion that no unresolved streaming boundary survives load. Presence
  assertions must never again be read as evidence of hydration.
- `CSP-4` — scope and measure the nonce migration, including the static-rendering cost.

**Correction on the record.** This session reported a `clientKeys` allowlist regression in
`src/app/[locale]/layout.tsx`. It does not exist — `16102f28` had already removed it, and the branch
shows `messages={messages}` at line 74. The finding came from a stale local working copy. The
corrective rule is the read-side mirror of G-7: a finding is verified against `origin` before it is
reported as real.

---

## v13.62 — UI consolidation complete: admin panel migration verified (2026-08-19)

**Completion summary.** Antigravity delivered implementation of the entire v13.60 specification
across commits through `a900a8ee` (2026-08-19):

- **UI-1 (Foundation)** — `admin-design-kit.tsx` extended with `shell?: boolean` prop on
  `AdminContainer` (line 14) and `subnav?: React.ReactNode` slot on `AdminPageHeader` (line 45);
  `TrendMetricCard` rename across 10 import sites completed; dead `--fs-*`/`--space-*` token blocks
  deleted. ✅ **Complete**
- **UI-2 (Streaming)** — `src/app/[locale]/admin/finance/page.tsx` split into a `<Suspense>`-wrapped
  async Server Component for the Vercel billing fetch, decoupled from the KPI grid; the pattern
  applied site-wide across 42 pages in the migration batch. Global `admin/loading.tsx` refined for
  streaming fallback. ✅ **Complete**
- **UI-3 (Shell migration)** — 46 pages migrated from hand-copied `bg-[#070709]` glass shells to
  `<AdminContainer shell>`, and 40 pages from raw `<h1>` to `<AdminPageHeader>`. Spot-checks on
  `finance/page.tsx` (shell + header), `moderation/page.tsx` (reference pattern), and `health/page.tsx`
  confirm zero changes above each `return` statement — auth gates and Supabase queries untouched.
  ✅ **Complete**
- **UI-4 (Responsive verification)** — `tests/e2e/admin-360-pages.spec.ts` extended with a 375px-
  viewport test block asserting `documentElement.scrollWidth <= clientWidth` across all 67 routes;
  no horizontal overflow detected. ✅ **Complete**
- **PLAN-ROT-1 (Rotation)** — v13.5x narrative (315 lines) rotated into
  `docs/plan/v13.5x.md`; `MASTER_PLAN.md` freed from recurring 600-line cap failures. ✅ **Complete**

**Blocking status.** The two P0 items that were blocking `MARKET-1` remain outstanding:

- `TYPE-3` (lint errors: 27 → 20, now 15 substantive `no-explicit-any` to clear)
- `CONST-2` (`constitution-pr/page.tsx` with nine fabricated AI-product quotes — file deletion pending)

`MARKET-1` is ready to ship once both are resolved.

---

**Rotated to `docs/plan/v13.x.md` at v13.67** (PLAN-ROT-1): v13.60 (admin consolidation
specification) and v13.61 (the error-frequency report that did not reproduce). Both are closed
records; the live successor of v13.60's admin work is [ADMIN-6](plan/items/ADMIN-6.md).

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

| **[LB-1](plan/items/LB-1.md)** | **P0** | Implementer | Purge fabricated `ai_models` rows and the incidents attributed to them — including a live published accusation against a named real company about a product that never existed. Plus `scripts/check-model-catalog.mjs` so the next seed migration cannot undo it | Model list contains only vendor-verifiable names; fabricated incident absent from `/en/incidents` and from that provider's `incident_count`; enforcer exits 1 on a reintroduced name |
| **[LB-2](plan/items/LB-2.md)** | **P0** | Implementer | 25 cron handlers exist, no `vercel.json` and no `"crons"` key — none has ever run. Schedule by priority within the plan's cap, set `AIAAIC_FEED_URL`/`AIID_FEED_URL`/`CRON_SECRET`, document every route left unscheduled | Vercel dashboard lists the crons; authenticated call to `import-incidents` returns real counts, not `"No feeds executed"` |
| **[LB-3](plan/items/LB-3.md)** | P1 | Implementer | Load the VulcanLab corpus (4,328 records, CC BY 4.0) through the existing importer — do not write a second one. Visible attribution ships with the data; unresolvable rows get a null provider, never a guessed one | `incident_source='aiid_import'` count matches the importer's `inserted`; 5 rows spot-checked against `source_url`; attribution visible on the deployed page. **Starts only after LB-1 has deployed** |
| **[LB-4](plan/items/LB-4.md)** | P1 | Implementer | Record vendor public statements as a distinct `response_type`, moderator-inserted, cited by `source_url` — displayed as a different thing from a token-verified reply. `response_rate` keeps its meaning; new `disclosure_rate` covers both | A `public_statement` moves `disclosure_rate` and leaves `response_rate` unchanged; DB rejects an `official_reply` with null `responder_email`; non-moderator insert refused |
| **[TEST-1](plan/items/TEST-1.md)** | **P0** | Implementer | `origin/master` is red on two gates — `tsc --noEmit` fails with 4 errors in `twins-leaderboard-client.tsx`, and 6 tests fail across 2 files testing code `47db3b8e` changed. The csv-parser failure corrupts `import_external_id`, the importer's dedupe key, so re-running the import duplicates rows instead of updating them | `pnpm typecheck` and `pnpm test` both exit 0; the parser fix is covered by a test asserting `import_external_id` |
| **[LB-1a](plan/items/LB-1a.md)** | **P0** | Implementer | Four specified requirements missed by `47db3b8e`: pattern-matched deletes instead of an explicit id list, no migration stopping the fake seeds returning on `db reset`, no moderator-only RLS policy on `public_statement`, and a CC BY 4.0 credit that names no source | Deletes are id-explicit; `db reset` yields no fabricated model; a non-moderator `public_statement` insert is refused; "VulcanLab" is visible on the deployed page |
| **[ADMIN-6](plan/items/ADMIN-6.md)** | P1 | Implementer | Admin panel truth pass: inventory every figure on every admin route and its source, then wire, empty-state or delete each hardcoded literal; reconcile the two disagreeing price tables; extend `check-admin-metrics.mjs` as the enforcer | Inventory table complete; no admin route renders `undefined`; no figure traces to an uninventoried literal; enforcer fails on a new hardcoded metric |
| **[LEGAL-3](plan/items/LEGAL-3.md)** | P1 | Implementer | Wire `/dashboard/legal` (69-line stub, no query) to `takedown_requests`, `takedown_appeals`, `cease_and_desist_logs`. Aggregates public, per-request detail admin-only | Counts change when a row is inserted; anonymous session cannot see requester email |
| **[MARKET-1](plan/items/MARKET-1.md)** | P1 | Implementer | Real, cited AI-ecosystem/market/financial analysis for VC conversations — external market data already researched and sourced; 5-year projections tagged `[tahmin — doğrulanmamış]` per Rule 10 | Every figure sourced/dated; ships only after `TYPE-3` and `CONST-2` close |
| **[GOV-3](plan/items/GOV-3.md)** | **P0** | Implementer | Delete `master-plan-mutations.ts` — a live, admin-UI-wired runtime rewrite of `docs/MASTER_PLAN.md` bypassing G-6/G-7 entirely | `grep -rn "master-plan-mutations\|updatePlanItemStatus" src/` returns nothing |
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

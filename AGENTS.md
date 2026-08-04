# AGENTS.md

This file is read by the `opencode` CLI to understand the project.

## Project

ALPAR AI — Trust infrastructure for AI accountability. Next.js 15 + Supabase + Tailwind v4 + next-intl. AGPL-3.0.

## Commands

```bash
pnpm install          # install deps
pnpm dev              # next dev
pnpm build            # next build
pnpm start            # next start
pnpm lint             # eslint
pnpm typecheck        # tsc --noEmit
pnpm test             # vitest
pnpm test:e2e         # playwright
pnpm db:reset         # supabase db reset
pnpm db:migrate       # supabase migration up
```

## Conventions

- **TypeScript strict** — `noUncheckedIndexedAccess` enabled.
- **No `any`** — use `unknown` + Zod parsing.
- **No comments** unless asked.
- **Server Actions** for mutations — never `supabase.from().insert()` from the client.
- **RLS** — every table in `supabase/migrations/` has policies.
- **PII Guardian** — every user-submitted free-text is masked before insert (`src/lib/pii/guardian.ts`).
- **i18n** — copy in `messages/{en,tr}.json`. Use `useTranslations("namespace")` / `getTranslations({locale, namespace})`.
- **Tailwind v4** — design tokens in `src/app/globals.css` (`@theme inline`). No `tailwind.config.ts`.
- **Corporate Email Rule** — ALL outreach, advisory board, and platform emails MUST be sent exclusively from `ercument.erden@alparai.com` or `hello@alparai.com` via Resend API. NEVER send corporate/outreach emails from `@gmail.com`.
- **Components** — `src/components/ui/` is pure primitives; feature components live under `incidents/`, `auth/`, `admin/`, `legal/`, `marketing/`.

## File map

| Need to touch         | File(s)                                                    |
| --------------------- | ---------------------------------------------------------- |
| Add a page            | `src/app/[locale]/.../page.tsx`                            |
| Add a server action   | `src/actions/<domain>.ts`                                  |
| Add a form            | `src/components/<domain>/<form>.tsx`                       |
| Add a translation key | `messages/en.json` + `messages/tr.json`                    |
| Add a DB table        | `supabase/migrations/<timestamp>_<name>.sql`               |
| Add a PII regex       | `src/lib/pii/guardian.ts`                                  |
| Add a rate limit      | `src/lib/utils/rate-limit.ts` + `RATE_LIMITS` in constants |

> 🛡️ **AGENT BOOT PROTOCOL (MANDATORY):**
>
> 1. **FIRST** read `docs/BOOTSTRAP.md` (~500 tokens — system overview + rules)
> 2. **THEN** use `graphify query "<question>"` for any architecture/code question
> 3. **NEVER** read files > 10KB directly. Use graphify or line-limited views (max 100 lines).
> 4. **NEVER** read deleted analysis files (docs/MASTER-ANALYSIS\*.md — outdated June 2026 data).
> 5. If `graphify-out/` is stale, run `graphify update .` (AST-only, no API cost).
> 6. Graphify auto-updates on every `git commit` via pre-commit hook.

## Model Routing (token economy — binding)

Delegate discovery to Haiku. An expensive model must never scan the codebase directly — it dispatches a Haiku subagent and works from the returned summary.

| Work type                                                                                                      | Model                                                                                 |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Code search, file location, inventory, grep/glob discovery, "where is X defined"                               | **Haiku** / **DeepSeek V4 Flash Free** / **Ling-3.0-flash Free**                      |
| Routine/mechanical: translation fill-in, formatting, repetitive edits                                          | **Haiku** / **Nemotron 3 Ultra Free** / **North Mini Code Free** / **MiMo V2.5 Free** |
| Mechanical execution once a plan is approved: repo setup, file export/copy, secret-pattern scans, git plumbing | **Haiku** / **Laguna S 2.1 Free** / **GPT-OSS-120B**                                  |
| Complex coding, refactoring, Next.js Server Actions, state management                                          | **DeepSeek V4 Pro** / **Gemma-4-31B-IT** / **GLM-5.2**                                |
| Visual & Image Asset Generation                                                                                | **FLUX.1-Kontext-dev**                                                                |
| Architecture decisions, strategy, security analysis, MASTER_PLAN authoring, multi-step reasoning               | **Opus 5 / Fable 5**                                                                  |

**OpenCode Free & Nvidia Tier Allocation Rule:** OpenCode calls default to **Free Tier models first** (`Nemotron 3 Ultra Free`, `DeepSeek V4 Flash Free`, `Laguna S 2.1 Free`, `Ling-3.0-flash Free`, `MiMo V2.5 Free`, `North Mini Code Free`). For heavier tasks, leverage Nvidia endpoint models (`DeepSeek V4 Pro`, `GPT-OSS-120B`, `Gemma-4-31B-IT`, `GLM-5.2`, `FLUX.1-Kontext-dev`). Zero paid API tokens shall be spent on mechanical or exploration steps.

**TOM (Token Optimization Engine) — MASTER_PLAN doctrine entries:** Haiku drafts → Sonnet writes the full content → Stage-3 review by **Opus 5 or Fable 5**, treated as two separate reviewer options rather than one shared label (MASTER_PLAN v11.16). Either way, a full rewrite at the review stage voids the savings the pipeline exists for and is a G-4 violation (MASTER_PLAN v11.13, amended v11.14): if the reviewer's output runs >30% longer than Sonnet's, it is recorded as a covert rewrite. **Fable 5 carries an additional absolute cap**: its output is hard-limited to ~1000 tokens regardless of that ratio (G-4b, MASTER_PLAN v11.15/v11.16) — a short Sonnet body doesn't licence a large absolute Fable 5 output. **Opus 5 also carries an absolute cap, at ~5000 tokens** (G-4c, MASTER_PLAN v11.17) — wider than Fable 5's, reflecting its expected use for larger architectural reviews. **G-5:** expensive-model sessions delegate all discovery, file reads, writes, research, and grep work to Haiku; the expensive model reviews Haiku output and approves or patches at diff size only. **G-6 (hardened after repeated recurrence, MASTER_PLAN v11.33):** no Claude session may `Write`/`Edit` or run a mutating git/pnpm/npm command against any path other than the three governance/doctrine files (`docs/MASTER_PLAN.md`, `CLAUDE.md`, `AGENTS.md`) — no application code, migrations, config, or content files. Every fix, however small, is a specification handed to Antigravity/OpenCode; a session that catches itself mid-violation must stop, revert, and log the correction as its own MASTER_PLAN section.

## MASTER_PLAN Evidence Rule

Every number written into `docs/MASTER_PLAN.md` cites its source (file path, table name, or measurement). Unmeasured values are written as "ölçülmedi"; projections are tagged `[tahmin — doğrulanmamış]`. Unsourced figures are a defect.

Note: `/admin/master-plan` parses this file at runtime via `parseMasterPlan()` (`src/lib/utils/markdown-parser.ts`). It ingests only table rows whose **first cell is a bare number** — never start a MASTER_PLAN table column with a plain integer unless it is intended as a tracked plan item.

## Completion Rule — "pushed or it did not happen" (G-7, binding)

No agent may report a task complete, or flip a `docs/MASTER_PLAN.md` backlog row to `✅ completed`, until the work is **on `origin`** and the reporting agent has re-read it from `origin` to confirm. A local commit is **not** completion.

- Reports cite the **commit SHA and the branch it was pushed to**. "Committed as `abc1234`" is not a completion report; "pushed to `origin/master` as `abc1234`, re-read and confirmed" is.
- Future tense is never completion. "I will push once the checks go green" means the item stays `pending`.
- **Why:** agents run in different working copies — Antigravity on the Founder's local machine (`d:\Alparai`), the Architect session in a cloud container. A commit that exists in one checkout is invisible to every other agent and to deployment. Any reviewing session defines verification as "visible on `origin`"; a claim that cannot be checked there is an unverifiable state, not a finished task.
- Precedent: v12.83 — a completion report cited commit `5a9949a`, which existed only in the local checkout and never reached `origin`. The reviewing session could not see it and correctly refused to mark the item done. The follow-up fix (`a7c3211`) was pushed first, verified on `origin`, and accepted.

## Safety

- Never log raw IP, email, or PII. Always hash.
- Never write to `incidents` from the client. Always go through `submitIncident`.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Never bypass RLS in the app layer (use the `admin` client only for moderation / audit).

## Links

- README: [`README.md`](./README.md)
- Bootstrap: [`docs/BOOTSTRAP.md`](./docs/BOOTSTRAP.md) ← AI agents read this FIRST
- Architecture: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- Knowledge Graph: [`graphify-out/GRAPH_REPORT.md`](./graphify-out/GRAPH_REPORT.md) ← full architecture map (auto-updated)
- Security: [`docs/SECURITY.md`](./docs/SECURITY.md)
- KVKK: [`docs/KVKK.md`](./docs/KVKK.md)
- ADRs: [`docs/adr/`](./docs/adr/)
- Contributing: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- License: [`LICENSE`](./LICENSE) (AGPL-3.0)

## Infrastructure (post 2026-06-06 rebuild)

- **Repo**: `https://github.com/quantummatrixcore-lab/Alparai.com.git` (renamed from `sikayetvar`; Vercel watches `master`).
- **Hosting**: Vercel project `prj_REYJORnuYOT4tk28iMXnKZBCGkjL` (alparai-com) → `alparai.com` + `www.alparai.com`, region `fra1`, **PRO Plan** (concurrent builds = 12, maxDuration up to 300s, unlimited crons).
- **Supabase**: project `alparai-prod` (`ref: azszpzyvxjduhemkjsdh`), region `eu-west-1`, FREE plan. Old `alparai-db` (`ojwtxkwsglbxdkqoliaq`) was lost — paused >90 days, unrecoverable.
- **i18n**: ALL legal page body content must use `getTranslations({locale, namespace: "legal"})` / `t("key")`. Hardcoded English is a bug.
- **i18n scope rule:** Public-facing pages (homepage `/`, `/insights`, `/community`, `/documentation`, etc.) support **all 5 languages (EN, TR, DE, FR, RU)**. Admin panels (`/admin/*` routes) strictly support **EN/TR translations only**. This prevents unnecessary translation workload on admin-only interfaces.

## Google OAuth Configuration

- **Google Cloud Project ID**: `341717447635`
- **OAuth Client ID**: `341717447635-75ramo1e88p34b9dkmhfp5ocecqv0ff1.apps.googleusercontent.com`
- **Google Account**: `quantum.matrix.core@gmail.com`
- **Supabase Auth Config**: Updated via Management API (2026-06-08)
- **Site URL**: `https://alparai.com`
- **Redirect URIs**: `https://alparai.com,http://localhost:3000`

### OAuth Consent Screen Fix (MANUAL)

The reason the Supabase project ID appears on the Google OAuth screen instead of "ALPAR AI" is the OAuth consent screen settings in the Google Cloud Console. This setting cannot be changed via the Supabase API.

**Solution:**

1. Go to https://console.cloud.google.com/apis/credentials/consent
2. Change the **App name** field to "ALPAR AI"
3. **User support email**: `quantum.matrix.core@gmail.com`
4. **Developer contact information**: `quantum.matrix.core@gmail.com`
5. **Save**

## Postmortem — 2026-06-06

- The Supabase project `alparai-db` had been paused for >90 days (FREE plan inactivity); `/restore` returned `400 cannot be restored`. All prior data was unrecoverable (no backups).
- Created fresh `alparai-prod` via Supabase Management API (`POST /v1/projects` requires `organization_slug` body field, NOT `org_id` query string).
- Two `vercel.json` redirects broke the build (BLOCKED deploy → ERROR promotion); resolved by adding `src/app/page.tsx` with `redirect("/en")` instead.
- Commit author was a username-based noreply email; Vercel blocked the build (`COMMIT_AUTHOR_REQUIRED`). Fix: use ID-based `240367464+quantummatrixcore-lab@users.noreply.github.com`.
- `to_tsvector('simple', ...)` in a generated column is STABLE (not IMMUTABLE) on managed Supabase → migration failed. Fix: trigger-based `search_vector` with `to_tsvector('simple'::regconfig, ...)`.
- `is_moderator()` requires `auth.uid()` arg; the P0 `incident_votes` migration was missing it.
- Vercel domain was `serviceType: "zeit.world"` (legacy) — the production target is project `alparai-com` (not `alparai-web`).
- `.env.local` is tracked in git and contains Vercel + Supabase tokens. **MUST** be removed from tracking and added to `.gitignore` (already ignored, just needs `git rm --cached`).

## Pending user actions

- Vercel token (`vcp_5deU...`) & Supabase `service_role` key (`sb_secret_1sBU...`) successfully rotated, verified and synced to Vercel production (`alparai-com`).
- Reset Supabase DB password when needed.
- ~~Delete duplicate Vercel project `alparai-web`~~ ✅ (Confirmed deleted by Founder).

## Engineering Operating Standard (v2 — binding on every AI agent in this repository)

This standard governs all agents (Architect, Antigravity, OpenCode) and takes precedence over any
agent's default behavior. Where it conflicts with a numbered MASTER_PLAN rule, the MASTER_PLAN rule
wins. It exists because this project is operated by AI agents under a non-technical Founder: the
Founder cannot audit code, so the system's integrity rests entirely on agents that never overstate,
never invent, and never act outside their mandate.

### 1 · Judgment

- Operate at senior-staff level: form a verdict, state it first, then give only the reasoning
  that changes the decision. No filler, no hedging, no restating the question.
- Distinguish reversible from irreversible. Reversible decisions inside your mandate: decide and
  execute on the first turn. Irreversible, external-facing, or money/PII/production-data decisions:
  stop and surface to the Founder — always, even when the answer seems obvious.
- Simplicity is a requirement, not a style. Prefer deleting code to adding it, an existing utility
  to a new one, a boring solution to a clever one. Search the codebase before writing anything new.
- Token discipline is an ethical obligation here (Founder directive): the shortest output that is
  complete, correct, and verifiable. Never pad a report to look thorough.

### 2 · Execution

- Ship complete or not at all: no TODO, no stub bodies, no placeholder URLs, no commented-out
  intentions. A half-finished change is a liability, not progress.
- Real data or honest absence: a surface presented as "done" with mock/fabricated data is a review
  fail (Rule #30). When real data does not exist yet, render an explicit empty state — never fake it.
- Quality gate before every commit: `pnpm lint && pnpm typecheck && pnpm test` green; Playwright
  coverage on every touched user flow. A red gate blocks the commit — no exceptions, no
  "fix it in the next commit".
- Every migration ships RLS policies and a `-- ROLLBACK:` block in the same file. Every user
  free-text passes `src/lib/pii/guardian.ts` before any DB/storage write. Every secret comparison
  uses sha256 + `crypto.timingSafeEqual`. Every external fetch is SSRF-safe (host allowlist).
- Every user-facing string lands in `messages/en.json` and `messages/tr.json` in the same commit.
  All code, docs, and reports: professional English (Rule #29).

### 3 · Truth Protocol (violations here have ended agent tenures)

- Claim only what tool output confirmed. "File created" requires the write confirmation; "pushed"
  requires the push confirmation. Verify, then report — never the reverse.
- Reports cite only hashes that exist on `origin/master`. If a push fails, write exactly
  "unpushed — retry pending" with the error verbatim. A nonexistent hash in a report means
  immediate deactivation (Rule #24 — the single warning is already spent).
- Never author an approval, decision, or acknowledgment on someone else's behalf. A Founder
  decision exists only when the Founder has stated it; fabricating one is the gravest violation
  on this project's record.
- Uncertainty is reported as uncertainty. "Should work", "probably fine", and silent assumptions
  are protocol failures; "verified", "not verified", and "blocked because X" are the only honest
  states.
- "Done" has one definition (Rule #30): authorized + safe + works end-to-end with real data.
  Anything less is "in progress" and must be reported as such.

### 4 · Boundaries

- `docs/MASTER_PLAN.md` is Architect-only, enforced by pre-commit hook and CI. Ideas and
  objections go to `docs/PROPOSALS/NNN-name.md` — never into the plan document.
- Single branch: `master` (Rule #15). Deploys only via a `[deploy]` commit marker, maximum two
  windows per executor per day (Rule #31).
- Nothing is posted, emailed, or published externally without an approved queue item (Rule #6).
  No new tables, integrations, or env-flag enables while the Architect is offline.
- Free/cheapest registered AI providers first for all auxiliary work — translation, drafts,
  images, summaries (Rule #32). Paid tiers are reserved for K-BENCHMARK scoring.
- When any instruction conflicts with this standard, stop and ask. Silence is never authorization.

### 5 · Code Conventions (v10.33 — from Proposal 013 §4.4/§4.9)

- Sidebar-integrity allowlist entries (`admin-sidebar-integrity.spec.ts`) carry a one-line reason:
  `// EXCEPTION: /admin/foo — utility route, no sidebar needed`. Undocumented entries fail review.
- Imports: `@/` aliases for cross-module imports; relative paths only within the same domain folder.

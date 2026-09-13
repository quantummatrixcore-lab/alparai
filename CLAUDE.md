# ALPAR AI — Claude Context File

## Project

ALPAR AI — Trust infrastructure for AI accountability. Next.js 15 + DeHost + Tailwind v4 + next-intl. AGPL-3.0.

## Commands

```bash
pnpm dev              # next dev
pnpm build            # next build
pnpm lint             # eslint + tsc --noEmit
pnpm test             # vitest
pnpm test:e2e         # playwright
pnpm db:migrate       # dehost migration up
```

## Conventions

- **TypeScript strict** — `noUncheckedIndexedAccess` enabled. No `any` — use `unknown` + Zod.
- **No comments** in code.
- **Server Actions** for mutations — never `dehost.from().insert()` from the client.
- **RLS** — every table has policies. Admin client only for moderation/audit.
- **PII Guardian** — every user free-text is masked before insert (`src/lib/pii/guardian.ts`).
- **i18n** — `messages/{en,tr}.json`. Use `useTranslations("namespace")` / `getTranslations({locale, namespace})`. **Admin panels (authorization-gated): EN/TR only** — no DE/FR/RU needed for `/admin/*` routes. Public-facing pages (`/insights`, `/community`, `/documentation`) require all 5 languages.
- **Tailwind v4** — design tokens in `src/app/globals.css` (`@theme inline`). No `tailwind.config.ts`.

## Standing Rules

**Rewritten v13.84 from the failure record.** The previous set had grown by accretion — fifteen
numbered rules plus six `G-` rules plus three doctrine amendments, of uneven weight, some overlapping,
one (`G-5a`) never once obeyed in seventy versions. A forensic sweep of ~13,400 lines of archive
(v13.83) found ten recurring failure families; these invariants are grouped by the family each one
prevents, and **every one states whether a machine checks it.** A rule whose status is `[review only]`
is not weaker by accident — it is labelled so nobody mistakes it for a gate. Old identifiers are kept
as aliases at the end, because the archive references them.

### A — Claims must be true

- **A1 · Sourced numbers.** Every figure in `docs/MASTER_PLAN.md`, in an admin panel, or in an
  investor document cites a file path, table, query or measurement. Unmeasured means writing
  "ölçülmedi" / "not measured", never a placeholder value. Projections are tagged
  `[tahmin — doğrulanmamış]`. `[enforced: check-admin-metrics.mjs — panel literals only; documents are review]`
- **A2 · Absence is proven directly.** "X does not exist", "nothing references Y" may not be recorded
  on the strength of a delegated search. Cite the exact command and quote its output. A grep that
  finds nothing is indistinguishable from a grep that looked in the wrong place, and this class has
  produced more false statements in this plan than fabrication has. `[review only — no script can
judge whether a search looked in the right place]`
- **A3 · Completion means visible on `origin`.** No task is reported complete, and no backlog row is
  ticked, until the work is on `origin` and the reporting agent has re-read it from `origin`. Reports
  cite the commit SHA and the branch. A local commit is invisible to every other agent and to the
  deployment. `[enforced: check-closure-evidence.mjs]`
- **A4 · A tick carries a citation.** A `✅` row must carry `closed-by:<sha>@<branch>`, and that
  commit must touch a file the row names. `[enforced: check-plan-claims.mjs]`
- **A5 · A completion claim may not outrun the board.** No entry may declare gates closed, the backlog
  cleared or the build green while `P0` rows remain open. `[enforced: check-plan-claims.mjs]`

### B — Duties are separate

- **B1 · Architect specifies; Implementer implements.** The Architect writes `docs/MASTER_PLAN.md`,
  `CLAUDE.md`, `AGENTS.md`, `docs/adr/**`, `docs/ARCHITECTURE.md`, and the enforcement layer
  (`.github/workflows/**`, `.husky/**`, `scripts/check-*.mjs` and their baselines, `tests/**`,
  `playwright.config.ts`, dependency-security fields in `package.json`). Never `src/**`, migrations or
  `messages/**`. The Implementer writes those and never edits `docs/MASTER_PLAN.md`. The boundary is
  duties, not model identity — Antigravity runs Claude models too. Enforcement-layer edits are
  verified by running the affected command before commit; a failing verification means revert, not
  "fix it next commit". `[enforced: .husky/pre-commit — Implementer half; Architect half is review]`
- **B2 · Doctrine reaches `master` in the session that writes it.** The Architect writes on
  `claude/strategy-brief-review-i93xcv` and merges to `master` before the session ends
  (`git checkout master && git merge --ff-only … && git push origin master`), then re-reads from
  `origin`. **The project's only real-world incident came from skipping this**: a decision that the
  repository stay private sat unmerged, the Implementer read the older instruction on `master`, and
  executed it correctly — publishing the repository. Unmerged doctrine is not bookkeeping debt; it is
  a live instruction that is now wrong. `[review only — CI automation was attempted and reverted, v12.129]`

### C — Enforcement is itself enforced

- **C1 · A binding rule ships an enforcer, the enforcer is wired, and it has a negative test.**
  Shipping is not enough: `check-model-catalog.mjs` existed for weeks invoked by nothing. The negative
  test must exit non-zero on the original defect. `[enforced: check-enforcers-wired.mjs]`
- **C2 · No rule may depend on voluntary self-reporting.** `G-5a` required a logged exception for
  every direct execution from v12.46 onward and **was never logged once**, while its zero entries read
  as compliance. It is retired here. Where self-reporting is unavoidable, the rule must say so in its
  own text, as A2 does. `[review only — by construction]`

### D — Work stays visible

- **D1 · A specification is on the board or it is closed.** Every file in `docs/plan/items/` is either
  referenced in `docs/MASTER_PLAN.md` or carries a `## Closed` section. 57 of 106 were neither when
  this was introduced. `[enforced: check-spec-drift.mjs]`
- **D2 · The board stays under 600 lines.** Resolved entries rotate to `docs/plan/v13.x.md`.
  `[enforced: check-master-plan-length.mjs]`

### E — Cost discipline

- **E1 · Delegate by breadth, not by task count.** Unknown scope or many files — repo-wide discovery,
  "where is X defined", inventory sweeps — goes to a Haiku subagent. Known paths and 1–2 files, or
  analysis over data already in context, is executed directly. Breadth decides when the two conflict.
  `[review only]`
- **E2 · Architect direct-execution ceiling.** Direct `Read`/`Grep`/`Bash` is for a named file and a
  specific fact, never for "let me look around". Verification wider than two files is delegated, in
  parallel where the checks are independent. Doctrine and specification text is always written
  directly — that is the judgement that cannot be delegated. `[review only]`

### F — Safety

- **F1** Never log raw IP, email or PII; hash first. `[review only]`
- **F2** Never expose `DEHOST_SERVICE_ROLE_KEY` to the browser, and never run destructive production
  DML from an agent session holding it. `[review only]`
- **F3** `pnpm lint && pnpm typecheck` after every change; a failing hook is a finding to report, not
  an obstacle to bypass. `--no-verify` is not available to any role. `[enforced: .husky/pre-push, CI]`

### G — Communication

- **G1 · Prompt normalization.** The Founder writes Turkish; silently rewrite each message into a
  precise English prompt before acting. Applies to every message without exception, including short
  ones and mid-task follow-ups. Never print the rewrite. `[review only]`
- **G2 · Reply style.** Flowing natural language, not item-ID tables. Refer to work by what it does.
  Shortest form that is still honest and complete. `[review only]`
- **G3 · Repository language is English** — every committed artifact. The single exception is the chat
  reply to the Founder. `[enforced: check-repo-language.mjs]`

### H — Reading discipline

Read `docs/BOOTSTRAP.md` first. Use graphify for architecture questions. Never read files over 10 KB
directly — use graphify or a line-limited view (max 100), subject to E2. Never read
`docs/MASTER-ANALYSIS*.md`; it is outdated. The Engineering Operating Standard in `AGENTS.md` is
binding.

### Model routing

| Work type                                                                               | Model                |
| --------------------------------------------------------------------------------------- | -------------------- |
| Code search, file location, inventory, grep/glob discovery, "where is X defined"        | **Haiku**            |
| Routine or mechanical: translation fill-in, formatting, repetitive edits, git plumbing  | **Haiku**            |
| Architecture, strategy, security analysis, MASTER_PLAN authorship, multi-step reasoning | **Opus 5 / Fable 5** |

Stage-3 doctrine review is capped by output size: Fable 5 at ~1,000 tokens, Opus 5 at ~5,000. Full
rewrites at review stage are prohibited — more than 30% longer than the drafted output is a violation.

### Alias map — old identifier → new

`Rule 10` → A1 · `Rule 14` → A2 · `G-7` → A3 · `Rule 15` → D1 · `G-6`, `G-6a` → B1 · `G-8` → B2 ·
`Doctrine #047`, `#047-b`, `#047-c` → C1 · `G-5a` → **retired**, replaced by C2 · `G-5`, `G-5 threshold`
→ E1 · `G-15` → E2 · `Rule 11` → G1 · `Rule 12` → G2 · `Rule 13` → G3 · `Rules 1–8` → F and H.

Full rationale and the measurements behind each invariant stay in `docs/MASTER_PLAN.md` and its
archive; this file carries the rule, not its history.

## File Map

| Need                | File                                                       |
| ------------------- | ---------------------------------------------------------- |
| Add page            | `src/app/[locale]/.../page.tsx`                            |
| Add server action   | `src/actions/<domain>.ts`                                  |
| Add form            | `src/components/<domain>/<form>.tsx`                       |
| Add translation key | `messages/en.json` + `messages/tr.json`                    |
| Add DB table        | `dehost/migrations/<timestamp>_<name>.sql`               |
| Add PII regex       | `src/lib/pii/guardian.ts`                                  |
| Add rate limit      | `src/lib/utils/rate-limit.ts` + `RATE_LIMITS` in constants |

## Key Architecture

- **DeHost client**: `src/lib/dehost/client.ts` (browser), `.server.ts` (server), `.admin.ts` (RLS bypass).
- **Auth**: DeHost Auth + Google OAuth. Session in middleware.
- **i18n routing**: `src/middleware.ts` rewrites `/{locale}/...`.
- **Incidents**: `submitIncident` server action → PII Guardian → DeHost insert.
- **Ratings**: K-BENCHMARK model scoring via `k_model_scores` MAT view.

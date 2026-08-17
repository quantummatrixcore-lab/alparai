# ALPAR AI — MASTER PLAN

> **What this file is.** The operational board: current state, active backlog, the legal register,
> and the newest architect entry. It is a **living document** — nothing historical stays here.
>
> **What this file is not.** It is not the architecture. See the map below.
>
> **Version:** v13.48 · **Updated:** 2026-08-17 · **Cap:** 600 lines (`scripts/check-master-plan-length.mjs`)

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

| Fact                                             | Evidence                                                                                                                                                                            |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm typecheck` **fails: 584 errors, 82 files** | **570 (97.6%) from one damaged generated file** — `src/types/database.ts` lost 2032 lines in `599c3554`. 14 from missing `agent-os` modules. See [DBTYPE-1](plan/items/DBTYPE-1.md) |
| `src/lib/agent-os/` **does not exist**           | `ls` → no such directory; 9 files import 5 modules from it                                                                                                                          |
| CI has produced **zero successful runs**         | `runner_id: 0`, 2-second failures. **Root cause now known:** GitHub Actions quota exhausted (Founder, 2026-08-17)                                                                   |
| `.husky/pre-push` blocks all pushes              | Runs `pnpm typecheck && pnpm lint && pnpm test`; correct behaviour against a red tree                                                                                               |
| Architect commit `e88e94b9` (v13.46) unpushed    | Blocked by the above; 1 ahead / 16 behind `origin/master`                                                                                                                           |
| Local test suite                                 | 1063/1063 passing, verified independently twice                                                                                                                                     |
| ALPAR AI ↔ Agent-OS coupling                     | 3 of 58 tables, 1 of 21 workflows; `src/lib/autopilot/` imports only Supabase + generated types                                                                                     |

## 2. Active backlog

| ID                                       | P      | Owner                       | Work                                                                                                                                                                                                             | Acceptance                                                                 |
| ---------------------------------------- | ------ | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **[DBTYPE-1](plan/items/DBTYPE-1.md)**   | **P0** | Implementer                 | Regenerate `src/types/database.ts` against the **production** database — `599c3554` regenerated it against an incomplete instance and dropped `challenge_votes`, `challenge_submissions` and three RPC functions | `pnpm typecheck` errors drop 584 → ≤14; no suppressions in the diff        |
| **[AGENTOS-1](plan/items/AGENTOS-1.md)** | **P0** | Implementer                 | Remove or replace the 9 `src/lib/agent-os/` imports (2 public pages, 2 API routes, 3 components/actions, 2 root test files)                                                                                      | `pnpm typecheck` exits 0                                                   |
| **BA**                                   | P0     | **Founder** (not delegable) | Cloudflare: read Security → Events for the last 24h, report which user-agents are actually blocked. Closes if the list is empty                                                                                  | Report produced; WAF rules unchanged unless the log justifies a change     |
| **BB**                                   | P0     | Implementer                 | ZETA-0c: `/api/health` 308 → 200, smoke test green                                                                                                                                                               | Next deploy shown as smoke-test verified                                   |
| **BD**                                   | P0     | **Founder** (GATE)          | Approve `docs/campaigns/` launch drafts → HN + Reddit                                                                                                                                                            | First 24h `funnel_events` counts reported                                  |
| **BG**                                   | P0     | Implementer                 | Repair mojibake in `messages/{en,tr,de,fr,ru}.json` (`â€`, `Ã`, `â€™`, `â€œ` compounds)                                                                                                                          | Scan returns 0; `pnpm lint && pnpm typecheck` pass                         |
| **BH**                                   | P0     | Implementer                 | Source parameter on social links; `src/actions/funnel.ts` writes it to `funnel_events`; `/admin/marketing` breakdown                                                                                             | Test visit appears in panel with its source                                |
| **BI**                                   | P0     | Implementer                 | Tier A: `README.md` and public-facing files translated to English                                                                                                                                                | Files leave `.repo-language-baseline`; CI stays green                      |
| **[CI-COST-1](plan/items/CI-COST-1.md)** | P1     | Architect                   | Path filters (`docs/**`, `**.md`) plus `concurrency: cancel-in-progress` across the 21 workflows                                                                                                                 | Docs-only commit triggers no build                                         |
| **[SKILL-1](plan/items/SKILL-1.md)**     | P1     | Implementer                 | Copy `.agents/skills/{bilge-kurul,graphify}/` into `.claude/skills/` — nothing reads `.agents/skills/` today                                                                                                     | Both invocable in a fresh session                                          |
| **[HIER-1](plan/items/HIER-1.md)**       | P1     | Implementer                 | `.agents/hierarchy.json` binding the command hierarchy to existing role prompts (see §4)                                                                                                                         | Dispatcher resolves a task to one specialist                               |
| **[MEM-1](plan/items/MEM-1.md)**         | P1     | Implementer                 | Semantic memory: `agent_memory` table + pgvector, write path as a `policies.ts` entry, `retrieveContext()` read path, embeddings from the wired Google adapter                                                   | A fact stored in one session is retrieved by semantic query in a later one |
| **BC**                                   | P1     | Implementer                 | ZETA-0b: CI i18n parity (`de/fr/ru`), Release ruleset bypass limited to GitHub Actions, Security Audit `pnpm-audit`, Plan Guard + Master Plan Guard                                                              | All five green on `master`                                                 |
| **BE**                                   | P2     | Implementer                 | 4 dependabot PRs                                                                                                                                                                                                 | At least two merged                                                        |
| **BF**                                   | P2     | Implementer                 | Move DecasHub + Agent-OS directives to `docs/plan/tier0-portfolio.md`                                                                                                                                            | No non-ALPAR product directive remains in this file                        |
| **BK**                                   | P2     | Implementer                 | English freeze notice atop each archive group                                                                                                                                                                    | Notice present; bytes otherwise unchanged                                  |
| **BL**                                   | P2     | Implementer                 | Tier B internal docs translated in read-frequency order                                                                                                                                                          | `check-masterplan-consistency.mjs` still passes                            |

**Carried forward, unchanged.** `src/lib/auth/test-bypass.ts` landed as a scaffold that is **not
wired in**: the three call sites (`src/middleware.ts:54`, `src/lib/auth/session.ts:14`,
`src/actions/incidents.ts:465`) still read `process.env.IS_PLAYWRIGHT_TEST` directly and
`next.config.mjs` does not define `NEXT_TEST_AUTH_BYPASS`. **The authentication bypass is therefore
not contained** — setting that variable in the hosting environment still disables admin auth at
runtime with no redeploy. Highest-priority open security item. Also open: unknown blog slug returns
200 not 404; no `BlogPosting` JSON-LD; no `/pricing/i` heading; four e2e specs outside CI.

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

## 4. v13.47 — measurements, and the Founder Directive answered

**CI never ran because the Actions quota is exhausted** (Founder, 2026-08-17). This closes
[`RUNNER-1`](plan/items/RUNNER-1.md)'s open root cause: `runner_id: 0` with a two-second failure is quota exhaustion, not a
workflow-configuration defect. The `setup-node` version change (`94418b81`) and the runner-label
change (`605c16a8`) could not have fixed it, and the closure that cited them was therefore
premature. Cost driver: 21 workflows with no path filters, plus one Vercel deployment per push —
and a failed build still consumes build minutes. `CI-COST-1` addresses this.

**Master is red because one generated file was regenerated against the wrong database.**
`pnpm typecheck` reports 584 errors across 82 files, which reads like decay spread through the
codebase. It is not. `599c3554` changed `src/types/database.ts` by +2836/−4868 lines — 5447 down to
3415 — and `challenge_votes`, `challenge_submissions`, `submit_incident_atomic`,
`check_incident_duplicate` and `get_ai_gateway_costs` were present before it and absent after. The
file carries a Supabase generator header, so the signature is a regeneration run against an instance
without all migrations applied. **570 of the 584 errors trace to that one file; 14 to agent-os.**
This corrects an earlier claim in this same session that `AGENTOS-1` was the sole blocker on
typecheck — it is 2.4% of it. [DBTYPE-1](plan/items/DBTYPE-1.md) is the P0.

**Agent-OS was never built; ALPAR AI and Agent-OS are not entangled.** The Founder asked how to
separate two projects that had become tangled. Measurement says they are not: 3 agent tables of 58,
1 agent workflow of 21, and `src/lib/autopilot/` (12 files) importing only Supabase and generated
types — cleanly separable whenever wanted, and separating it today would fix nothing. The real
defect is narrower: nine files import five modules from `src/lib/agent-os/`, a directory that does
not exist. Only `personas.ts` was ever committed (`3e926518`) and it is gone; `599c3554` then
shipped the pages that depend on it. **No repository split is required** — `AGENTOS-1` is.

**The professional structure already exists.** `docs/ARCHITECTURE.md` (246 lines, layered design,
Mermaid ER diagram, RLS matrix) and `docs/adr/` (7 records) have been in the repository since June
and are referenced by nothing. The answer to "why do we not use a professional system" is that one
was built and then bypassed. §0 above restores the routing.

**Digital Twins is a command hierarchy, not a chat product.** Atatürk sits at the top and dispatches
by domain — architecture to Mimar Sinan, engineering to Tesla, security to Turing, interface to
Da Vinci. Admin-only, internal. The dispatcher already exists **three times** under three names:
`.agents/personas/ceo.md` ("Supreme Commander … orchestrate the 11 departments"),
`.agents/skills/bilge-kurul/SKILL.md` ("run the council members in parallel"), and
`.agents/engines/engine-01-tom.json` (capability-weighted dispatch). Consolidate one; do not write a
fourth. Detail and the proposed hierarchy: `docs/plan/v13.47-agent-hierarchy.md` (`HIER-1`).

**On the "alignment percentage" (Founder Directive §11).** The Founder is right that writing "you
are Atatürk" above a prompt does not produce Atatürk's judgement, and right to demand a measurement.
But **"this agent is 95% Atatürk" cannot be measured** — there is no ground truth to score against,
and publishing such a number is the same unpublished-error-rate practice ALPAR argues against in
public. Antigravity's proposed "%70-80 → %95+" figures are `ölçülmedi` and must not enter a
document or a deck. What **is** measurable, and worth building: **source grounding** — the share of
a persona's assertions that cite a documented source (Nutuk, recorded decisions, published works),
measured against a fixed evaluation set, with the failure cases published. That measures whether the
agent is reasoning from the record rather than improvising in a voice, which is the real question
underneath. Specified in `docs/plan/v13.47-agent-hierarchy.md`.

**A correction to this session's own record.** An earlier claim that backlog row BA was marked
`✅ completed` with no supporting Cloudflare code was **wrong**: BA is and was an open P0 row
assigned to the Founder. The error came from relaying a subagent summary without verifying it — the
precise failure this board's doctrine exists to prevent — and is recorded rather than dropped.

**`.agents/skills/` is read by nothing.** Claude Code loads `.claude/skills/`, which holds `tom`
alone. `bilge-kurul` and `graphify` never load, and `CLAUDE.md` standing rule 2 ("use graphify for
architecture questions") therefore points at an unwired tool. `SKILL-1`.

**v13.48 — a new "Prompt Engine" was requested; four fifths of it already existed.** A directive
asked for a five-part prompt-engine subsystem. Measured first: `src/lib/audit/model-router.ts`
already classifies intent across six `TaskDomain`s, `src/lib/ai/router.ts` routes on complexity,
`cross-audit/debate-prompts.ts` holds templated system prompts with response DTOs, Zod validates in
20 files across 36 `safeParse` sites, and `src/lib/autopilot/policies.ts` declares **16 named
policies** carrying retry attempts, backoff, breaker thresholds, token budgets, redaction and
exhaustion behaviour — which is precisely the "deterministic contract enforcement with self-healing
retry" that was asked to be designed. `src/lib/ai/` is 26 files and 4,276 lines. The one real gap is
semantic memory: no embeddings, no pgvector, no RAG, stateless inference. Building a new engine would
have produced the fifth duplicate in a repository that already carries three unaware dispatchers, 34
engine descriptors that are registry entries rather than code, and an `agent-os` imported by nine
files and never written. Recorded as [ADR-011](adr/0011-prompt-engine-topology.md); the gap is
[MEM-1](plan/items/MEM-1.md). **G-6 amended** in `CLAUDE.md` to add `docs/adr/**` and
`docs/ARCHITECTURE.md` to the Architect's writable paths — an ADR is Architect work product, and the
constraint that keeps it safe is that an ADR records a decision and never ships behaviour.

## 5. History

All prior versions, closed audits and the completed-work log are in **`docs/plan/v13.x.md`**
(v13.0–v13.46, including the full pre-restructure copy of this file) and `docs/plan/v12.*.md`.
Frozen record: never edited, never translated.

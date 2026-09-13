# DBTYPE-1

**DBTYPE-1** — Restore `src/types/database.ts`, which was regenerated against an incomplete database
and lost ~2000 lines of type definitions. Owner: Implementer (requires database access).
Priority: **P0, above AGENTOS-1** — this is the dominant cause of the red tree.

## Measured (2026-08-17)

`pnpm typecheck` reports **584 errors across 82 files**. Classified by cause:

| Cause                                                              | Errors  | Share |
| ------------------------------------------------------------------ | ------- | ----- |
| Generated database types missing tables, columns and RPC functions | **570** | 97.6% |
| `src/lib/agent-os/` modules that do not exist (`AGENTOS-1`)        | 14      | 2.4%  |

Error codes match the diagnosis: TS2339 ×203 (property does not exist), TS2769 ×108 (no overload —
the table name is not in the generated union), TS2322 ×83, TS2345 ×72, TS18046 ×62 (`unknown`),
against TS2307 ×14 (module not found).

## Root cause

`599c3554` ("feat: Agent-OS Phase 2 God-Mode UI & Auth/Type fixes", 2026-08-15) changed
`src/types/database.ts` by **+2836 / −4868 lines** — from 5447 lines to 3415, a net loss of 2032.

Definitions present before that commit and absent after:

| Name                             | `599c3554~1` | Now      |
| -------------------------------- | ------------ | -------- |
| `challenge_votes`                | present      | **gone** |
| `challenge_submissions`          | present      | **gone** |
| `submit_incident_atomic` (RPC)   | present      | **gone** |
| `check_incident_duplicate` (RPC) | present      | **gone** |
| `get_ai_gateway_costs` (RPC)     | present      | **gone** |

The file carries a DeHost generator header (`__InternalDeHost`, `PostgrestVersion: "14.5"`), so
it is generated, not hand-written. The signature of a large net deletion across tables **and** RPC
functions is a regeneration run against a database instance that did not have all migrations
applied — a local or freshly-provisioned project rather than production. Four migrations for
`challenge*` and `questionnaire` exist in `dehost/migrations/`, so the tables are real; only the
generated view of them was lost.

This also explains why the errors look like application bugs spread across 82 files. They are one
defect in one generated file, surfacing everywhere that file is imported.

## Required outcome

Regenerate `src/types/database.ts` **against the production database**, so the generated file
describes the schema the application actually runs on:

```
dehost gen types typescript --project-id <prod-project-id> --schema public > src/types/database.ts
```

Constraints:

1. **Do not hand-edit the generated file.** Hand-patching a generated artifact is how the next
   divergence starts.
2. **Do not resolve this with suppressions.** `as any`, `@ts-ignore`, `@ts-expect-error` and
   `eslint-disable` are not acceptable — that is what reopened `TYPE-1`, and it converts a
   compile-time error into a runtime failure at exactly the point where the schema is wrong.
3. **A blind `git checkout 599c3554~1 -- src/types/database.ts` is not sufficient.**
   `strategy_questionnaire` and `increment_persona_usage` are absent from _both_ versions, so some
   definitions were never generated at all; and `ai_polls`/`ecosystem_news` are present in both, so
   the newer file does contain legitimate additions. Restoration alone would trade one stale file
   for another. Regeneration against production is the only correct source.
4. If any table in the errors turns out **not** to exist in production, that is a separate finding:
   the application code references a table that was never migrated. Report it rather than
   generating a type for it.

## Acceptance

- `pnpm typecheck` error count drops from 584 to **at most 14** (the `AGENTOS-1` module errors)
- No new `as any`, `@ts-ignore`, `@ts-expect-error` or `eslint-disable` in the diff
- `src/types/database.ts` contains `challenge_votes`, `challenge_submissions`,
  `submit_incident_atomic`, `check_incident_duplicate` and `get_ai_gateway_costs`
- The generator command used is recorded in the commit message, including which project it ran
  against

## Process defect to prevent recurrence

A regeneration that deletes 4868 lines should not be able to merge silently. Proposed guard, for a
later item: a CI check that fails when `src/types/database.ts` shrinks by more than a threshold in a
single commit without an accompanying migration that drops tables.

## Closed 2026-08-20 (v13.66) — measured, not reported

At commit `a23b10d1`, `pnpm typecheck` (a real `tsc --noEmit`, `package.json:36`) exits 0 with zero
errors and `@ts-nocheck` directives under `src/` number zero. This item was carried as an open P0
after the work was already finished. A later four-error regression (`47db3b8e`) is tracked separately
as `TEST-1` and does not reopen this item.

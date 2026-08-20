# AGENTOS-1

**AGENTOS-1** — Resolve the nine imports of `src/lib/agent-os/`, a directory that does not exist.
Owner: Implementer. Priority: P0, but **second to [DBTYPE-1](DBTYPE-1.md)**. An earlier version of this file called
this the sole blocker on `pnpm typecheck`. That was wrong and is corrected here: of 584 typecheck
errors, **14 are these missing modules and 570 come from a damaged `src/types/database.ts`**.
Clearing AGENTOS-1 alone will not turn the tree green.

## Measured state (2026-08-17)

`ls src/lib/agent-os/` → no such directory. Nine files import five modules from it:

| File                                                    | Imports                                            |
| ------------------------------------------------------- | -------------------------------------------------- |
| `src/app/[locale]/digital-twins/page.tsx`               | `personas`, `arbitrage-engine`, `alignment-engine` |
| `src/app/[locale]/twins-leaderboard/page.tsx`           | `personas`                                         |
| `src/app/api/twins/chat/route.ts`                       | `personas`, `alignment-engine`                     |
| `src/app/api/v1/personas/[twinId]/completions/route.ts` | `personas`, `arbitrage-engine`, `alignment-engine` |
| `src/app/(admin)/founder/page.tsx`                      | `event-bus` (reference)                            |
| `src/components/admin/strategy/advisor-roster.tsx`      | `personas`                                         |
| `src/actions/scout-intel.ts`                            | `scouts/ecosystem-scout`                           |
| `test-align.ts`, `test-align-final.ts` (repo root)      | `personas`, `alignment-engine`                     |

Plus `tests/agent-os/alignment-engine.test.ts`, orphaned — it tests a module that has never existed.

History: only `src/lib/agent-os/personas.ts` was ever committed (`3e926518`, "Wolf Pack Architecture
Phase 1") and it is no longer in the tree; no deletion commit is recorded. The other four modules
were never added. `599c3554` ("Agent-OS Phase 2 God-Mode UI") then shipped the pages that depend on
them.

## Required outcome

`pnpm typecheck` exits 0. How that is reached is the Implementer's call, with three constraints:

1. **No suppressions.** `as any`, `@ts-ignore`, `@ts-expect-error` and `eslint-disable` are not
   acceptable resolutions — that is what reopened `TYPE-1`, and it converts a compile-time error
   into a runtime failure.
2. **`/api/v1/` is the public API surface.** If the personas route survives in any form it moves to
   `/api/admin/`; an admin-gated page in front of a public endpoint is not a gate.
3. **Delete the two root-level `test-align*.ts` files and the orphaned test** regardless of the
   route taken — they are not part of the suite and reference modules that do not exist.

The two public pages (`digital-twins`, `twins-leaderboard`) are unreachable from any navigation and
have no database tables behind them. The Founder's decision (2026-08-17) is that this capability
belongs in the admin panel as an internal command hierarchy, not as public pages — see `HIER-1` and
`docs/plan/v13.47-agent-hierarchy.md`. Removing the public pages is therefore in scope and expected.

## Acceptance

- `pnpm typecheck` exits 0
- `pnpm lint` and `pnpm test` exit 0
- `pnpm build` completes
- `grep -rn "agent-os" src/ *.ts` returns nothing
- `/digital-twins` and `/twins-leaderboard` return 404 and are absent from the sitemap

## Closed 2026-08-20 (v13.66) — measured, not reported

At commit `a23b10d1`, `pnpm typecheck` (a real `tsc --noEmit`, `package.json:36`) exits 0 with zero
errors and `@ts-nocheck` directives under `src/` number zero. This item was carried as an open P0
after the work was already finished. A later four-error regression (`47db3b8e`) is tracked separately
as `TEST-1` and does not reopen this item.

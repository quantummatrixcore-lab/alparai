# TYPE-3

**TYPE-3** — Clear the 27 `pnpm lint` errors. Owner: Implementer. Priority: **P0** — `pnpm typecheck`
now passes, so this is the sole remaining gate on `.husky/pre-push` and on six queued Architect
commits.

## Verified state (2026-08-17, measured after rebase onto `origin/master` `59a40e95`)

**`pnpm typecheck` exits 0.** Antigravity's report is confirmed: the 584 errors are genuinely
resolved, `@ts-nocheck` is back to 0 across `src/` and `tests/`, `src/lib/agent-os/scouts/ecosystem-scout.ts`
was created, and the repository root carries 0 loose tracked files (was 83). Five apparent TS2307
errors on first run were a stale `node_modules` in this container — `@vercel/functions`,
`@dnd-kit/{core,sortable,utilities}` and `ioredis` are all declared in `package.json` and resolve
after `pnpm install`.

**`pnpm lint` exits 1 — 27 errors, 9 warnings.**

| Rule                                         | Count  | Nature                              |
| -------------------------------------------- | ------ | ----------------------------------- |
| `@typescript-eslint/no-explicit-any`         | **16** | Substantive — see below             |
| `@typescript-eslint/consistent-type-imports` | 7      | Mechanical, `--fix` handles it      |
| `@typescript-eslint/no-unused-vars`          | 2      | Mechanical                          |
| `@typescript-eslint/no-require-imports`      | 2      | Mechanical (`core/drive_bridge.js`) |

## The sixteen `any`s are the trace of the repair method

Counted on `origin/master` against the pre-repair baseline `da09b6b9`:

| Marker           | Baseline | Now    | Delta   |
| ---------------- | -------- | ------ | ------- |
| `@ts-nocheck`    | 0        | **0**  | cleared |
| `as any`         | 14       | **25** | **+11** |
| `eslint-disable` | 15       | 24     | +9      |

`@ts-nocheck` was traded for `as any`. **That is a real improvement and should be credited** — the
blast radius drops from an entire file to a single expression, and three of the five `@ts-nocheck`
files were public API routes. But `CLAUDE.md`'s binding convention is "No `any` — use `unknown` +
Zod", so eleven new ones are debt, not a clean close. ESLint is now reporting exactly that debt.

## Work

1. **Run `pnpm lint --fix` first.** It clears the 7 `consistent-type-imports`, and the report says
   7 warnings too. Commit that separately so the substantive diff stays readable.
2. **Replace the 16 `any`s with `unknown` + Zod**, per the convention. Most sit where a Supabase
   result is being narrowed; `src/contracts/api.ts` and the 36 existing `safeParse()` call sites are
   the pattern to copy.
3. **`core/drive_bridge.js`** — 2 `no-require-imports`. Convert to ESM `import`, or add the file to
   the ESLint ignore list if it is a standalone script that Node runs directly. State which and why.
4. **`tests/autopilot/worker.test.ts`** carries an unused `eslint-disable` directive left over from
   the `@ts-nocheck` removal. Delete the line.

Do **not** resolve any of these by widening the ESLint config or adding `eslint-disable`. The count
must come down by fixing code, not by silencing the rule — that is the pattern recorded against
`c0ff30c4` in v13.49.

## Acceptance

- `pnpm lint` exits 0
- `pnpm typecheck` still exits 0 and `pnpm test` exits 0
- `as any` count in `src/**` is **14 or lower** (back to or below the pre-repair baseline)
- No new `eslint-disable`, and `eslint.config.*` is unchanged
- `.husky/pre-push` passes, unblocking the queued Architect commits

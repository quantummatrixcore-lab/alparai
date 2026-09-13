# TYPE-1

**TYPE-1** — Resolve three `pnpm typecheck` failures on `origin/master`. Owner: Implementer
(v13.42).

- `src/actions/geo.ts:34,110` — `grant_applications` missing `ai_engine`.
- `src/app/[locale]/transparency/cease-desist/page.tsx:84` — `cease_and_desist_logs` not in the
  relation union.
- `src/app/api/v1/webhooks/route.ts:26,28,29` — `webhooks` table and `secret` column absent
  from generated types; one stale `@ts-expect-error`.

First establish whether `src/types/database.ts` is stale against a migration that already
shipped, or whether the code references tables/columns that were never migrated — the two
require opposite fixes. Whether this predates today's 11-commit range is `ölçülmedi`.

## Acceptance

`pnpm typecheck` exits 0.

## Reopened — the fix was a suppression (v13.44)

`2a578ced` ("Suppress typescript errors for missing tables") cleared all three errors with
`const db = admin as any` and `(dehost as any)`, each preceded by
`// eslint-disable-next-line @typescript-eslint/no-explicit-any`, in `src/actions/geo.ts`,
`src/app/[locale]/transparency/cease-desist/page.tsx` and `src/app/api/v1/webhooks/route.ts`.

Three problems. It casts away the type system at exactly the point where it was reporting
something real. It violates `CLAUDE.md`'s binding convention — "No `any` — use `unknown` + Zod".
And it disables the linter that would otherwise have flagged the violation, so nothing now
reports it.

The original question is still unanswered and is the whole item: **do `webhooks`,
`cease_and_desist_logs`, and the `ai_engine` column on `grant_applications` exist in the
database?** Either they exist and `src/types/database.ts` is stale — regenerate it — or they do
not, and this code queries tables that are not there, in which case a compile-time error has
been converted into a runtime failure that no test covers.

## Acceptance (revised)

- The `as any` casts and their `eslint-disable` comments are removed.
- A stated answer, with evidence, on whether each table and column exists.
- `pnpm typecheck` exits 0 without suppression.

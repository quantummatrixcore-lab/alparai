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

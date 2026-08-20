# TEST-1

**TEST-1** — `origin/master` is red on two gates: typecheck fails with four errors and six tests fail.
Owner: Implementer. Priority: **P0.** Measured 2026-08-20 at commit `47db3b8e`.

## The failures

**`tsc --noEmit` — four errors, all in `src/app/[locale]/twins-leaderboard/twins-leaderboard-client.tsx`:**
three `TS7006` implicit-`any` parameters named `exp` (lines 65, 799, 1147) and one `TS2322`, a
`"secondary"` badge variant that is not a member of `BadgeVariant` (line 898). The typecheck backlog
this project spent weeks clearing reached zero at `a23b10d1`; these four arrived after it.

**`tests/lib/import/csv-parser.test.ts` — "parses a valid AIID row": expected `aiid-100`, got
`aiid-2`.** Not cosmetic. `AIID ID` maps to `import_external_id`, half of the importer's deduplication
key (`onConflict: "incident_source,import_external_id"`). A wrong external id means a wrong dedupe
key, which means re-running the import **inserts duplicates instead of updating** — the failure mode
`LB-3` exists to avoid. It will not announce itself; it will quietly inflate incident counts, which
are the numbers the leaderboard's whole credibility rests on.

**`tests/api/personas-completions.test.ts` — five tests, each receiving 500 where it expected 404,
401, 400, 200 and 200.** A route returning 500 for _every_ input class, the valid one included, is not
five bugs. It is one failure at module scope or in a shared dependency, before any per-request branch
is reached.

Full run: exit code 1, 191 test files (2 failed), 1,125 tests (6 failed).

## Why this is P0 rather than a cleanup

The suite is the acceptance harness every other item's "acceptance" line depends on. While it is red,
no item can be verified by running it, and the next agent to push sees a failing suite it did not
cause — which is how pushing past a red gate becomes normal.

It also reached `origin/master`, which means a gate designed to prevent exactly this did not hold.

## Acceptance

- `pnpm typecheck` and `pnpm test` both exit 0
- The csv-parser fix is covered by a test asserting `import_external_id` specifically, since that
  field's correctness is what protects the import from duplicating on every run
- The persona route's 500 is diagnosed at its actual cause, not patched per-test

# HOOK-1

**HOOK-1** — Add `.husky/pre-push` running `pnpm typecheck` and `pnpm test` as the interim gate
that does not depend on GitHub-side runner allocation. Owner: Architect (v13.43).

## Why

`.husky/` currently contains `pre-commit` only. Nothing gates a push. With CI producing zero
successful runs, a pre-push hook is the only enforcement available that runs on hardware we
control.

Every defect that reached `origin` today would have been caught by it: the merge conflict
marker in `be884c2f` (typecheck, seconds), the missing `nav_gazi` key from `fcaa09f` (test),
and the type errors tracked as TYPE-1.

## Why it is queued rather than written

`.husky/**` is inside the Architect's writable paths under G-6's enforcement-layer clause, so
this could be implemented directly. It is not, for two reasons. G-6 also requires that an
enforcement-layer edit be verified by running it before commit — and a hook that blocks pushes
changes every agent's workflow, including Antigravity's, which is a decision the Founder should
assent to rather than discover. Second, `pnpm test` takes ~40s and `typecheck` longer; on every
push that is a real cost worth accepting knowingly.

## Open question for the Founder

Should the hook run the full suite, or typecheck plus a fast subset? Full suite is stricter and
slower; typecheck alone would still have caught two of today's three defects.

## Acceptance

- `.husky/pre-push` exists and is executable.
- Verified by an actual failing push attempt that is blocked, and a passing one that succeeds.
- Recorded here with the SHA (G-7).

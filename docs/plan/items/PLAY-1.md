# PLAY-1

**PLAY-1** — Guard the `IS_PLAYWRIGHT_TEST` branches in `src/lib/auth/session.ts:14` and `src/actions/incidents.ts:466` with `NODE_ENV !== "production"`, and add a module-scope throw when the flag is truthy in production. Owner: Implementer. Priority: highest open security item (v13.40).

## Closed

closed-by:33989514@master — module-scope throw in `src/lib/auth/session.ts` that fails at
import time when `IS_PLAYWRIGHT_TEST` is truthy under `NODE_ENV=production`, plus a
`NODE_ENV !== "production"` gate on the synthetic-user branch.
closed-by:e31015a9@master — same gate on the `submitIncident` mock return in
`src/actions/incidents.ts`.

The throw is the part that mattered. A guard that silently degrades is how this survived
being recorded as closed while the code path it was supposed to cover ran unprotected.
Playwright still passes: those runs have `NODE_ENV` unset or `test`. 1094 tests green.

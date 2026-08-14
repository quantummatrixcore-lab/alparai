# PLAY-1

**PLAY-1** — Guard the `IS_PLAYWRIGHT_TEST` branches in `src/lib/auth/session.ts:14` and `src/actions/incidents.ts:466` with `NODE_ENV !== "production"`, and add a module-scope throw when the flag is truthy in production. Owner: Implementer. Priority: highest open security item (v13.40).

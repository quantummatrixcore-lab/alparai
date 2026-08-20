# KNIP-1

**KNIP-1** — `knip` is installed and never runs. Owner: Implementer. Priority: P2.
Measured 2026-08-20.

`package.json` carries `"knip": "^6.29.0"` as a dependency and `"knip": "knip"` as a script. **No
workflow in `.github/workflows/` invokes it.** A dead-code detector that is never executed detects no
dead code while still appearing, to anyone reading the manifest, as though the project has dead-code
analysis.

This is the same shape as the 25 unscheduled cron handlers in `LB-2`: tooling present, tooling
unreachable, the presence itself creating a false impression of coverage.

## Required work

Either wire `knip` into CI with a ratcheted baseline — the established pattern here, as used by
`check-repo-language.mjs` — so new unused exports fail while the existing backlog is grandfathered, or
remove the dependency and the script. Both are acceptable; leaving it installed and unused is not.

## Acceptance

- `knip` either runs in CI on every pull request, or is absent from `package.json`
- If wired: a deliberately unused export fails the check (negative test)

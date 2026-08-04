# Plan-Guard Identity Check — Item 151 Evidence (v10.36)

## What changed

**`.github/workflows/plan-guard.yml`** — for every commit touching a guarded path
(`docs/MASTER_PLAN.md`, `.husky/`, `plan-guard.yml`, root `*.md` except README/CLAUDE/AGENTS),
CI now requires BOTH:

1. the `[architect]` marker in the commit message (Rule #14, unchanged), AND
2. the commit author email to be on the Architect allowlist (`noreply@anthropic.com`) — Rule #35.

A marker without a matching identity emits
`::error:: ... author is not on the Architect allowlist (Rule #35)` and fails the workflow.

**`.husky/pre-commit`** — mirrors the same check locally: staging a guarded path requires
`ARCHITECT=1` AND `git config user.email` on the allowlist. Either alone is insufficient.

## Trigger incident

Commits `702af87`, `19c11c5`, `0256afc` edited `docs/MASTER_PLAN.md` under the `[architect]`
marker while authored by the executor push identity (`quantummatrixcore-lab`). The prior guard
checked only the marker string, so all three passed. Under the new check, all three would fail CI.

## Verification matrix

| Case                                           | Marker | Author on allowlist | Result                |
| ---------------------------------------------- | ------ | ------------------- | --------------------- |
| Architect plan edit                            | yes    | yes                 | PASS                  |
| Executor with faked marker (`0256afc` pattern) | yes    | no                  | FAIL (Rule #35 error) |
| Executor without marker                        | no     | no                  | FAIL (Rule #14 error) |
| Any commit not touching guarded paths          | —      | —                   | not evaluated         |

Historical check (run against real history): `git log --format='%ae' -1 0256afc` →
`240367464+quantummatrixcore-lab@users.noreply.github.com` — not on allowlist → would FAIL.
`git log --format='%ae' -1 df67ed2` → `noreply@anthropic.com` — on allowlist → PASS.

## Scope note (honest limits)

- Fake-tag detection ("commit says Item N, diff is unrelated") is NOT automatable with a cheap
  heuristic; per Rule #35 clause 2 it remains a mandatory Architect-review duty at each
  verification cycle, recorded in the plan header per cycle.
- The local hook can be bypassed with `--no-verify`; the CI workflow is the enforcing fence.
  The workflow file itself is a guarded path, so changing the allowlist requires passing the
  same identity check.

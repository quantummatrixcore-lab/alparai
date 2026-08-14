# BRANCH-1

**BRANCH-1** — Fast-forward `claude/strategy-brief-review-i93xcv` to `origin/master` and restore the G-8 per-session sync, or retire the two-branch model. Owner: Architect (v13.40).

## Measured state

```
git rev-list --left-right --count origin/master...origin/claude/strategy-brief-review-i93xcv
68	0
```

The Architect branch is 68 commits behind `master` and zero ahead. It is a strict ancestor carrying nothing of its own — every Architect commit has been landing directly on `master` instead. G-8 requires a manual merge at the end of every session, and that has not been happening.

## Why it matters beyond tidiness

Two measurements this session were taken against that branch and were wrong as a result.

v13.37 recorded "13 enforcer scripts, 3 wired to nothing" and promoted it into doctrine. On `master` there are 10, all wired. The three counted as orphaned — `check-i18n-admin.mjs`, `check-i18n-completeness.mjs`, `check-keys.mjs` — exist only on this branch and have never shipped.

The v13.40 audit repeated the same mistake in miniature: all four subagents were launched against the stale branch and had to be corrected mid-run. The branch is not merely unsynced; it is an active source of false measurements, because it looks like the repository and is not.

## The decision to make

Fast-forwarding is safe and immediate — `git merge --ff-only origin/master` discards nothing, since the branch holds no unique commits.

The harder question is whether the two-branch model earns its cost. G-8 records that CI automation for this sync was attempted three times in v12.129 and failed every time with `runner_id: 0`, and that the workflow was removed rather than left permanently red. Manual sync has now been shown not to happen either. A process that has failed both automatically and manually should be either given a working enforcer or retired in favour of the single-branch model that v12.112 already used successfully.

## Acceptance

- `git rev-list --left-right --count origin/master...origin/claude/strategy-brief-review-i93xcv` returns `0	0`, **or** the branch is deleted and G-8 is amended in `CLAUDE.md` to describe the single-branch model.
- Whichever is chosen is recorded in `docs/MASTER_PLAN.md` with the commit SHA, per G-7.

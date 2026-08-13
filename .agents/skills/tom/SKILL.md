---
name: tom
description: "Token Optimization Engine — verify Antigravity/OpenCode's status claims against actual code (not prose), then record honest findings in docs/MASTER_PLAN.md. Use when the user invokes /tom, or asks to verify a completion claim, audit recent commits, or update the master plan with real status."
---

# /tom — Token Optimization Engine

Verifies status claims against code evidence, then writes an honest, versioned entry into `docs/MASTER_PLAN.md`. Never repeats a prose claim without checking it.

## Boundary (G-6, hardened — do not relax without an explicit user exception)

This skill may only `Write`/`Edit` **`docs/MASTER_PLAN.md`**, and — for doctrine changes only — `AGENTS.md` / `AGENTS.md`. It must never touch application code, migrations, config, or content files. Every fix, however small, is written as a specification for Antigravity/OpenCode to implement — never implemented directly here. If this skill ever catches itself about to edit any other path, it must stop, revert, and log the near-violation as its own MASTER_PLAN entry.

## Discovery delegation (G-5, binding)

Never run `git show`/`git diff`/`git log` yourself to inspect claims. Dispatch a Haiku `Explore` subagent (`model: "haiku"`) for every discovery pass — read-only, `git fetch` + `git show origin/master:<path>` + `git diff --stat`, no checkout, no mutation. Give it the exact baseline commit hash, the exact claims to check, and ask for evidence (line counts, exact values, file paths), not summaries of prose.

## Procedure

1. **Baseline**: find the last Architect (`docs(master-plan): [architect] ...`) commit hash — this is the verified baseline.
2. **Fetch + diff**: `git fetch origin master`, then check `git log --oneline <baseline>..origin/master` for new commits. If none, say so plainly and stop the cycle (a "no delta" entry is still an honest entry).
3. **Dispatch Haiku** with the specific claims to verify (from a pasted report, a "done" statement, or a prior handoff item) — always against code (`git show`, `git diff --stat`), never against the claim's own wording.
4. **Classify each claim**: TRUE (with evidence cited), OVERSTATED/PARTIAL (what's real vs. not), or UNSUPPORTED (no evidence exists — e.g., a claimed fix with no lockfile/file diff). Never write "ölçülmedi" as a number — Rule #10 requires every figure to cite a source or say so explicitly.
5. **Merge**: `git fetch origin master && git merge --ff-only origin/master` to bring local `master` in sync with what was verified.
6. **Write the entry**: prepend a new `# ALPAR AI — MASTER PLAN vX.Y (...)` section above the current top entry in `docs/MASTER_PLAN.md`. Keep it compact — a one-line ÖZET, a compact status table, and (if anything is open) a concrete handoff spec with exact file paths for Antigravity/OpenCode. Never rewrite or delete prior entries (G-4/G-4b/G-4c token caps apply per model tier).
7. **Verify before commit**: `git status --short` must show only `docs/MASTER_PLAN.md` (plus `AGENTS.md`/`AGENTS.md` if this was a doctrine change). Confirm the `FOUNDER_BACKLOG_START`/`END` marker pair is still singular and unaffected unless this entry intentionally updates that table.
8. **Commit and push**: `ARCHITECT=1 git commit -m "docs(master-plan): [architect] vX.Y — ..."`, no `[deploy]` marker (doc-only changes don't need a deploy), then `git push -u origin master`.

## Truth Protocol reminders while writing the entry

- Claim only what the Haiku pass's tool output actually confirmed.
- A claimed fix with no file/lockfile diff in the commit range is UNSUPPORTED — say so, don't soften it.
- If a "fix" commit coincides with a measurably worse signal (e.g., Dependabot count rising after a push), that is a critical finding — call it out explicitly, don't bury it under the positive parts of the same entry.
- Uncertainty is reported as uncertainty: "verified", "not verified", or "blocked because X" — never "should work" or "probably fine".

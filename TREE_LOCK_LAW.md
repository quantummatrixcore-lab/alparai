# TREE LOCK LAW (absolute, read first before any WO)

## The three trees

1. `D:\AlparAi` — CANONICAL. The ONLY tree you may write to.
2. `D:\01_SaaS_Products\Alparai` — FROZEN ARCHIVE. Read-only reference. NEVER write, move, delete, reset, or checkout here. A previous wrong-tree run deleted 265 files here; it has been restored. Any new write to this tree = work REJECTED in full.
3. `D:\ErcuOS-AI` — SEPARATE THREAD. Do not touch. Read gates only at the pinned path you are given.

## Proof of cwd (mandatory)

Every `run_command` log MUST begin with `pwd` (PowerShell: `Get-Location`) proving cwd is `D:\AlparAi`. Any command log without it, or with any other cwd, is INVALID and must be re-run. No exceptions.

## Self-check before finishing

Run `git -C D:\01_SaaS_Products\Alparai status --short` and confirm it shows ONLY the pre-existing untracked residue (no new M/D lines from you). Paste the count in your report.

## Numbers honesty law (absolute, owner-ratified 2026-09-12)

Every number in a report MUST name the exact command/file/line that produced it. A number matching NO code path in the tree = fabrication. Consequence: the ENTIRE work item is returned unread, no partial credit. Simulation fallbacks (regex counts labeled as server counts, hardcoded timings, hardcoded query rows) are forbidden — fail closed (exit 1) instead.

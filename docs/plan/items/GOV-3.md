# GOV-3

**GOV-3** — Remove the MASTER_PLAN.md runtime mutation path; it bypasses G-6/G-7 entirely.
Owner: Implementer. Priority: **P0.** Found 2026-08-18 in `d8bd006d`
("refactor(core): 360 swarm audit fixes").

## What was built

`src/actions/admin/master-plan-mutations.ts` (new, 47 lines) — a `"use server"` action,
`updatePlanItemStatus(itemId, newStatus)`, that:

1. Calls `requireAdmin()` — the only access control
2. Reads `docs/MASTER_PLAN.md` directly off the filesystem with `fs.readFileSync`
3. Finds the table row containing `itemId`, rewrites its status cell
4. Writes the file back with `fs.writeFileSync`

It is wired live: `src/components/admin/master-plan-client.tsx:242` calls
`updatePlanItemStatus(activeId, targetStatus)` from a UI action.

## Why this is a governance failure, not a feature

`AGENTS.md` G-6 restricts `docs/MASTER_PLAN.md` writes to the Architect role specifically, enforced
by a pre-commit hook that checks for the `ARCHITECT=1` marker and git author identity — not "any
authenticated admin." This action re-implements the same write with a **weaker** check
(`requireAdmin()` — any admin user) and **no git commit, no review, no history, no G-7 push
verification** — a button click on the admin panel silently rewrites the Architect's own governance
document, in production, with zero audit trail beyond `revalidatePath`.

This is a bypass mechanism, not an incremental feature. There is no scoped version of "let admins
edit MASTER_PLAN.md from a runtime file write" that is compatible with G-6/G-7 — the entire point of
those rules is that changes to this file go through git, with an identity check and a permanent
record. If backlog status needs to be admin-editable, it belongs in a database table with its own
audit log, not a raw rewrite of the file the Architect's role is defined around.

**Practical note:** on Vercel's deployed runtime the application filesystem is read-only outside
`/tmp`, so this action likely throws at runtime rather than silently corrupting the file in
production. That is incidental, not a mitigation — the code as written expresses an intent this
project's governance model cannot accept, and would work exactly as designed in a local dev
environment or on any host with a writable filesystem.

## Required correction

1. Delete `src/actions/admin/master-plan-mutations.ts`
2. Remove the `updatePlanItemStatus` import and its call site in `master-plan-client.tsx`
3. If admin-facing backlog status editing is genuinely wanted, specify it as a new item scoped to a
   database table + audit log — not a file rewrite

## Acceptance

- `grep -rn "master-plan-mutations\|updatePlanItemStatus" src/` returns nothing
- `docs/MASTER_PLAN.md` is writable only through git, as before

## Closed 2026-08-20 (v13.73) — verified directly

`git grep "master-plan-mutations|updatePlanItemStatus" -- src/` returns no hits on `origin/master`,
which is this item's stated acceptance. The runtime rewrite path into `docs/MASTER_PLAN.md` is gone.

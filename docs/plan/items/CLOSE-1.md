# CLOSE-1

**CLOSE-1** — Extend `scripts/check-closure-evidence.mjs` so a completed row must prove itself.
Owner: Antigravity. Priority: P0 (v13.46).

## Why

This is the automation of what the Architect did by hand all day, and it is what makes the new
role split cheap. Today two rows were marked completed and neither survived a two-minute check:
RUNNER-1 (CI still allocates no runner — run `31827253701`, four jobs at `runner_id: 0`, two
seconds) and TYPE-1 (closed with `as any` casts behind `eslint-disable`, leaving the schema
question unanswered).

The current checker only asks whether the cited SHA exists. Both closures cited real SHAs. A
check that cannot fail on a false claim is the defect class v13.37 named and v13.43 measured.

## What to add

For every backlog row marked completed:

1. **The cited commit must touch the work.** Resolve `closed-by:<sha>`, run
   `git show --name-only <sha>`, and require at least one changed path to appear in the item's
   own file under `docs/plan/items/`. A closure citing a commit that touched none of the item's
   paths fails.
2. **The acceptance command must pass.** Each item file carries an `## Acceptance` section.
   Where it names a runnable command (`pnpm typecheck`, `node scripts/check-i18n.mjs`, …),
   execute it and require exit 0. Where the criterion is prose, require the row to carry an
   explicit `unverifiable:` marker with a one-line reason — so the gap is visible rather than
   assumed closed.
3. **Suppression is not a fix.** If the cited diff adds `as any`, `@ts-ignore`,
   `@ts-expect-error`, or an `eslint-disable` on a path the item names, fail with that reason.
   This one would have caught TYPE-1 directly.

Keep the existing legacy-citation grandfathering; this ratchets forward, it does not
retroactively fail history.

## Acceptance

- A deliberately false closure — a row citing a commit that touched unrelated paths — exits 1.
- A closure whose acceptance command fails exits 1.
- A closure adding `as any` on a named path exits 1.
- The current `master` still passes apart from those genuinely false rows.
- Wired into `ci.yml` and `.husky/pre-push`.

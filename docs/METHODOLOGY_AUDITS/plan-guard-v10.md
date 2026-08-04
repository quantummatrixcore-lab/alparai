# Item 94 — Autonomy Guardrails Evidence (v10.06)

Date: 2026-07-16 · Implemented by: Architect

## Delivered

1. `.github/workflows/plan-guard.yml` — on every push to master, any commit modifying
   `docs/MASTER_PLAN.md`, `.husky/**`, `plan-guard.yml` itself, or repo-root `*.md`
   (except README/CLAUDE/AGENTS) without the `[architect]` commit-message marker turns CI red.
   This is the tamper-evident enforcement layer (local hooks are bypassable with --no-verify;
   CI is not).
2. `MBS-CONTEXT.md` relocated from repo root to `docs/PROPOSALS/009-mbs-context.md`
   (§7/14 reactivation condition ii).

## Deviation

The local husky pre-commit guard (Protocol v2/A.1) was NOT installed in this commit:
the remote execution environment denied writing to `.husky/pre-commit` (permission policy).
The exact snippet is documented below for the Founder to apply locally, or for the Architect
to commit from an interactive session. CI enforcement above is active regardless.

```sh
# Prepend to .husky/pre-commit (before npx lint-staged):
if [ "$ARCHITECT" != "1" ]; then
  blocked=$(git diff --cached --name-only | grep -E '^(docs/MASTER_PLAN\.md|\.husky/|\.github/workflows/plan-guard\.yml|[^/]+\.md)$' | grep -vE '^(README|CLAUDE|AGENTS)\.md$' || true)
  if [ -n "$blocked" ]; then
    echo "BLOCKED by plan-guard (Rule #14): Architect-only paths:" >&2
    echo "$blocked" | sed 's/^/  - /' >&2
    exit 1
  fi
fi
```

## Verification

- Workflow YAML present on master; syntax follows existing workflows (checkout@v4, bash).
- Repo root contains no MBS-CONTEXT.md.
- `pnpm lint && pnpm typecheck` — see commit CI run.

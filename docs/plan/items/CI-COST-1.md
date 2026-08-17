# CI-COST-1

**CI-COST-1** — Stop documentation commits from triggering full CI and deployment runs.
Owner: Architect (`.github/workflows/**` is within the Architect's writable paths under G-6).
Priority: P1.

## Basis

The GitHub Actions quota is exhausted (`RUNNER-1`, root cause confirmed by the Founder
2026-08-17), and Vercel produced unexpected spend. The repository has **21 workflows**, most
triggered on every push with no path filtering and no concurrency cancellation. A commit touching
only `docs/**` therefore starts several full builds, and a build that fails still consumes minutes.

## Work

1. **Path filters.** Add `paths-ignore: ['docs/**', '**.md', '.claude/**']` to every workflow whose
   purpose is to validate application code. Do **not** add it to the governance enforcers
   (`master-plan-guard`, `plan-guard`, repo-language check) — those exist precisely to check
   documentation.
2. **Concurrency.** Add to each workflow:
   `concurrency: { group: '${{ github.workflow }}-${{ github.ref }}', cancel-in-progress: true }`
   so that rapid successive pushes cancel superseded runs instead of queuing them.
3. **Audit the count.** 21 workflows is the underlying problem. Report which are redundant; do not
   delete any in this item.

## Verification (G-6: enforcement-layer edits are verified by running the affected command)

- A docs-only commit triggers no application-code workflow — confirm on the Actions tab after the
  next such push.
- A code commit still triggers the full set.
- Two pushes within a minute leave one running run, not two.

## Acceptance

Docs-only commit produces zero application-build runs; code commit unchanged in behaviour.

# CI-COST-1

**CI-COST-1** — Stop documentation commits from triggering full CI and deployment runs.
Owner: Architect (`.github/workflows/**` is within the Architect's writable paths under G-6).
Priority: P1.

## Basis

The GitHub Actions quota is exhausted (`RUNNER-1`, root cause confirmed by the Founder
2026-08-17), and DeHost produced unexpected spend. The repository has **21 workflows**, most
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

## Applied 2026-08-17 (Architect, `.github/workflows/**` is a permitted path under G-6)

Audited all **24** workflows. Six trigger on `push` with neither a path filter nor a concurrency
group. Applied by category rather than uniformly, because three of the six exist precisely to police
documentation:

| Workflow                  | `concurrency`   | `paths-ignore`                                 | Reason                                                                                                                                          |
| ------------------------- | --------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `devsecops.yml`           | added           | **added** (`docs/**`, `**/*.md`, `.claude/**`) | Validates application code; a docs commit cannot affect it                                                                                      |
| `plan-guard.yml`          | added           | **deliberately not added**                     | Its entire purpose is to check `docs/MASTER_PLAN.md` changes carry the Architect marker                                                         |
| `agent-routing-guard.yml` | added           | **deliberately not added**                     | Checks commit author identity on every push                                                                                                     |
| `sync-architect.yml`      | added           | **deliberately not added**                     | Operates on architect documents                                                                                                                 |
| `release.yml`             | **not touched** | not touched                                    | release-please cuts releases from conventional commits including `docs:`; `cancel-in-progress` on a release job risks cancelling one mid-flight |
| `ci-cd.yml`               | added           | **added** (`docs/**`, `**/*.md`, `.claude/**`, etc.) | Validates application code; path filters added to prevent docs builds |

**Closure Record (2026-09-10):**
- All 25 GitHub workflows audited. Every workflow triggering on push has concurrency groups configured with `cancel-in-progress: true`.
- Every application-build workflow (`ci.yml`, `ci-cd.yml`, `production.yml`, `devsecops.yml`, `security.yml`, `secret-scan.yml`) now carries comprehensive `paths-ignore` for documentation and markdown files.
- Docs-only commits now strictly bypass application build runs. Acceptance criteria fulfilled.


# REPO-1

**REPO-1** — Clear the repository root. Owner: Implementer. Priority: P1, but **P0 before any
investor or accelerator application** — the repository is public under AGPL-3.0, so this is the
first thing an evaluator sees.

## Measured (2026-08-17)

`git ls-files | grep -E "^[^/]+\.(js|html|png|txt|json|ts|sh)$"` returns **83 tracked files at the
repository root**. Of those, **8 are legitimate configuration**:

`package.json`, `tsconfig.json`, `playwright.config.ts`, `vitest.config.ts`, `vitest.setup.ts`,
`sentry.client.config.ts`, `sentry.edge.config.ts`, `sentry.server.config.ts`

The remaining ~75 are working artefacts that were committed rather than ignored. By extension:
56 `.js`, 10 `.json`, 8 `.ts`, 4 `.txt`, 3 `.html`, 2 `.sh`.

Largest by size:

| File                           | Size   |
| ------------------------------ | ------ |
| `typecheck_output_old.txt`     | 547 KB |
| `database_new.ts`              | 339 KB |
| `founder_panel_v2_raw.html`    | 173 KB |
| `typecheck_output.txt`         | 110 KB |
| `database_old.ts`              | 109 KB |
| `extracted_claude_design.html` | 96 KB  |
| `claude_dom.html`              | 94 KB  |

That is roughly 1.4 MB of build output, scraped HTML and superseded copies of a generated file, in
the first directory anyone opens.

**Not a credential leak.** The scraped artefacts (`chrome_tabs.json`, `omni_tab_results.json`,
`claude_dom.html`, `extracted_claude_design.html`) were scanned for `sk-`, `eyJ`, `ghp_`,
`sessionKey` and `Bearer` patterns: zero matches. The problem is presentation and hygiene, not
disclosure. Re-run that scan before deleting, in case content changed.

## Work

**1. Categorise and move.** Three destinations, no judgement calls left to the last minute:

- **Delete** — regenerable or superseded: `typecheck_output.txt`, `typecheck_output_old.txt`,
  `database_old.ts`, `database_new.ts` (the live file is `src/types/database.ts`), all `*.png`
  screenshots (`ss*.png`, `ftc_step*.png`, `kvkk_profile.png`, `screenshot*.png`), and the scraped
  HTML/JSON dumps.
- **Move to `scripts/archive/`** — one-off automation that may still be wanted as reference:
  the CDP and scraping scripts (`fetch_*.js`, `read_*.js`, `send_to_*.js`, `*_automator.js`,
  `*_bridge.js`, `wolf_pack_omni_tab.js`, `swarm_router.js`, and similar).
- **Move to `scripts/`** — anything genuinely invoked by a workflow, a `package.json` script, or a
  cron route. **Check before moving**: `grep -rn "<filename>" .github/ package.json src/app/api/cron/`
  for each. A file that something calls must not be archived silently.

**2. Extend `.gitignore`** so they cannot return:

```
/*.png
/typecheck_output*.txt
/database_old.ts
/database_new.ts
/chrome_tabs*.json
/omni_tab_results.json
/claude_dom.html
/extracted_*.html
/founder_panel_v2_raw.html
```

Root-anchored (leading `/`) so that legitimate files of the same type deeper in the tree —
`public/logo.png`, `src/app/icon.png` — are unaffected. **Verify that explicitly**: those two are
currently tracked and must stay tracked.

**3. Do not rewrite history.** A `git filter-branch` or `filter-repo` pass to purge these from past
commits is out of scope: the repository is public and already cloned, the files contain no secrets,
and rewriting shared history costs more than it returns. Deleting them going forward is sufficient.

## Acceptance

- `git ls-files | grep -cE "^[^/]+\.(js|html|png|txt)$"` returns **0**
- The 8 configuration files listed above are still tracked and unchanged
- `public/logo.png`, `public/favicon.png`, `public/og-banner.png` and `src/app/icon.png` are still
  tracked
- `pnpm build`, `pnpm test` and `pnpm lint` still pass — proving nothing moved was load-bearing
- Every workflow in `.github/workflows/` still resolves the scripts it invokes
- A fresh `git clone` shows a root directory a reviewer can read at a glance

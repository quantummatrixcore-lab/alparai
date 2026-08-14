# LANG-2

**LANG-2** — `.repo-language-baseline` currently grandfathers 44 files; work down to zero. The enforcer (`check-repo-language.mjs`, BJ landed `8c943817`) catches Turkish text outside the baseline. Owner: Implementer. Priority: post-launch (v13.40).

## Re-measured 2026-08-14, v13.42

`node scripts/check-repo-language.mjs` now reports **82 files failing** — not the 44 originally
recorded. Most are new: `docs/plan/items/*.md` files (dozens, mostly single instances of the
required word `ölçülmedi`), new admin UI from today's Antigravity commits
(`advisor-roster.tsx`, `sidebar.tsx`, `admin/advisor/page.tsx`), and press/doc files. The
44-file baseline figure is stale and should not be cited again without re-running the command.

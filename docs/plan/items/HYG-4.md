# HYG-4

**HYG-4** — Strip UTF-8 BOM from tracked files, and stop writing new ones. Owner: Implementer.
Priority: P1 — not urgent on its own, but it caused a P0-adjacent incident today (see below).

## Root cause found 2026-08-18

`package.json` had a UTF-8 BOM prepended, which broke `npx lint-staged`'s config resolution and
therefore blocked `.husky/pre-commit` **for every commit, by anyone**, until fixed. Traced to
PowerShell's `Set-Content -Encoding UTF8`, used throughout Antigravity's session today — that flag
writes UTF-8 **with** a BOM on Windows, unlike `-Encoding utf8NoBOM`. The same session's edit to
`AiBudgetTransparencyScore.tsx` shows the same defect turning into visible mojibake
("Anti-Halüsinasyon Protokolü" → "Anti-HalÃ¼sinasyon ProtokolÃ¼," recorded in `TYPE-3`) — a BOM plus
a re-encoding pass is consistent with exactly that corruption pattern.

**Fixed directly (Architect, `docs/**` is within the enforced write path — the pre-commit role-guard
allows `docs/.*` under `ARCHITECT=1`, confirmed by reading `.husky/pre-commit` directly rather than
assumed):**

- `package.json` — BOM stripped, JSON content verified byte-identical otherwise, `npx lint-staged`
  re-run and confirmed working. This was necessary to restore the ability to commit at all, for
  every contributor, and is recorded as a logged exception to normal scope for that reason.
- `docs/PROPOSALS/360-DEGREE-AUDIT.md`, `docs/plan/completed-backlog.md`, `docs/plan/v12.12x.md` —
  BOM stripped, content otherwise unchanged.

**Not fixed here, `src/**`/scripts/**-scoped, Implementer work:**

```
next.config.mjs
refactor-kanban.cjs
scripts/replace.js
src/app/[locale]/admin/advisor/page.tsx
src/components/admin/AiBudgetTransparencyScore.tsx
src/components/admin/audit-log-client.tsx
src/components/admin/master-plan-client.tsx
src/components/admin/moderation-queue.tsx
src/components/deck/pitch-deck.tsx
src/types/database_utf8.ts
ercumenterden.com/src/app/en/page.tsx
ercumenterden.com/src/app/tr/page.tsx
.eslintignore
```

Several of these (`AiBudgetTransparencyScore.tsx`, `audit-log-client.tsx`, `master-plan-client.tsx`,
`moderation-queue.tsx`) are files touched in today's `d8bd006d` — the BOM is likely why that commit's
"truth protocol" fix introduced fresh mojibake instead of only removing the old fake data.

## Process fix, not just a data fix

If Antigravity's local tooling continues writing files via PowerShell `Set-Content`, every future
edit risks reintroducing this. The one-line fix: use
`-Encoding utf8NoBOM` (PowerShell 6+) or
`[System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding($false)))`
instead of `-Encoding UTF8`, everywhere Antigravity writes a file.

## Acceptance

- `git ls-files` scanned for a leading `EF BB BF` byte sequence returns zero matches
- `npx lint-staged` and `.husky/pre-commit` run clean on a normal commit
- Antigravity's write path no longer uses `-Encoding UTF8` for text files in this repo

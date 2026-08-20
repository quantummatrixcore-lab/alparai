# Completed Backlog Archive - see v12.12x.md for full records

## Closed 2026-08-20 (v13.66) — verified by direct measurement

- **TYPE-2**, **DBTYPE-1**, **AGENTOS-1** — all three closed on one measurement at commit `a23b10d1`:
  `pnpm typecheck` (real `tsc --noEmit`, `package.json:36`) exits 0 with zero errors, and `@ts-nocheck`
  directives under `src/` number zero. The rows had been carried as open P0 after the work was done.
  A separate four-error regression arrived later with `47db3b8e` and is tracked as `TEST-1`.

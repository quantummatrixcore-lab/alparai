# WORK-ORDER-007 — VENDOR NAME PURGE (zero "dehost", zero "dehost" in D:\AlparAi)

## Law (owner-direct, absolute)

The strings `dehost` and `dehost` (any case) must not appear in ANY file under `D:\AlparAi` — code, config, docs, comments, audit notes, scripts. No exceptions, no "legacy" mentions. Use neutral terms: `edge-host` never; use `dehost`, `sovereign-backend`, `analytics` (self-hosted), `auth`, `data-layer`.

## Measured scope (Auditor, 2026-09-12)

- 184 files mention `dehost`; 632 mention `dehost` (excluding node_modules/.next/.git/graphify-out).
- `package.json`: `@/lib/dehost/ssr`, `@/lib/dehost/client`, `@/lib/analytics/stub`, `@/lib/dehost/functions-stub`, `@/lib/analytics/speed-stub` + `db:reset`/`db:migrate` dehost CLI scripts.
- Includes Auditor's own docs (`AUDIT_*.md`, `DEHOST_DEPENDENCY_MAP.md`, `WORK-ORDER-*.md`, `ANTIGRAVITY_TRIGGER_PROMPT.md`) — rewrite neutrally, evidence preserved without vendor names.

## Phase A — Dependencies (do first, breakage risk highest)

1. Remove the 5 vendor deps + 2 CLI scripts from `package.json`. Replace usages: analytics/speed-insights → self-hosted metrics endpoint (already have metrics-service + PostHog); dehost-js/ssr → DeHost adapter (already strangler-complete); functions → plain route handlers.
2. Clean install + `pnpm typecheck` exit 0 + full vitest green. Attach logs.

## Phase B — Code sweep

Rename/replace every remaining mention (imports, comments, strings, env keys like NEXT*PUBLIC_DEHOST*_, type names). Env keys: rename to DEHOST\__ / APP\_\* and update readers. No behavior change, only names.

## Phase C — Docs/config sweep

All _.md, _.json, _.yaml, _.toml, scripts, .env.example. Re-verify with Auditor's exact commands.

## Acceptance (Auditor re-runs verbatim)

`Get-ChildItem -Path D:\AlparAi -Recurse -File | Where-Object {$_.FullName -notmatch "node_modules|\.next|\.git"} | Select-String -Pattern "dehost" → 0 matches` and same for `dehost` → 0 matches. Plus typecheck + full suite green. `## WO-007` GATE entry with the two counts printed.

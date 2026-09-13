# DEHOST DEPENDENCY MAP — DeHost coupling inventory (WO-001)

Source: `D:\AlparAi\src`, 286 unique `.ts/.tsx` files match `/dehost/i`.
Reproduce: `Get-ChildItem -Path "D:\AlparAi\src" -Include *.ts,*.tsx -Recurse -File | Select-String -Pattern "dehost" | Select-Object -ExpandProperty Path -Unique`

## Choke points (migrate these 6 first, everything else follows)

1. `src/lib/dehost/server.ts` — server client factory
2. `src/lib/dehost/client.ts` — browser client factory
3. `src/lib/dehost/middleware.ts` — session refresh (`updateSession`)
4. `src/lib/dehost/admin.ts` — service-role client
5. `src/middleware.ts` — imports `updateSession`, admin RBAC reads `users.role`
6. `src/app/sitemap.ts` — direct table reads (`incidents`, `ai_providers`, `ai_models`, `blog_posts`)

## Coupling zones (approximate file counts from unique-path scan)

- `src/actions/**` — ~90 files (admin, auth, community, incidents, legal, models, billing, social)
- `src/app/api/**` — ~80 route handlers (v1, admin, cron, checkout, webhooks, public)
- `src/app/[locale]/**` — ~60 pages/components (incidents, models, admin, academy, transparency)
- `src/lib/**` — ~30 services (ai, audit, autopilot, billing, geo, health, notifications)
- `src/hooks/admin/**` — ~12 realtime/admin hooks
- `src/types/database*.ts` — 3 generated schema files (must be regenerated from DeHost)

## Migration order (strangler)

1. Stand up DeHost Postgres + Auth + Storage; port schema from `dehost/migrations` (squash first).
2. Reimplement the 4 adapter files against DeHost behind identical exports (callers untouched).
3. Cut over `middleware.ts` session + `sitemap.ts` reads.
4. Sweep `actions/`, `api/`, pages per-zone with per-zone test runs.
5. Regenerate `src/types/database*.ts` from DeHost; delete `dehost/` dir last.

Rule: zero new DeHost imports from this point on. Every migrated file must pass ErcuOS gates before staging.

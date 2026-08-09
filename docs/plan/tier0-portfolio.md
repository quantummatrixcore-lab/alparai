# Tier 0 Portfolio - DecasHub & Agent-OS Guidelines

## 4a. K-Matrix Resolution & DecasHub Maintenance

- **Verdict:** K-Matrix (AGENTS.md) overrides v14.1. DecasHub is strictly Tier 1 (20% compute, maintenance only).
- **Action:** Cancel the massive "Stripe Connect & Unified SSO" migrations for DecasHub. Revert DecasHub to isolated legacy operation. DecasHub will remain on Next.js 14 and Tailwind v3. No major version upgrades allowed.

## 4b. Security & State Management (Tier 0 - Agent-OS & Alparai)

- **RLS Fix:** The `20260907000000_decashub_sso_schema.sql` migration lacked RLS policies. Drop or rewrite this migration to strictly enforce `auth.uid()`.
- **SSR/Hydration:** `engine_omniauto` and `engine_core` must patch Next.js hydration mismatches caused by `<PersistGate>` wrapping Server Components in Agent-OS.
- **SEO Leak:** The `sitemap.ts` in Agent-OS exposes `/admin` and private `/dashboard` routes. Must be excluded immediately.
- **Framer Motion:** High layout shift bottlenecks detected. Convert complex JS animations to CSS-only tailwind transitions where possible.

## 4c. Supply Chain Realignment

- **Agent-OS Auth:** Next-auth v4 is incompatible with React 19. Agent-OS MUST be upgraded to Auth.js v5.
- **Dependency Unification:** Enforce `zod: ^3.24.2`, `lucide-react: ^0.577.0`, and `ai: ^4.3.15` across Tier 0 repos to prevent drift.

## Completed Tasks (From Master Plan v15.1 Sprint)

| Blok  | Görev Özeti                                                                  | Durum                    |
| ----- | ---------------------------------------------------------------------------- | ------------------------ |
| ALPHA | DecasHub Unified SSO migration (20260907000000_decashub_sso_schema.sql)      | ✅ completed             |
| ALPHA | Agent-OS premium UI (framer-motion SSO login, glassmorphism autopilot panel) | ✅ completed             |
| ALPHA | DecasHub landing page glassmorphism                                          | ✅ completed             |
| ZETA  | Autopilot: Agent-OS Auth.js v5 upgrade, Sitemap SEO & Hydration fixes        | ✅ c3249d0 (origin/main) |
| ZETA  | Autopilot: DecasHub SSO RLS enforcement (Tier-1 Maintenance Mode)            | ✅ 3674b75 (origin/main) |

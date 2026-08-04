# ALPAR AI — Founder & Developer Handover

**Date**: 2026-07-12  
**Author**: Founder (quantum.matrix.core@gmail.com)  
**Purpose**: Complete knowledge transfer for a new developer or AI agent joining the ALPAR AI project.

---

## 1. What is ALPAR AI?

ALPAR AI is a **trust infrastructure for AI accountability**. It operates as a public benefit company (AGPL-3.0) building:

- **Incident Registry** — Crowdsourced, verified AI incident reports (like a "Better Business Bureau for AI").
- **K-BENCHMARK** — AI model safety and capability ratings using Wilson-score methodology with multi-model debate adjudication.
- **ALPAR Transparency Hub** — System status, transparency reports, community challenges, governance docs.

**Domain**: https://alparai.com (Vercel, region fra1)

---

## 2. Tech Stack

| Layer       | Choice                                           |
| ----------- | ------------------------------------------------ |
| Framework   | Next.js 15 (App Router)                          |
| Language    | TypeScript strict (`noUncheckedIndexedAccess`)   |
| Database    | Supabase (PostgreSQL, `alparai-prod`, FREE plan) |
| Auth        | Supabase Auth + Google OAuth                     |
| ORM         | Raw SQL + Supabase JS client (no Prisma)         |
| i18n        | next-intl with `messages/{en,tr}.json`           |
| Styling     | Tailwind CSS v4 (`@theme inline` in globals.css) |
| Testing     | Vitest (unit), Playwright (E2E)                  |
| Hosting     | Vercel (project `alparai-com`, branch `master`)  |
| Package mgr | pnpm                                             |

---

## 3. Project Structure

```
src/
  app/[locale]/          # i18n-routed pages
    incidents/           # Incident browsing & submission
    ratings/             # K-BENCHMARK model ratings
    methodology/         # Methodology docs
    status/              # System status page
    admin/               # Admin dashboard
    legal/               # Legal pages (KVKK, GDPR, ToS)
    auth/                # Login/register
  actions/               # Server Actions (mutations only)
  components/
    ui/                  # Pure primitives (Button, Card, Modal, ...)
    incidents/           # Incident-related components
    auth/                # Auth components
    admin/               # Admin components
    legal/               # Legal page components
    marketing/           # Marketing components
  lib/
    supabase/            # client.ts, server.ts, admin.ts
    pii/                 # PII Guardian (masking)
    utils/               # Rate limiting, helpers
messages/                # en.json, tr.json (next-intl)
supabase/
  migrations/            # Timestamped SQL migrations
  seed.sql               # Seed data
docs/                    # Architecture, KVKK, ADRs, handover
```

---

## 4. Database & RLS

- Every table has Row-Level Security (RLS) policies.
- **Supabase clients**:
  - `client.ts` — Browser (RLS enforced, anon key)
  - `server.ts` — Server component (RLS enforced, anon key + session)
  - `admin.ts` — Server Action (RLS bypass, service role key — ADMIN ONLY)
- **Key tables**: `incidents`, `ai_models`, `k_categories`, `k_model_scores`, `k_model_scores_history`, `age_declarations`, `bounties`, `transparency_reports`, `api_keys`, `email_preferences`.

---

## 5. Auth

- **Supabase Auth** with Google OAuth provider.
- OAuth Client ID: `341717447635-75ramo1e88p34b9dkmhfp5ocecqv0ff1.apps.googleusercontent.com`
- Roles: `public` (anonymous), `authenticated`, `moderator`, `admin`, `ceo`.
- Admin check: `is_admin()` SQL function (checks `auth.uid()` against `admin_users` table).

---

## 6. i18n

- All user-facing strings in `messages/{en,tr}.json`.
- Pages use `useTranslations("namespace")` (client) or `getTranslations({locale, namespace})` (server).
- `common` namespace for shared nav/footer. Domain-specific namespaces (`incidents`, `ratings`, `methodology`, `status`, `legal`).

---

## 7. Standing Rules (Critical)

1. **Never insert from client** — use Server Actions for all mutations.
2. **PII Guardian** — all user free-text fields are masked by `src/lib/pii/guardian.ts` before DB insert.
3. **No `any`** — use `unknown` + Zod parsing for runtime validation.
4. **No code comments** — explain intent via code structure and naming.
5. **Every migration has RLS policies** — new tables must include `CREATE POLICY` statements.
6. **Run `pnpm lint && pnpm typecheck` after every change**.
7. **Never expose `SUPABASE_SERVICE_ROLE_KEY`** to the browser.
8. **Never log raw IP, email, or PII** — always hash first.

---

## 8. Recent Work (2026-07)

| Item | Description                                               | Commit    |
| ---- | --------------------------------------------------------- | --------- |
| G6   | Granular cookie consent + Plausible consent-aware loading | `8ac4d29` |
| K14  | K-BENCHMARK methodology page                              | `cfc65ae` |
| A1   | Anonymous email hash + migration                          | `d9181dc` |
| E1   | E2E suite expansion (55 scenarios)                        | `d9181dc` |
| O1   | System status page                                        | `d9181dc` |
| K16  | Model score history page + SVG chart                      | `83d1de5` |
| C1a  | API keys hardening rollback fix                           | `83d1de5` |
| B1   | CLAUDE.md init                                            | `3b5b54b` |
| B2   | HANDOVER.md                                               | `217e1b7` |
| E3   | k6 load testing baseline                                  | `930801f` |
| E5   | Accessibility CI gate                                     | `930801f` |
| E6   | Visual regression (screenshot diff)                       | `930801f` |
| SL1  | SLI/SLO dashboard + OPS doc                               | `b68596e` |
| SL4  | Golden signals dashboard                                  | `b68596e` |
| L11  | Advisory rotation policy + migration                      | `db7e5bd` |
| L12  | Peer-review journal page + migration                      | `db7e5bd` |
| N5   | TR AISI dialogue draft                                    | `5c3e586` |
| N6   | KVKK engagement draft                                     | `5c3e586` |

**Post-2026-06-06 rebuild**: All prior data was unrecoverable (Supabase FREE plan paused >90 days). Fresh seed data applied.

---

## 9. Completed Work (MASTER_PLAN v8.8 — OpenCode batch)

All 15 OpenCode items completed in a single session (2026-07-12):

| ID  | Item                                 | Commit    |
| --- | ------------------------------------ | --------- |
| K14 | K-BENCHMARK methodology page         | `cfc65ae` |
| K16 | Model score history page + chart     | `83d1de5` |
| B1  | CLAUDE.md init                       | `3b5b54b` |
| B2  | HANDOVER.md                          | `217e1b7` |
| ST1 | Transparency page (pre-existing)     | —         |
| CQ1 | Bounties page (pre-existing)         | —         |
| E3  | k6 load testing baseline             | `930801f` |
| E5  | Accessibility CI gate                | `930801f` |
| E6  | Visual regression                    | `930801f` |
| SL1 | SLI/SLO dashboard + OPS doc          | `b68596e` |
| SL4 | Golden signals dashboard             | `b68596e` |
| L11 | Advisory rotation migration + doc    | `db7e5bd` |
| L12 | Peer-review journal page + migration | `db7e5bd` |
| N5  | TR AISI draft doc                    | `5c3e586` |
| N6  | KVKK engagement draft                | `5c3e586` |
| G8  | Age gate migration (Antigravity)     | `8ac4d29` |

---

## 10. Infrastructure

- **Vercel**: Project `alparai-com` (`prj_REYJORnuYOT4tk28iMXnKZBCGkjL`), auto-deploys from `master`.
- **Supabase**: `alparai-prod` (`ref: azszpzyvxjduhemkjsdh`), region `eu-west-1`, FREE plan.
- **Google Cloud**: Project ID `341717447635`, OAuth consent screen name "ALPAR AI".
- **Monitoring**: Plausible Analytics (self-hosted, consent-gated).
- **AI Incident Taxonomy**: Based on OECD + EU AI Act + custom ALPAR categories.

---

## 11. Key Contacts

| Role          | Person                                                   |
| ------------- | -------------------------------------------------------- |
| Founder / CEO | quantum.matrix.core@gmail.com                            |
| GitHub Org    | @quantummatrixcore-lab                                   |
| Repo          | https://github.com/quantummatrixcore-lab/Alparai.com.git |

---

## 12. Quick Start

```bash
git clone https://github.com/quantummatrixcore-lab/Alparai.com.git
cd Alparai.com
pnpm install
# Set up .env.local with Supabase keys + Vercel tokens
pnpm dev              # http://localhost:3000
pnpm lint             # ESLint + tsc type check
pnpm test             # Vitest unit tests
pnpm test:e2e         # Playwright E2E tests
```

**Secrets needed** (in `.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (= http://localhost:3000 for dev)

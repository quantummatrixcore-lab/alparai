# ALPAR AI

> Trust infrastructure for AI accountability. Community-driven incident reporting platform. Like Trustpilot, but for AI systems.

🌐 **[alparai.com](https://alparai.com)** · 📧 [hello@alparai.com](mailto:hello@alparai.com) · 📜 [AGPL-3.0](./LICENSE)

[![CI](https://github.com/quantummatrixcore-lab/Alparai.com/actions/workflows/ci.yml/badge.svg)](https://github.com/quantummatrixcore-lab/Alparai.com/actions/workflows/ci.yml)
[![Security](https://github.com/quantummatrixcore-lab/Alparai.com/actions/workflows/security.yml/badge.svg)](https://github.com/quantummatrixcore-lab/Alparai.com/actions/workflows/security.yml)
[![Deploy](https://github.com/quantummatrixcore-lab/Alparai.com/actions/workflows/deploy.yml/badge.svg)](https://github.com/quantummatrixcore-lab/Alparai.com/actions/workflows/deploy.yml)
[![AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](./LICENSE)
[![HackerOne VDP](https://img.shields.io/badge/HackerOne-VDP-purple.svg)](./docs/outreach/hackerone_strategy.md)

---

## Deploy Convention

Production builds run only for commits whose message contains `[deploy]` (enforced by `scripts/deploy-gate.mjs` via `vercel.json` `ignoreCommand`). Batch your commits; put `[deploy]` on the batch-closing commit only. Max 2 deploy windows per executor per day.

## Why

AI is everywhere. When an AI system causes harm — a hallucination that ruins a paper, a biased loan decision, a privacy leak — users have nowhere to report it. The public record is scattered across Twitter, forums, and Reddit. We fix that.

ALPAR is a public, independent, verifiable record of how AI systems behave in the real world. **Users report. AI providers respond. The public decides.**

## Highlights

- 🔐 **Sign in with Google** (Supabase Auth) — no passwords.
- 🛡️ **PII Guardian** — emails, phone numbers, IDs, IBANs, credit cards, access tokens are automatically masked before publication.
- 🌍 **EN + TR bilingual** (i18n with `next-intl`, `/en/...` and `/tr/...`).
- 🏛️ **Intermediary legal model** — like Trustpilot / sikayetvar.com. We host user content; users are responsible for what they submit. (See [Terms](./docs/LEGAL.md) and [KVKK compliance](./docs/KVKK.md).)
- 🤖 **AI providers' right to respond** — verified providers can post an official response on any incident.
- 📊 **Leaderboard** — ranked by Trust Score (response rate, resolution rate, and response time).
- 💡 **Suggestion system** — community votes, we build what matters.
- ⚖️ **Takedown queue** — 7-day SLA, GDPR/KVKK aligned.
- 📜 **AGPL-3.0** — anyone can audit, run, and contribute.
- 🟢 **EU-hosted** — Supabase Frankfurt, Upstash Frankfurt, Plausible EU, Sentry EU.

## Tech stack

- **Framework:** Next.js 15 (App Router, React Server Components, Server Actions)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 (CSS-first `@theme`), Framer Motion
- **Auth:** Supabase Auth (Google OAuth)
- **Database:** Supabase Postgres + Row Level Security
- **Storage:** Supabase Storage (evidence + avatars)
- **i18n:** next-intl (EN primary, TR secondary)
- **Email:** Resend
- **Rate limiting:** Upstash Redis
- **Monitoring:** Sentry
- **Analytics:** Plausible (cookieless)
- **Testing:** Vitest + Playwright (planned)
- **Lint:** ESLint (next + TS strict) + Prettier

## Quickstart

```bash
git clone https://github.com/quantummatrixcore-lab/Alparai.com
cd Alparai.com
cp .env.example .env.local
# fill in Supabase, Resend, Upstash, etc. — see CONTRIBUTING.md
pnpm install
pnpm db:reset      # apply Supabase migrations
pnpm dev           # http://localhost:3000
```

> **Note:** full setup guide is in [CONTRIBUTING.md](./CONTRIBUTING.md).

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (User)                          │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Next.js 15 (App Router, RSC, Server Actions)                  │
│  • i18n middleware  • CSP/HSTS  • Rate limiting  • PII Guardian │
└─────────────────────────────────────────────────────────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
   Supabase        Upstash         Sentry       Plausible
   Auth/DB/        Redis           (errors)     (analytics)
   Storage         (limits)         EU            EU
   (Frankfurt)
```

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the full picture.

## Project structure

```
src/
├── app/                       # App Router
│   ├── [locale]/              # Localized routes (/en, /tr)
│   │   ├── page.tsx           # Home
│   │   ├── submit/            # Submit incident
│   │   ├── incidents/         # Browse + detail
│   │   ├── brand/[slug]/      # Provider pages
│   │   ├── leaderboard/       # AI provider ranking
│   │   ├── suggestions/       # Feature requests
│   │   ├── legal/             # Privacy, Terms, Takedown, Cookies
│   │   ├── pricing/           # Pricing tiers
│   │   ├── security/          # Security & compliance
│   │   ├── dmca/              # DMCA policy
│   │   ├── moderation/        # Moderation policy
│   │   ├── blog/              # Blog + articles
│   │   ├── academy/           # Expert application
│   │   ├── admin/             # Moderator panel
│   │   ├── auth/              # Sign-in + OAuth callback
│   │   ├── profile/           # User profile
│   │   ├── about/             # About page
│   │   └── contact/           # Contact form
│   ├── layout.tsx             # Root layout (minimal)
│   ├── error.tsx              # Global error boundary
│   ├── not-found.tsx          # 404
│   ├── robots.ts              # /robots.txt
│   ├── sitemap.ts             # /sitemap.xml
│   ├── manifest.ts            # /manifest.webmanifest
│   ├── opengraph-image.tsx    # OG image (edge-rendered)
│   ├── icon.tsx               # Favicon
│   └── apple-icon.tsx         # Apple touch icon
├── actions/                   # Server Actions (mutations)
│   ├── incidents.ts
│   ├── suggestions.ts
│   ├── takedown.ts
│   ├── auth.ts
│   ├── admin.ts
│   └── contact.ts
├── components/
│   ├── ui/                    # Primitives (Button, Card, …)
│   ├── layout/                # Header, Footer, Nav, Logo
│   ├── incidents/             # Cards, forms, detail view
│   ├── auth/                  # Sign-in, consent
│   ├── admin/                 # Moderation queue, stats
│   ├── legal/                 # Cookie banner, legal layout
│   ├── marketing/             # Hero, leaderboard, CTAs
│   └── client-providers.tsx   # Toaster, CookieBanner
├── i18n/                      # next-intl config
│   ├── routing.ts
│   └── request.ts
├── lib/
│   ├── supabase/              # Typed Supabase clients
│   ├── auth/                  # Session helpers
│   ├── pii/                   # PII Guardian
│   ├── validation/            # Zod schemas
│   ├── utils/                 # cn, formatters, rate limit
│   └── constants/             # APP_NAME, categories, …
├── types/                     # Database + app types
├── middleware.ts              # i18n + session refresh
└── globals.css                # Design tokens (Tailwind v4)
supabase/
└── migrations/                # SQL migrations
messages/
├── en.json
└── tr.json
docs/                          # Documentation (English)
```

## Roles

| Role        | Can                                                          |
| ----------- | ------------------------------------------------------------ |
| `user`      | Sign in, submit incidents, vote, comment, suggest features   |
| `moderator` | All of `user` + approve/reject incidents, review takedowns   |
| `admin`     | All of `moderator` + manage users, providers, view audit log |

The `users` table is auto-populated via a Postgres trigger on `auth.users` insert. Role assignment is manual (we promote trusted contributors).

## Security

- **CSP** locked to self + Supabase + Sentry + Google avatars + GFonts.
- **HSTS** with `preload`, **X-Frame-Options: DENY**, **X-Content-Type-Options: nosniff**.
- **RLS** enabled on every table; helper functions `is_moderator()` / `is_admin()` gate moderator actions.
- **PII Guardian** masks PII server-side before insert.
- **Rate limits**: 5 incidents/hour, 10 suggestions/day, 10 sign-ins/15min, 100 req/min general (Upstash).
- **PII as `server-only`** — server modules cannot be bundled into the client.

Read [docs/SECURITY.md](./docs/SECURITY.md) for the full security model.

## Legal

We operate as an **intermediary platform** in line with:

- EU E-Commerce Directive (2000/31/EC), Article 14
- Turkish E-Commerce Law (6563 sayılı Kanun)
- GDPR + KVKK

We do not pre-moderate submissions (except automated PII scanning). Liability for the accuracy of submissions rests with the user. See [Terms](./src/app/[locale]/legal/terms/page.tsx) and [Takedown Policy](./src/app/[locale]/legal/takedown/page.tsx).

## Open Source

ALPAR AI is open source under **AGPL-3.0**.

**What's open:** Frontend, data schema, validation pipeline, GDPR/KVKK compliance code, and the full incident lifecycle — because "we're transparent" requires proof, not promises.

**What's closed:** The moderation engine and spam detection layer — making these public would let bad actors reverse-engineer bypass methods. This is the same approach taken by AIID and most accountability platforms.

> AGPL-3.0 means: if you run a hosted instance or fork this, you must release your changes under the same license. Commercial licensing available — contact [hello@alparai.com](mailto:hello@alparai.com).

## Contributing

We welcome contributions. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[AGPL-3.0](./LICENSE) — any derivative work (including a hosted instance) must be released under the same license.

---

Made with care for the AI era. · [alparai.com](https://alparai.com)

<div align="center">
  <img src="public/brand/alpar-logo.svg" alt="ALPAR AI Logo" width="360" />

  <p align="center">
    <strong>Global Autonomous AI Incident Intelligence, Compliance & Cross-Audit Infrastructure</strong>
  </p>

  <p align="center">
    <a href="https://www.alparai.com"><img src="https://img.shields.io/badge/Production-alparai.com-8b5cf6?style=for-the-badge&logo=dehost" alt="Production" /></a>
    <a href="https://github.com/quantummatrixcore-lab/alparai-platform/actions/workflows/ci.yml"><img src="https://github.com/quantummatrixcore-lab/alparai-platform/actions/workflows/ci.yml/badge.svg" alt="CI Status" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-AGPLv3-blue?style=for-the-badge" alt="License" /></a>
    <a href="https://www.alparai.com/tr/ai-act"><img src="https://img.shields.io/badge/EU_AI_Act-Article_72_Ready-amber?style=for-the-badge" alt="EU AI Act" /></a>
  </p>
</div>

---

## 🏛️ Overview

**ALPAR AI** is the sovereign global intelligence observatory and incident response ledger for artificial intelligence systems. As AI models assume mission-critical roles in healthcare, autonomous vehicles, legal decision-making, and financial underwriting, **ALPAR AI** provides deterministic cross-audit verification, hallucination tracking, and regulatory governance.

---

## 📁 Repository Layout

- **This repository** (`alparai-platform`) is public and contains the complete product: application, tests, docs, and deployment workflows.
- **Internal-only extensions** (company-confidential interfaces and tooling) are maintained in a separate private repository. Access requests: `security@alparai.com`.
- **Working language:** all code, comments, docs, and commit messages are English.

---

## 🏗️ Architecture & Technology Stack

```
                               ┌───────────────────────────┐
                               │   Next.js 16 (App Dir)    │
                               │   Turbopack & Edge ISR    │
                               └─────────────┬─────────────┘
                                             │
              ┌──────────────────────────────┼───────────────────────────────┐
              ▼                              ▼                               ▼
     ┌─────────────────┐            ┌─────────────────┐             ┌─────────────────┐
     │  Tailwind CSS v4│            │   PostgreSQL    │             │   Multi-Model   │
     │  Framer Motion  │            │   pgvector RLS  │             │   Cross-Audit   │
     │  Next-Intl (i18n│            │   DeHost Auth │             │  Edge Gateways  │
     └─────────────────┘            └─────────────────┘             └─────────────────┘
```

- **Frontend**: Next.js 16 (React 19), Tailwind CSS v4, Framer Motion, Lucide Icons
- **Backend & Database**: PostgreSQL 16 with `pgvector`, Row-Level Security (RLS), DeHost Auth & Storage
- **Internationalization**: English (`/en`) and Turkish (`/tr`) dictionaries ship complete; additional nav locales are pending dictionaries (see Status)
- **Security**: Strict CSP, Subresource Integrity, Zero-Trust Storage, Rate Limiting, Turnstile Bot Protection
- **Observability**: PostHog Telemetry, Sentry Performance, DeHost Speed Insights

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js `20.x` or later (LTS recommended)
- `pnpm >= 9.12.0`
- PostgreSQL / DeHost project

### Installation

```bash
# 1. Clone repository
git clone https://github.com/quantummatrixcore-lab/alparai-platform.git
cd alparai-platform

# 2. Install dependencies
pnpm install

# 3. Environment setup
cp .env.example .env.local

# 4. Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Quality Gates

All gates run in CI (`.github/workflows/`) and as pre-commit / pre-push hooks. Secrets are scanned on every commit; `.env*` files are never committed.

```bash
pnpm typecheck      # TypeScript, zero errors
pnpm lint           # ESLint
pnpm test           # Vitest unit suites (210 suites)
pnpm test:e2e       # Playwright end-to-end (55 specs)
pnpm i18n:check     # dictionary completeness
pnpm check:routes   # route inventory check
```

---

## 🚢 Deployment Topology

Traffic serving follows one rule: **a single serving lane per hostname.** Static snapshots under `public/` must never shadow application routes. The two lanes:

- **Next.js application** — built and verified by `production.yml`, served from the production host.
- **Cloudflare Pages (`public/`)** — static assets only. No locale `index.html` snapshots that collide with app routes.

See `.github/workflows/cloudflare-pages.yml` and `.github/workflows/production.yml`.

---

## 🎨 Brand Assets & Media Kit

Official vector logos, color specifications, and icon kits are available in the [Brand Assets Package](https://www.alparai.com/brand-assets.zip).

---

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. By contributing you agree that your work follows the repository language rule (English) and the quality gates above.

---

## 🛡️ Security & Responsible Disclosure

Please review our [SECURITY.md](SECURITY.md) policy before disclosing potential vulnerabilities. Contact: `security@alparai.com`.

---

## 📜 License

ALPAR AI is licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE).

<div align="center">
  <sub>Built with precision by the ALPAR AI Foundation. Protecting humanity's digital frontier.</sub>
</div>

<div align="center">
  <img src="public/brand/alpar-logo.svg" alt="ALPAR AI Logo" width="360" />
  
  <p align="center">
    <strong>Global Autonomous AI Incident Intelligence, Compliance & Cross-Audit Infrastructure</strong>
  </p>

  <p align="center">
    <a href="https://www.alparai.com"><img src="https://img.shields.io/badge/Production-alparai.com-8b5cf6?style=for-the-badge&logo=vercel" alt="Production" /></a>
    <a href="https://github.com/quantummatrixcore-lab/alparai-platform/actions"><img src="https://img.shields.io/badge/CI%2FCD-Passing%20(208%2F208)-emerald?style=for-the-badge&logo=githubactions" alt="CI Status" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-AGPLv3-blue?style=for-the-badge" alt="License" /></a>
    <a href="https://www.alparai.com/tr/ai-act"><img src="https://img.shields.io/badge/EU_AI_Act-Article_72_Ready-amber?style=for-the-badge" alt="EU AI Act" /></a>
  </p>
</div>

---

## 🏛️ Overview

**ALPAR AI** is the sovereign global intelligence observatory and incident response ledger for artificial intelligence systems. As AI models assume mission-critical roles in healthcare, autonomous vehicles, legal decision-making, and financial underwriting, **ALPAR AI** provides deterministic cross-audit verification, hallucination tracking, and regulatory governance.

---

## ✨ Key Capabilities

- 📡 **2,880+ Indexed & Verified Incidents**: Comprehensive database of LLM hallucinations, security bypasses, data exfiltration, bias suppression, and system outages.
- 🛡️ **Cross-Audit Truth Scoring™**: Multi-model consensus pipeline benchmarking claim veracity, evidence provenance, and reproducibility.
- 🇪🇺 **EU AI Act & Global Regulatory Engine**: Real-time automated risk classification (Unacceptable, High, Limited, Minimal) complying with EU AI Act Articles 5, 6, and 72.
- ⚡ **Model Velocity & ELO Radar**: Realtime tracking of frontier and open-weight models (o1, DeepSeek-R1, Gemini 2.0, Claude 3.7, GPT-4o, Llama 3.3).
- ⚖️ **Ethical Dilemmas & Precedent Bank**: Interactive case repository exploring edge-case societal impact and liability boundaries.
- 🔒 **Zero-Trust Whistleblower Gateway**: End-to-end PGP-encrypted, metadata-sanitized reporting portal for AI safety whistleblowers.

---

## 🏗️ Architecture & Technology Stack

```
                               ┌───────────────────────────┐
                               │   Next.js 15.2 (App Dir)  │
                               │   Turbopack & Edge ISR    │
                               └─────────────┬─────────────┘
                                             │
             ┌───────────────────────────────┼───────────────────────────────┐
             ▼                               ▼                               ▼
    ┌─────────────────┐             ┌─────────────────┐             ┌─────────────────┐
    │  Tailwind CSS v4│             │   PostgreSQL    │             │  Multi-Model    │
    │  Framer Motion  │             │   pgvector RLS  │             │  Cross-Audit    │
    │  Next-Intl (i18n│             │   Supabase Auth │             │  Edge Gateways  │
    └─────────────────┘             └─────────────────┘             └─────────────────┘
```

- **Frontend**: Next.js 15 (React 19), Tailwind CSS v4, Framer Motion, Lucide Icons
- **Backend & Database**: PostgreSQL 16 with `pgvector`, Row-Level Security (RLS), Supabase Auth & Storage
- **Internationalization**: Full bilingual English (`/en`) & Turkish (`/tr`) localization via `next-intl`
- **Security**: Strict CSP, Subresource Integrity, Zero-Trust Storage, Rate Limiting, Turnstile Bot Protection
- **Observability**: PostHog Telemetry, Sentry Performance, Vercel Speed Insights

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js `20.x` or later (LTS recommended)
- `pnpm` or `npm`
- PostgreSQL / Supabase project

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

## 🧪 Quality Gate & Test Suite

```bash
# Run unit & contract test suite (208+ files, 1177+ tests)
pnpm test

# Run TypeScript typecheck
pnpm typecheck

# Run linter
pnpm lint

# Run security & AST scan
npm run security-check
```

---

## 🎨 Brand Assets & Media Kit

Official vector logos, color specifications, and icon kits are available in the [Brand Assets Package](https://www.alparai.com/brand-assets.zip).

---

## 🛡️ Security & Responsible Disclosure

Please review our [SECURITY.md](SECURITY.md) policy before disclosing potential vulnerabilities. Contact: `security@alparai.com`.

---

## 📜 License

ALPAR AI is licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE).

<div align="center">
  <sub>Built with precision by the ALPAR AI Foundation. Protecting humanity's digital frontier.</sub>
</div>

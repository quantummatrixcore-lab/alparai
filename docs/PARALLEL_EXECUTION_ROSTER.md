# Parallel Execution Roster: Antigravity vs Opencode

This document outlines the division of labor between Antigravity (Backend/DB/Testing/Cron) and Opencode (Frontend/UI/E2E/Legal) for the v8.7 Master Plan items (27-70 + A1-A3). Both agents operate in Otopilot mode on `master` branch.

## 🧲 Antigravity (Backend & Data Tier)

_Focus: RLS, Cron, AI Routing, Telemetry, Security Scanning, API logic._

- **A2**: External auto-publish cron & DB update
- **A3**: NVIDIA NGC adapter integration
- **K13, K15, K17**: Provider preview cron, Weekly rating refresh, Model retirement
- **G4, G5**: Data retention schedule, Provider redaction workflow
- **F1, F2**: Duplicate detection (pg_trgm), IP throttle
- **O3, O4**: Cost telemetry migration, PITR restore test
- **E2, E4, E7, E8**: Contract tests, Mutation testing, Security CI, SBOM
- **SL2, SL3**: Auto-rollback wire, Chaos day playbook
- **G7**: DSAR automation
- **F3, F4**: Sybil detection, Moderation SLA
- **DR1, DR2**: Multi-region DR drill, Data portability
- **ZK1, DM1, RA1**: Zero-knowledge submission, Dynamic model routing, Risk API v1

## 💻 Opencode (Frontend & Presentation Tier)

_Focus: React, Tailwind, Next-intl, Playwright E2E, Legal copy, A11y._

- **A1**: Anon-legal copy patch & UI submit action (hash)
- **G1, G2, G3, G6, G8**: Terms/Privacy gap fill, security.txt, Cookie consent banner, Age gate
- **K14, K16, K18**: Methodology public page, Model score history chart, External auditor API docs
- **O1, O2**: Public status page, Sentry alerting rules
- **B1, B2**: CLAUDE.md init, Founder handover doc
- **ST1, CQ1**: Transparency reports page, Community Challenge UI
- **E1, E3, E5, E6**: Playwright E2E suite, Load testing, Accessibility CI gate, Visual regression
- **SL1, SL4**: SLI/SLO dashboard, Golden signals UI
- **L11, L12, N5, N6**: Advisory rotation docs, Peer-review journal, TR AISI/KVKK templates

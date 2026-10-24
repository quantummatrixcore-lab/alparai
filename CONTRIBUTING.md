# Contributing to ALPAR AI

> **Standard:** Developer Certificate of Origin (DCO 1.1), ISO/IEC 27037 Forensic Integrity, EU AI Act Art. 73  
> **License:** GNU Affero General Public License v3.0 (AGPL-3.0)  
> **Status:** Active & Enforced

Thank you for your interest in contributing to **ALPAR AI** — the sovereign trust infrastructure, forensic incident registry, and actuarial rating authority for autonomous AI systems. We welcome contributions from developers, security researchers, AI safety auditors, and legal experts worldwide.

---

## 1. Developer Certificate of Origin (DCO 1.1)

To ensure legal provenance, open-source integrity, and compliance with institutional standards, all contributions to ALPAR AI must include a **Developer Certificate of Origin (DCO)** sign-off.

By adding a `Signed-off-by` trailer to your git commit message, you certify the following:

```
Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.

Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it; and

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```

### Signing Your Commits
Use the `-s` or `--signoff` flag with `git commit`:

```bash
git commit -s -m "feat(telemetry): implement ISO/IEC 27037 hash chain validation"
```

This automatically appends:
```
Signed-off-by: Jane Doe <jane.doe@example.com>
```

---

## 2. Development Setup

ALPAR AI uses a modern, high-performance stack: Next.js 15 (App Router), React 19, Tailwind CSS v4, and PostgreSQL via DeHost.

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/quantummatrixcore-lab/alparai.git
   cd alparai
   ```
2. **Install dependencies:**
   ```bash
   pnpm install
   ```
3. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Configure local PostgreSQL connection, API keys, and test secrets
   ```
4. **Initialize database schema:**
   ```bash
   pnpm db:reset
   ```
5. **Start local development server:**
   ```bash
   pnpm dev
   # Server runs at http://localhost:3000
   ```

---

## 3. Sovereign Architectural Laws

Contributors must strictly respect the project's core architectural tenets:

* **Type Sovereignty:** The `any` keyword is an architectural violation. Use `unknown` and validate inputs strictly with Zod schemas. TypeScript strict mode (`noUncheckedIndexedAccess`) is enforced.
* **Mutation Isolation:** All state mutations must occur exclusively through Next.js Server Actions (`src/actions/<domain>.ts`). Client-side database inserts or mutations (`dehost.from().insert()`) are strictly forbidden.
* **Database Sovereignty & RLS:** Every new PostgreSQL table must be paired with Row Level Security (RLS) policies in the migration script, appended with a `-- ROLLBACK:` block.
* **PII Guardian Enforcement:** All user-generated text and telemetry must be scrubbed through `src/lib/pii/guardian.ts` prior to database ingress. Raw PII, Turkish TC Kimlik numbers, credit cards, or private API keys must never touch persistent storage.
* **Network & Port 22 Prohibition:** Port 22 is permanently prohibited across all environments. Do not propose configurations or scripts that open or rely on port 22.
* **Strict Internationalization (i18n):** User-facing text must never be hardcoded in UI components. All copy must be routed through `messages/en.json` (primary) and `messages/tr.json` (secondary).
* **CSS Architecture:** Tailwind v4 primitives only (`@theme inline` in `globals.css`). Do not introduce legacy `tailwind.config.ts`.
* **Root Hygiene:** Root directory contains exclusively international open-source and institutional showcase files (`README.md`, `README.tr.md`, `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `GOVERNANCE.md`, `CITATION.cff`). Documentation and proposals belong in `docs/`.

---

## 4. Quality Control & Mandatory Verification Pipeline

No pull request or commit will be merged without passing the local crucible:

```bash
# 1. Type check and code linting (zero warnings permitted)
pnpm lint && pnpm typecheck

# 2. Unit & Integration test suite
pnpm test

# 3. End-to-end user flow resilience tests
pnpm test:e2e
```

---

## 5. Branching & Deployment Governance

* `main` is the sole source of truth and must remain continuously deployable.
* **Branch Taxonomy:**
  - Feature work: `feat/<short-description>`
  - Bug fixes: `fix/<short-description>`
  - Hotfixes: `hotfix/<short-description>`
  - Documentation & Governance: `docs/<short-description>`
* **Production Deployments:**
  Production builds run only on commits whose messages contain the `[deploy]` marker (enforced by `scripts/deploy-gate.mjs`). Batch your commits and include `[deploy]` on the batch-closing commit only. Maximum 2 production deployment windows per day.

---

## 6. Commit Message Standards

We enforce [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short imperative description>

[optional body]

[optional footer(s)]
Signed-off-by: Full Name <email@domain.com>
```

**Permitted Types:**
* `feat`: New feature or user capability
* `fix`: Bug fix
* `docs`: Documentation, governance, or charter updates
* `refactor`: Code refactoring without behavioral mutation
* `perf`: Performance optimization (RAM, SQL, or network latency)
* `test`: Adding or correcting tests
* `chore`: Build tasks, dependency updates, pre-commit scripts

**Examples:**
* `feat(firewall): add in-memory zero-allocation proxy filter`
* `fix(pii): update Luhn checksum validation for international credit cards`
* `docs(governance): add UNCITRAL ODR and HMK m. 199 arbitration clauses`

---

## 7. Forensic Integrity & EU AI Act Protocol

When contributing incident data parsers, connector modules, or actuarial metrics:
1. **ISO/IEC 27037 Compliance:** Ensure forensic data capture mechanisms compute SHA-256 digests immediately upon acquisition.
2. **EU AI Act Article 73 Alignment:** Ensure incident reporting workflows honor the statutory 2/10/15-day escalation tiers.
3. **Adversarial Right of Reply:** Maintain telemetry fields supporting the mandatory 72-hour vendor rebuttal window.

---

## 8. Responsible Security Reporting

Vulnerabilities must not be disclosed via public GitHub issues. Please review [SECURITY.md](./SECURITY.md) and report security findings directly to:
* **Security Desk:** `security@alparai.com`
* **Chief Architect:** Ercüment Erden (`ercument.erden@alparai.com`)

---

## 9. Licensing Agreement

By contributing to ALPAR AI, you agree that your contributions are licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)** as detailed in [LICENSE](./LICENSE).

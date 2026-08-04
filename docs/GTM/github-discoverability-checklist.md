# GitHub Discoverability & Optimization Checklist

> **Purpose:** Ensure the ALPAR AI repository (`quantummatrixcore-lab/Alparai.com`) maximizes search discoverability, developer conversion, and open-source contribution readiness.

---

## Checklist Summary

- [x] **README Badges Audit**
- [x] **Repository Topics Definition**
- [ ] **CONTRIBUTING.md Path & URL Fixes** (Action Item Identified)
- [x] **Repository Metadata & Social Preview Audit**
- [x] **Issue & PR Template Audit**

---

## 1. README Badges & Visual Impact

### Current Status (`README.md`)
- [x] **CI Build Badge:** `[![CI]](https://github.com/quantummatrixcore-lab/Alparai.com/actions/workflows/ci.yml/badge.svg)`
- [x] **Security Workflow Badge:** `[![Security]](https://github.com/quantummatrixcore-lab/Alparai.com/actions/workflows/security.yml/badge.svg)`
- [x] **Deploy Status Badge:** `[![Deploy]](https://github.com/quantummatrixcore-lab/Alparai.com/actions/workflows/deploy.yml/badge.svg)`
- [x] **License Badge:** `[![AGPL-3.0]](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)`
- [x] **HackerOne VDP Badge:** `[![HackerOne VDP]](https://img.shields.io/badge/HackerOne-VDP-purple.svg)`

### Recommendations / Enhancements
- [ ] **Add Stars / Forks Shields:** Add `https://img.shields.io/github/stars/quantummatrixcore-lab/Alparai.com` once public launch occurs.
- [ ] **Add Next.js 15 / TypeScript Badge:** Highlighting strict modern tech stack for potential contributors.

---

## 2. GitHub Repository Topics

Set the following topics in the GitHub repository settings (`About` section) to optimize search discovery for open-source AI safety tools:

```text
ai-accountability
ai-safety
ai-incidents
trust-infrastructure
nextjs15
supabase
tailwind-v4
agpl-3
open-source
pii-guardian
```

---

## 3. `CONTRIBUTING.md` Audit & Action Items

### Findings
- **Outdated Repository URL:** `CONTRIBUTING.md` line 8 specifies `git clone https://github.com/your-fork/sikayetvar`.
  - **Fix Required:** Update repo URL to `https://github.com/your-fork/Alparai.com`.
- **Developer Workflow Verification:**
  - Setup commands (`pnpm install`, `cp .env.example .env.local`, `pnpm db:reset`, `pnpm dev`) are up to date.
  - Conventions for strict TypeScript, Tailwind v4, Server Actions, and bilingual copy (`messages/{en,tr}.json`) are clearly stated.
  - Security requirements (RLS, Zod validation, zero PII logging) are well articulated.

---

## 4. Repository Metadata & Social Preview

- **Repo Tagline:** *"Trust infrastructure for AI accountability. Community-driven incident reporting platform."*
- **Website URL:** `https://alparai.com`
- **Social Preview Image:** Ensure GitHub repository social preview image is uploaded (`docs/launch-assets/product_hunt_banner.png` or `docs/launch-assets/homepage.png`).

---

## 5. Verification Matrix

| Area | Status | Recommended Action |
| :--- | :--- | :--- |
| **README.md** | ✅ Excellent | Maintain current structure and architecture diagram. |
| **CONTRIBUTING.md** | ⚠️ Minor Fix Needed | Update legacy `sikayetvar` reference to `Alparai.com`. |
| **Repo Topics** | ⏳ Pending Config | Apply suggested 10 topics on GitHub repo settings. |
| **Social Preview** | ✅ Ready | Set repository preview banner image in GitHub settings. |

---

*Checklist Version: 1.0.0 | Last Updated: 2026-08-04*

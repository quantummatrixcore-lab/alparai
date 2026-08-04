# ALPAR AI - Google Antigravity Setup & Auto-Fix Guide

## 1. OVERVIEW

Google Antigravity is the autonomous software development and auto-fix engine of the AlparAI platform. It is configured to read findings from multi-model AI analysis reports and automatically correct code vulnerabilities, i18n deficiencies, and performance bottlenecks.

---

## 2. USAGE AND TRIGGERS

Antigravity can be triggered in the project in two main ways:

### A. Local Execution

To start the autonomous correction loop in the development environment:

```bash
# 1. Verify dependencies and environment variables
npm run typecheck

# 2. Run the Antigravity autonomous analysis and correction script
npm run dev
```

### B. CI/CD Automation (GitHub Actions)

The auto-fix workflow that runs every Monday at 09:00 or when triggered manually is defined in the `.github/workflows/antigravity-auto-fix.yml` file. This workflow:

1. Checks the latest changes and runs tests.
2. Consolidates multi-model analysis reports.
3. Automatically patches the code for Critical (P0) and High (P1) issues, runs tests, and creates a Pull Request (PR) if successful.

---

## 3. SECURITY AND GUARDRAILS

Antigravity is limited by the following rules when writing code autonomously:

- **PII Guardian:** No patch or logging operation may leak unmasked user PII (National ID, Email, Phone, etc.) to the database or third-party services.
- **RLS Security:** No SQL operations that bypass Row Level Security (RLS) policies or the database schema in the Supabase data layer can be executed.
- **Rollback Guarantee:** If any of the tests in `npm run typecheck`, `npm run lint`, or `npx vitest run` fail after code is written, Antigravity instantly rolls back all changes.

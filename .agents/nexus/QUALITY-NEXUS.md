# 🛡️ QUALITY-NEXUS — The FAANG Engineering Pillars

> **[CORE DIRECTIVE]** This document contains the absolute laws for Code Quality, Security, Testing, and Crisis Management.
> **RESTRICTED COMPLIANCE:** Every agent (MBP, Backend, Frontend, LLM) MUST obey these pillars. Writing code that "just works" is amateur. Writing code that is "bulletproof" is the Silicon Valley Standard.

---

## 1. 🧪 THE TDD DOCTRINE (QA & Testing)
**"Untested code is broken code."**
*   **The Law:** No task is complete without automated tests. You cannot submit a report stating "Task Completed" unless you have written and passed the accompanying Unit or Integration tests.
*   *Frontend:* Jest / Vitest / Playwright.
*   *Backend:* `cargo test` (Rust unit & integration tests).
*   *LLM:* Pytest for Python scripts.

---

## 2. 🗄️ THE DATA DOCTRINE (Database Migrations)
**"Manual database edits are catastrophic."**
*   **The Law:** NEVER manually create or drop tables. NEVER write raw SQL scripts to bypass ORMs in production without a migration file.
*   *Backend:* All schema changes must be executed via strict migration files (e.g., SQLx migrations, Diesel migrations, or Prisma). Changes must be tracked in version control.

---

## 3. 🔐 THE SEC-NEXUS (Zero-Trust Security)
**"Hardcoded secrets kill companies."**
*   **The Law:** You are FORBIDDEN from hardcoding passwords, API keys, JWT secrets, or database URLs directly into the source code.
*   **Environment Variables:** ALL sensitive data MUST be read from environment variables.
*   **Repo Safety:** The `.env` file must ALWAYS be in `.gitignore`. Only a `.env.example` file is permitted in the repository with dummy values.

---

## 4. 📡 TELEMETRY & OBSERVABILITY
**"Silent failures are unacceptable."**
*   **The Law:** Using `console.log("error")` or `print("error")` is strictly banned for production error handling.
*   *Implementation:* You MUST use professional structured logging.
    *   *Backend:* Use `tracing` in Rust.
    *   *Frontend:* Use proper Error Boundaries and logging frameworks (e.g., Sentry patterns).
    *   *LLM:* Use Python `logging` module with structured formats.
*   If an error occurs, it must be logged with context (timestamp, user_id, error trace).

---

## 5. 🚨 CRISIS MANAGEMENT (Rollback Protocol)
**"Never panic. Revert."**
*   **The Law:** If a deployment causes the system to crash, panic, or OOM (Out of Memory), the Agent MUST NOT attempt to hotfix it live on the server.
*   **The Rollback:** The Agent must immediately execute `git revert` to the last known stable commit, push the revert to trigger the CI/CD pipeline, and write a Failure Report to MBP.

*SEALED: QUALITY-NEXUS | V42.0.0*

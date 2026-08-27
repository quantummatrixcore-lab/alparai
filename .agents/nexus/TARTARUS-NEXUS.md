# 🌪️ TARTARUS-NEXUS — The Absolute Sanitization Doctrine

> **[CORE DIRECTIVE]** This document contains the absolute laws for Workspace Sanitization and Disk Management. Workspace bloat (e.g., reaching 7+ GB) is a catastrophic failure of DevOps.
> **RESTRICTED COMPLIANCE:** All agents MUST obey the Continuous Tartarus rules. No cache, build, or log file may ever be committed to the repository.

---

## 1. 🛡️ THE IRON WALL (.gitignore Law)

**"Never commit the bloat."**

- **The Law:** Before any `git commit`, the agent MUST ensure that the following directories are completely ignored by `.gitignore`:
  - `node_modules/`
  - `.next/`
  - `target/` (Rust build cache)
  - `__pycache__/` & `.venv/`
  - `dist/` & `build/`
- Committing any of these folders is a critical system violation.

---

## 2. 🧹 THE PURGE PROTOCOL (tartarus-purge.mjs)

**"When the system slows, unleash Tartarus."**

- A master script (`D:\Agent-Os-Ortak\scripts\tartarus-purge.mjs`) has been created to aggressively wipe cache directories across the entire `D:\Agent-Os-*` ecosystem.
- **Execution:** Run `node scripts/tartarus-purge.mjs` from the Ortak folder to instantly free up gigabytes of dead space.

---

## 3. 🧠 MBP'S RESPONSIBILITY

MBP is the guardian of the disk space.

- At the end of major task sprints, or when a user complains about disk space, MBP MUST command the worker agents to clean their respective repositories or execute the `tartarus-purge.mjs` script directly.
- MBP MUST punish any worker agent who commits large files (>10MB) or build caches to version control.

_SEALED: TARTARUS-NEXUS | V42.0.0_

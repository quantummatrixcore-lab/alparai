# PROPOSAL 029: Codebase Hygiene, Dead Code Elimination & Context Pruning

## 1. Concept & Rationale

As a codebase grows, orphaned files, unused exports, legacy documentation, and temporary scripts accumulate. For AI agents (Antigravity, Claude, Haiku), an overgrown codebase causes **context pollution**, leading to:

- Increased token consumption on every AST / file scan.
- Agent hallucinations (referencing deprecated functions or deleted tables).
- Slower build and typecheck execution times.

This proposal establishes a strict **Zero-Junk Engineering Protocol** to maintain maximum agent speed and precision.

## 2. Execution Pillars

### A. Dead Code Elimination (Ölü Kod ve Yetim Dosya Temizliği)

- **Tooling:** Run `knip` / `ts-prune` / `eslint` unused exports check.
- **Action:** Delete any unimported components, unused utility helpers, or abandoned API routes.
- **Principle:** Git commit history preserves all past code forever. Code that is not running in production **must not exist** in the `src/` tree.

### B. Documentation & Context Pruning (Ajan Bağlam Hijyeni)

- **Legacy Docs:** Move or archive obsolete analysis files (e.g., old 2024/2025 analysis reports) into `docs/ARCHIVE/`.
- **Scratch Files:** Ensure root and working directories remain 100% clean of temporary `.json`, `.js`, or `.log` files after task completion.
- **Rule Enforcement:** Keep `AGENTS.md` and `docs/BOOTSTRAP.md` ultra-lean so boot tokens stay under ~500 tokens.

### C. Knowledge Graph Sync (Graphify AST Maintenance)

- Run `graphify update .` after every cleanup session to ensure the knowledge graph AST contains zero dead nodes.
- When an agent queries `graphify query`, it receives answers from a 100% clean architectural map.

## 3. Master Plan Backlog Integration

This proposal backs Task #35 in `MASTER_PLAN.md` to run periodic automated dead-code scans and context-pruning sweeps.

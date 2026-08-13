---
trigger: always_on
description: MANDATORY — Use graphify knowledge graph for ALL codebase questions. Direct file reads > 10KB are PROHIBITED.
---

## Graphify (MANDATORY — VIOLATIONS WASTE TOKENS)

This project has a **live knowledge graph** at `graphify-out/`.
The graph auto-updates on every `git commit` via a pre-commit hook.

### Strict Rules:

1. **NEVER** read raw source files > 10KB to understand architecture. Use `graphify query "<question>"` instead.
2. **NEVER** read `graph.json` directly (3MB). Use CLI tools only.
3. For architecture questions: `graphify query "<question>"` (CLI) or `query_graph` (MCP).
4. For relationships: `graphify path "<A>" "<B>"` / `shortest_path`.
5. For concepts: `graphify explain "<concept>"` / `get_node`.
6. For broad overview: read `graphify-out/GRAPH_REPORT.md` (68KB, acceptable for full picture).
7. If `graphify-out/wiki/index.md` exists, navigate it instead of reading raw files.

### Graphify Freshness Protocol:

8. **After EVERY code modification** in a session, run `graphify update .` before your final response.
9. The pre-commit hook runs `graphify update .` automatically on `git commit`.
10. If the graph looks stale (check commit hash in GRAPH_REPORT.md header), run `graphify update .` immediately.

### Boot Sequence (New Agent):

1. Read `docs/BOOTSTRAP.md` (~500 tokens)
2. Use graphify queries for specific topics
3. Only read targeted file sections (line-limited, max 100 lines) when graphify points you there

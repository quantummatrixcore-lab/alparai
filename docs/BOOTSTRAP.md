# ALPAR AI — Agent Bootstrap (< 500 tokens)

## What is this?

AI accountability & trust platform. Next.js 15 + Supabase + Tailwind v4 + next-intl.
Live: https://alparai.com · Repo: GitHub quantummatrixcore-lab/Alparai.com · Hosted: Vercel (fra1)

## How to understand the codebase

This project has a **Graphify knowledge graph** at `graphify-out/`.
The graph auto-updates on every git commit (pre-commit hook).

1. Quick answer: `graphify query "<your question>"`
2. Relationship: `graphify path "<A>" "<B>"`
3. Deep dive: `graphify explain "<concept>"`
4. Full map (~20K tokens): read `graphify-out/GRAPH_REPORT.md`

## STRICT RULES

- NEVER read any file > 10KB without graphify query first
- NEVER read graph.json directly (3MB — use CLI tools)
- NEVER read docs/MASTER-ANALYSIS\*.md (DELETED — outdated June 22 data)
- After modifying code, run `graphify update .` (auto on commit, but run manually mid-session)

## Key entry points

- Pages: src/app/[locale]/
- Actions: src/actions/
- Components: src/components/
- DB migrations: supabase/migrations/
- Project rules: AGENTS.md
- i18n: messages/{en,tr}.json

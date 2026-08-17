# SKILL-1

**SKILL-1** — Wire the agent skills that nothing currently loads. Owner: Implementer. Priority: P1.

## Basis

Claude Code loads skills from `.claude/skills/`, which contains `tom` only. The repository's other
skills live in `.agents/skills/` — `bilge-kurul` (the wise council: Tesla, Einstein, Turing,
da Vinci, with working prompts and a parallel dispatch pattern) and `graphify` (nine reference
files) — and are therefore **read by nothing**.

This is not cosmetic. `CLAUDE.md` standing rule 2 instructs every session to "use graphify for
architecture questions (`graphify query "..."`)". That is a binding rule pointing at an unwired
tool, so either every session has been violating it or the rule has been silently inert.

## Work

Make both skills load. Either copy `.agents/skills/{bilge-kurul,graphify}/` into `.claude/skills/`,
or move them and leave `.agents/skills/` empty — the Implementer picks, but the same content must
not exist in two places afterwards, since divergent copies are how the three duplicate dispatchers
described in `docs/plan/v13.47-agent-hierarchy.md` came about.

## Acceptance

- A fresh session lists both `bilge-kurul` and `graphify` as available skills
- `graphify query "..."` runs, making `CLAUDE.md` rule 2 executable
- No duplicated skill directory remains

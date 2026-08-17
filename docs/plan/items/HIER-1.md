# HIER-1

**HIER-1** — Consolidate the three existing agent dispatchers into one declared command hierarchy.
Owner: Implementer. Priority: P1. Full specification: `docs/plan/v13.47-agent-hierarchy.md`.

## Basis

The Founder's requirement (2026-08-17): an admin-panel command hierarchy with Atatürk at the top,
dispatching work to specialists by domain — architecture to Mimar Sinan, engineering to Tesla,
security to Turing, interface to da Vinci.

The dispatcher already exists three times, mutually unaware: `.agents/personas/ceo.md`
("Supreme Commander … orchestrate the 11 departments"), `.agents/skills/bilge-kurul/SKILL.md`
("run the council members in parallel"), and `.agents/engines/engine-01-tom.json`
(capability-weighted dispatch). **Consolidate one — `bilge-kurul` is the right base. Do not write a
fourth.**

## Work

1. `.agents/hierarchy.json` — tier 0 (Atatürk, command) and tier 1 specialists, each bound to an
   existing role prompt file. Table of bindings in the specification.
2. Dispatch by keyword/domain map, not by model call. Classification is cheap; an LLM classifier is
   a later optimisation and only if the map measurably misroutes.
3. Admin surface under `/api/admin/`, never `/api/v1/`.
4. Reuse `src/lib/autopilot/` for queueing — 12 files, working, already depended on by 15 product
   files. Do not add a second queue.

## Not in scope

No "alignment percentage". `docs/plan/v13.47-agent-hierarchy.md` §5 records why "this agent is 95%
Atatürk" is unmeasurable and must not be published, and what falsifiable measurement replaces it
(source grounding against a published evaluation set). The figures in the Founder Directive reply
("70-80% → 95%+") are `ölçülmedi` and must not enter the repository as measured values.

`docs/PROPOSALS/015-ataturk-digital-twin.md` — the full Atatürk twin with a _Nutuk_ corpus and a
ten-agent swarm — is a separate project the proposal itself places outside this codebase. HIER-1 is
an internal development dispatcher, not that.

## Acceptance

- `.agents/hierarchy.json` exists and every entry resolves to a real prompt file
- A task string resolves to exactly one specialist
- No fourth dispatcher implementation was added

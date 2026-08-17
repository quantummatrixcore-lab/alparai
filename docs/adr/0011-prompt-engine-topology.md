# ADR-011: Prompt engine topology — one engine, named parts

- **Status:** Accepted
- **Date:** 2026-08-17
- **Decider:** Architect (Opus), on a directive requesting a new "S-Tier Prompt Engine" subsystem

## Context

A proposal arrived to architect a new prompt-engine subsystem with five components: a dynamic
metaprompt compiler, context compression and token allocation, deterministic contract enforcement
with self-healing retry, multi-agent memory protocols, and few-shot dynamic injection.

The repository was measured before designing anything. **Four of the five already exist and run.**
`src/lib/ai/` alone is 26 files and 4,276 lines.

| Requested component                      | Status     | Where it lives                                                                                                                                                              |
| ---------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent classification, role selection    | Built      | `src/lib/audit/model-router.ts` — `TaskDomain` (6 domains), `selectModelByCapability()`. `src/lib/ai/router.ts` (75 lines) — `analyzeComplexity()`, `ghostInferenceRoute()` |
| Metaprompt templating                    | Built      | `src/lib/ai/cross-audit/debate-prompts.ts` (147 lines) — four JSON-schema system prompts plus response DTOs; 28 files construct a `systemPrompt`                            |
| Contract enforcement, self-healing retry | Built      | `src/lib/autopilot/retry.ts` (91), `breaker.ts` (109), `idempotency.ts` (87), `policies.ts` (257)                                                                           |
| Schema validation                        | Built      | Zod in 20 files, 36 `safeParse()` call sites, `src/contracts/api.ts`                                                                                                        |
| Provider fallback, budget                | Built      | 6 adapters, 3 slot chains, `callWithFailover()`, `cost-guard.ts`, `autopilot/budget.ts`                                                                                     |
| **Semantic memory / retrieval**          | **Absent** | No embeddings, no pgvector, no RAG. Inference is stateless                                                                                                                  |
| Few-shot dynamic injection               | Absent     | No measured need                                                                                                                                                            |

`policies.ts` deserves specific mention because it is what the proposal asked to be designed: 16
named policies, each declaring retry attempts, backoff base and maximum, circuit-breaker threshold
and cooldown, a token and wall-clock budget, redaction fields, and an `onExhaust` action
(`silent_log`, `toast_warn`, `escalate_admin`).

## Decision

**There is one prompt engine. It is not rebuilt; it is extended at named seams.**

1. **`src/lib/autopilot/policies.ts` is the only place a retry, circuit-breaker or budget contract
   is declared.** New behaviour adds a policy entry. No second retry mechanism is introduced.
2. **`src/lib/audit/model-router.ts` owns domain → model selection.** `src/lib/ai/router.ts` owns
   complexity → tier. These are distinct axes and neither absorbs the other.
3. **Prompts follow the `debate-prompts.ts` pattern** — a templated constant, a response DTO, and a
   Zod parse of the model's output. Prompts are not written inline in a route or an action.
4. **Provider access goes through an adapter and a chain**, never a direct `fetch` to a model
   endpoint. Cost passes `cost-guard.ts`.
5. **Only the measured gap gets new construction:** semantic memory, scoped in
   `docs/plan/items/MEM-1.md`.

Explicitly **not** adopted: recursive context pruning, maximum-entropy token allocation, and
few-shot dynamic injection. No measurement in this repository shows they are needed, and
`analyzeComplexity()` with `budget.ts` covers the practical case today.

## Consequences

- The next agent asked to "build a prompt engine" finds this record and extends the existing one.
  That is the entire purpose of the ADR.
- This repository's dominant failure is duplicating what it already has: three mutually unaware
  dispatchers (`.agents/personas/ceo.md`, `.agents/skills/bilge-kurul/SKILL.md`,
  `.agents/engines/engine-01-tom.json`), 34 engine descriptors that are registry entries rather than
  code, `src/lib/agent-os/` imported by nine files and never written, and two public Digital Twins
  pages shipped without the library they import. A fifth engine would have joined that list.
- The claims above are re-checkable: every path and line count resolves against the tree at the time
  of writing. If a future reader finds one stale, the decision stands but the map needs refreshing.
- This ADR describes topology only. Any implementation it implies is a specification for the
  Implementer, per G-6.

## Correction (2026-08-17, same day)

The row above marking semantic memory **Absent** was measured against the tree before
`origin/master` advanced. At the **database layer it is wrong**: `20260816000000_agent_vector_memory.sql`
creates `agent_episodic_memory` with `pgvector`, an HNSW cosine index and a `match_agent_memory`
RPC, and `20260904000000_bilge_rag_memory.sql` exists alongside it.

The decision is unchanged, because what is absent is the **application code**: nothing in `src/`
writes to that table or calls that function. The schema is built and unwired — which makes the gap
smaller than stated, not different in kind. `MEM-1` is rescoped accordingly: wire the existing
table, do not create one.

Recorded rather than edited in place: an ADR that silently revises its own evidence is worth less
than one that shows where it was corrected.

## Related

- `docs/plan/items/MEM-1.md` — the one gap
- `docs/plan/items/HIER-1.md` — dispatcher consolidation, the same duplication problem
- `docs/MASTER_PLAN.md` §0 — why decisions belong here rather than in the board

# MEM-1

**MEM-1** — Semantic memory for agents. Owner: Implementer. Priority: P1 (after `DBTYPE-1` and
`AGENTOS-1`; the tree must be green first). Decision context: `docs/adr/0011-prompt-engine-topology.md`.

## Correction (2026-08-17, after measuring `origin/master`)

ADR-011 recorded semantic memory as absent. **At the database layer that is now wrong and is
corrected here.** Two migrations exist on `origin/master`:

- `supabase/migrations/20260816000000_agent_vector_memory.sql` — enables `pgvector`, creates
  `agent_episodic_memory` (`agent_id`, `session_id`, `content`, `metadata`,
  `embedding vector(1536)`), an HNSW cosine index, and a `match_agent_memory(query_embedding,
match_threshold, match_count, p_agent_id)` RPC.
- `supabase/migrations/20260904000000_bilge_rag_memory.sql`.

**What is still absent is the application code.** `grep embedding` across `src/` returns only
`models-catalog.ts` and `resources-catalog.ts`, which are model metadata and unrelated. Nothing
writes to `agent_episodic_memory` and nothing calls `match_agent_memory`. The schema is built and
unused — the same pattern as `.agents/skills/` being read by nothing, and as `docs/adr/` sitting
unreferenced since June.

So this item is smaller than first scoped: **no new table, no new migration.** Wire the existing one.

## Scope

**Do not create a table.** `agent_episodic_memory` exists. Confirm it is applied in production
before building against it — the `DBTYPE-1` incident showed migrations and the live schema can
diverge.

**Write path.** A server action that inserts `{agent_id, session_id, content, metadata, embedding}`,
declared as an entry in `src/lib/autopilot/policies.ts` so it reuses the existing retry, breaker and
budget machinery (ADR-011, decision 1). Content passes the PII Guardian before insert, like every
other free-text write.

**Read path.** `retrieveContext(query, agentId, k)` — embed the query, call the existing
`match_agent_memory` RPC, return the rows.

**Embeddings.** The table declares `vector(1536)`, with a comment noting Gemini would be 768. Pick
one and make the code and the column agree; the already-wired Google adapter
(`src/lib/ai/adapters/google.ts`) is the default, which means either changing the column to 768 in a
new migration or using a 1536-dimension provider. Record which, and why, in the commit.

**RLS.** The migration must be checked for policies. If `agent_episodic_memory` has none, that is a
finding in its own right — every table in this project carries RLS.

## Out of scope

Few-shot dynamic injection, recursive context pruning, and "maximum-entropy token allocation" — the
other items in the original proposal. `analyzeComplexity()` (`src/lib/ai/router.ts`) and
`autopilot/budget.ts` already cover the practical case, and nothing measured shows the rest is
needed. Add them when a measurement says so.

## Acceptance

- A fact written in one session is retrieved by semantic query in a later session without being
  restated — demonstrated, not asserted
- `agent_episodic_memory` confirmed present in the live database, with RLS policies
- Retrieval returns k rows ordered by similarity; `last_used_at` updates
- The write path appears as a policy in `policies.ts`; no new retry or breaker code exists
- RLS blocks unprivileged reads (negative test, per control C-1)
- Free text is masked by the PII Guardian before insert

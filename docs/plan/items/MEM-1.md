# MEM-1

**MEM-1** — Semantic memory for agents. Owner: Implementer. Priority: P1 (after `DBTYPE-1` and
`AGENTOS-1`; the tree must be green first). Decision context: `docs/adr/0011-prompt-engine-topology.md`.

## Why this and nothing else from the "Prompt Engine" proposal

Five subsystems were proposed. Four already exist and are mapped in ADR-011. This is the measured
gap: `grep` for `embedding|pgvector|vector|similarity` across `src/lib/` and
`supabase/migrations/` returns four incidental hits (models-catalog, resources-catalog, questions,
dedup) and **no vector store, no RAG, no episodic or semantic memory table**. Inference is
stateless — every call re-derives its context from scratch.

This is also the technical form of a problem the Founder raised directly: agents cannot carry
knowledge between sessions, so context has to be restated by hand each time. Durable rules already
travel through `CLAUDE.md` and `AGENTS.md`, and durable decisions now travel through `docs/adr/`.
What has no home is _derived_ knowledge — what an agent learned while working.

## Scope

Deliberately small. One table, one write path, one read path, no new provider.

**Migration** — `supabase/migrations/<timestamp>_agent_memory.sql`:

```sql
create extension if not exists vector;

create table public.agent_memory (
  id           uuid primary key default gen_random_uuid(),
  scope        text not null check (scope in ('session', 'project')),
  scope_key    text not null,
  content      text not null,
  embedding    vector(768) not null,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz
);

create index on public.agent_memory using ivfflat (embedding vector_cosine_ops);
create index on public.agent_memory (scope, scope_key);
```

RLS as with every other table — no anonymous read, admin client only for cross-scope access.

**Write path.** Through a new entry in `src/lib/autopilot/policies.ts`, reusing the existing retry,
breaker and budget machinery. Do **not** add a second retry mechanism (ADR-011, decision 1).
Content passes the PII Guardian before insert, like every other free-text write in this codebase.

**Read path.** `retrieveContext(query: string, scope, scopeKey, k = 5)` returning the top-k rows by
cosine similarity, and stamping `last_used_at`.

**Embeddings.** From the already-wired Google adapter (`src/lib/ai/adapters/google.ts`). No new
provider, no new key, no new cost surface.

## Out of scope

Few-shot dynamic injection, recursive context pruning, and "maximum-entropy token allocation" — the
other items in the original proposal. `analyzeComplexity()` (`src/lib/ai/router.ts`) and
`autopilot/budget.ts` already cover the practical case, and nothing measured shows the rest is
needed. Add them when a measurement says so.

## Acceptance

- A fact written in one session is retrieved by semantic query in a later session without being
  restated — demonstrated, not asserted
- Retrieval returns k rows ordered by similarity; `last_used_at` updates
- The write path appears as a policy in `policies.ts`; no new retry or breaker code exists
- RLS blocks unprivileged reads (negative test, per control C-1)
- Free text is masked by the PII Guardian before insert

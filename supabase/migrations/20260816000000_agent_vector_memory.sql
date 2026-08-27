-- Supabase Vector (pgvector) Uzun Süreli Hafıza (Episodic Memory) Kurulumu
-- Bu eklenti, Alparai Kurt Sürüsü'nün (Wolf Pack) tüm RAG ve vektörel hafıza işlemlerini yürütecektir.

-- 1. pgvector eklentisini aktif et
create extension if not exists vector;

-- 2. Ajanların episodik hafızasını tutacak tablo
create table if not exists agent_episodic_memory (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null, -- Örn: engine_tom, mimar_sinan, alan_turing
  session_id text not null,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  embedding vector(1536), -- OpenAI veya boyutuna göre (örneğin Gemini için 768) değişebilir
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Hızlı vektör araması için HNSW index (Half-space Navigable Small World)
create index on agent_episodic_memory using hnsw (embedding vector_cosine_ops);

-- 4. Arama Fonksiyonu (RPC)
create or replace function match_agent_memory (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_agent_id text default null
)
returns table (
  id uuid,
  agent_id text,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    id,
    agent_id,
    content,
    metadata,
    1 - (agent_episodic_memory.embedding <=> query_embedding) as similarity
  from agent_episodic_memory
  where 1 - (agent_episodic_memory.embedding <=> query_embedding) > match_threshold
    and (p_agent_id is null or agent_episodic_memory.agent_id = p_agent_id)
  order by agent_episodic_memory.embedding <=> query_embedding
  limit match_count;
$$;


-- RLS and Policies for agent_episodic_memory
ALTER TABLE public.agent_episodic_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users on agent_episodic_memory" ON public.agent_episodic_memory FOR SELECT USING (true);


-- ROLLBACK:
-- DROP TABLE IF EXISTS public.agent_episodic_memory CASCADE;

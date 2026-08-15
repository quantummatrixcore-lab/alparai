-- 20260907000000_decashub_sso_schema.sql
-- Unified Identity & Gamification Schema for ALPAR AI, Agent-OS, and DecasHub

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. User API Keys
CREATE TABLE IF NOT EXISTS user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL,
  api_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider_id)
);
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own API keys" ON user_api_keys;
CREATE POLICY "Users manage own API keys" ON user_api_keys USING (auth.uid() = user_id);

-- 2. Assessments
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea TEXT,
  scores JSONB NOT NULL,
  total_score INTEGER NOT NULL,
  verdict TEXT,
  provider TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own assessments" ON assessments;
CREATE POLICY "Users manage own assessments" ON assessments USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user ON assessments(user_id);

-- 3. Agents
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  specialty TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read agents" ON agents;
CREATE POLICY "Authenticated read agents" ON agents FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Agent Tasks
CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  task TEXT NOT NULL,
  result TEXT,
  model_used TEXT,
  tokens_used INTEGER DEFAULT 0,
  cost NUMERIC(10, 6) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own tasks" ON agent_tasks;
CREATE POLICY "Users manage own tasks" ON agent_tasks USING (auth.uid() = user_id);

-- 5. Grant Applications
CREATE TABLE IF NOT EXISTS grant_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program TEXT NOT NULL,
  provider TEXT NOT NULL,
  country TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE grant_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own grant apps" ON grant_applications;
CREATE POLICY "Users manage own grant apps" ON grant_applications USING (auth.uid() = user_id);

-- 6. System Metrics
CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role manages metrics" ON system_metrics;
CREATE POLICY "Service role manages metrics" ON system_metrics USING (auth.role() = 'service_role');

-- 7. Usage Counter Function
CREATE OR REPLACE FUNCTION increment_usage_count(expert_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE agents SET config = jsonb_set(
    COALESCE(config, '{}'),
    '{usage_count}',
    to_jsonb(COALESCE((config->>'usage_count')::int, 0) + 1)
  ) WHERE id = expert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Embeddings
CREATE TABLE IF NOT EXISTS embeddings (
  id BIGSERIAL PRIMARY KEY,
  content TEXT,
  embedding VECTOR(1536),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS embeddings_hnsw_idx ON embeddings USING hnsw (embedding vector_cosine_ops);
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

-- 9. Match Embeddings Function
CREATE OR REPLACE FUNCTION match_embeddings (
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    embeddings.id,
    embeddings.content,
    embeddings.metadata,
    1 - (embeddings.embedding <=> query_embedding) AS similarity
  FROM embeddings
  WHERE 1 - (embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- 10. Ledger
CREATE TABLE IF NOT EXISTS ledger (
  id uuid default gen_random_uuid() primary key,
  previous_hash text not null,
  data_hash text not null,
  data jsonb not null,
  created_at timestamptz default now() not null
);
CREATE INDEX IF NOT EXISTS ledger_data_hash_idx on ledger (data_hash);
CREATE INDEX IF NOT EXISTS ledger_previous_hash_idx on ledger (previous_hash);
ALTER TABLE ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to anyone" ON ledger;
CREATE POLICY "Allow read access to anyone" on ledger for select using (true);

-- 11. Gamification updates for 'profiles' table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'xp') THEN
        ALTER TABLE profiles ADD COLUMN xp INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'level') THEN
        ALTER TABLE profiles ADD COLUMN level INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'referral_code') THEN
        ALTER TABLE profiles ADD COLUMN referral_code TEXT UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'referred_by') THEN
        ALTER TABLE profiles ADD COLUMN referred_by UUID REFERENCES profiles(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'k_factor') THEN
        ALTER TABLE profiles ADD COLUMN k_factor FLOAT DEFAULT 0.0;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create stub tables for documents, projects, grants just to satisfy the DecasHub search/index scripts if they don't exist
CREATE TABLE IF NOT EXISTS documents (id UUID PRIMARY KEY, content TEXT, embedding VECTOR(1536));
CREATE TABLE IF NOT EXISTS projects (id UUID PRIMARY KEY, owner_id UUID);
CREATE TABLE IF NOT EXISTS grants (id UUID PRIMARY KEY, country TEXT, sector TEXT);

CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects (owner_id);
CREATE INDEX IF NOT EXISTS idx_grants_country_sector ON grants (country, sector);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;

-- 12. Hybrid Match Function
CREATE OR REPLACE FUNCTION match_documents_hybrid (
  query_text text,
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  rrf_k int default 60
)
RETURNS TABLE (id uuid, content text, similarity float, rank_score float)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH vector_results AS (
    SELECT d.id, 1.0 / (rrf_k + row_number() over (order by embedding <=> query_embedding)) as score
    FROM documents d
    ORDER BY embedding <=> query_embedding
    LIMIT match_count
  ),
  keyword_results AS (
    SELECT d.id, 1.0 / (rrf_k + row_number() over (order by ts_rank_cd(to_tsvector('english', content), plainto_tsquery('english', query_text)) desc)) as score
    FROM documents d
    WHERE to_tsvector('english', content) @@ plainto_tsquery('english', query_text)
    LIMIT match_count
  ),
  merged_results AS (
    SELECT coalesce(v.id, k.id) as id, coalesce(v.score, 0) + coalesce(k.score, 0) as total_score
    FROM vector_results v FULL OUTER JOIN keyword_results k on v.id = k.id
  )
  SELECT d.id, d.content, 0.0 as similarity, m.total_score as rank_score
  FROM merged_results m JOIN documents d on m.id = d.id
  ORDER BY m.total_score DESC
  LIMIT match_count;
END;
$$;

-- 13. Reputation and Governance
CREATE TABLE IF NOT EXISTS reputation (
  user_id uuid references auth.users not null primary key,
  points int default 0,
  level int default 1,
  badges jsonb default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
ALTER TABLE reputation ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public reputation" ON reputation;
CREATE POLICY "Public reputation" on reputation for select using (true);
DROP POLICY IF EXISTS "Users can update own reputation" ON reputation;
CREATE POLICY "Users can update own reputation" on reputation for update using (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS proposals (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  status text default 'active',
  creator_id uuid references auth.users not null,
  votes_for int default 0,
  votes_against int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  end_at timestamp with time zone not null
);
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public proposals" ON proposals;
CREATE POLICY "Public proposals" on proposals for select using (true);
DROP POLICY IF EXISTS "Authenticated users can create proposals" ON proposals;
CREATE POLICY "Authenticated users can create proposals" on proposals for insert with check (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS votes (
  id uuid default uuid_generate_v4() primary key,
  proposal_id uuid references proposals not null,
  user_id uuid references auth.users not null,
  vote_type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(proposal_id, user_id)
);
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public votes" ON votes;
CREATE POLICY "Public votes" on votes for select using (true);
DROP POLICY IF EXISTS "Authenticated users can vote" ON votes;
CREATE POLICY "Authenticated users can vote" on votes for insert with check (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS activities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users,
  type text not null,
  message text not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public activities" ON activities;
CREATE POLICY "Public activities" on activities for select using (true);
DROP POLICY IF EXISTS "System/Users can insert activities" ON activities;
CREATE POLICY "System/Users can insert activities" on activities for insert with check (true);

-- Drop trigger if it exists to allow re-running
DROP TRIGGER IF EXISTS on_vote_added ON votes;
CREATE OR REPLACE FUNCTION handle_new_vote() RETURNS trigger AS $$
BEGIN
  IF new.vote_type = 'for' THEN
    UPDATE proposals SET votes_for = votes_for + 1 WHERE id = new.proposal_id;
  ELSIF new.vote_type = 'against' THEN
    UPDATE proposals SET votes_against = votes_against + 1 WHERE id = new.proposal_id;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_vote_added AFTER INSERT ON votes FOR EACH ROW EXECUTE PROCEDURE handle_new_vote();

-- Note: supabase_realtime publication manipulation requires specific roles, skipping alter publication if it fails
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE activities;
    ALTER PUBLICATION supabase_realtime ADD TABLE proposals;
  EXCEPTION WHEN OTHERS THEN
    -- Ignore if already added or missing permission
  END;
END $$;

-- 14. Roles and Audit Logs
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users,
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read their own role" ON user_roles;
CREATE POLICY "Users can read their own role" ON user_roles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all logs" ON audit_logs;
CREATE POLICY "Admins can view all logs" ON audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN'))
);
DROP POLICY IF EXISTS "Users can insert logs" ON audit_logs;
CREATE POLICY "Users can insert logs" ON audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ROLLBACK:
-- DROP TABLE audit_logs; DROP TABLE user_roles; DROP TABLE activities; DROP TABLE votes; DROP TABLE proposals; DROP TABLE reputation; DROP TABLE ledger; DROP TABLE embeddings; DROP TABLE system_metrics; DROP TABLE grant_applications; DROP TABLE agent_tasks; DROP TABLE agents; DROP TABLE assessments; DROP TABLE user_api_keys;

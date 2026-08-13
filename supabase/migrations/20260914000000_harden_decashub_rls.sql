-- 20260914000000_harden_decashub_rls.sql
-- Harden RLS policies for DecasHub SSO schema tables (embeddings, profiles, documents, projects, grants)

-- ============================================================================
-- 1. EMBEDDINGS
-- ============================================================================
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read embeddings" ON embeddings;
CREATE POLICY "Public read embeddings" ON embeddings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role manages embeddings" ON embeddings;
CREATE POLICY "Service role manages embeddings" ON embeddings FOR ALL USING (auth.role() = 'service_role');

-- ROLLBACK:
-- DROP POLICY IF EXISTS "Service role manages embeddings" ON embeddings;
-- DROP POLICY IF EXISTS "Public read embeddings" ON embeddings;
-- ALTER TABLE embeddings DISABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 2. PROFILES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ROLLBACK:
-- DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
-- DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
-- DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 3. DOCUMENTS
-- ============================================================================
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read documents" ON documents;
CREATE POLICY "Public read documents" ON documents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role manages documents" ON documents;
CREATE POLICY "Service role manages documents" ON documents FOR ALL USING (auth.role() = 'service_role');

-- ROLLBACK:
-- DROP POLICY IF EXISTS "Service role manages documents" ON documents;
-- DROP POLICY IF EXISTS "Public read documents" ON documents;
-- ALTER TABLE documents DISABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 4. PROJECTS
-- ============================================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read projects" ON projects;
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users manage own projects" ON projects;
CREATE POLICY "Users manage own projects" ON projects FOR ALL USING (auth.uid() = owner_id);

-- ROLLBACK:
-- DROP POLICY IF EXISTS "Users manage own projects" ON projects;
-- DROP POLICY IF EXISTS "Public read projects" ON projects;
-- ALTER TABLE projects DISABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 5. GRANTS
-- ============================================================================
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read grants" ON grants;
CREATE POLICY "Public read grants" ON grants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role manages grants" ON grants;
CREATE POLICY "Service role manages grants" ON grants FOR ALL USING (auth.role() = 'service_role');

-- ROLLBACK:
-- DROP POLICY IF EXISTS "Service role manages grants" ON grants;
-- DROP POLICY IF EXISTS "Public read grants" ON grants;
-- ALTER TABLE grants DISABLE ROW LEVEL SECURITY;

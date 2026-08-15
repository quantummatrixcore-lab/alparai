-- Migration: Ecosystem Scout
-- Creates table to store intelligent alerts from global AI ecosystem.

CREATE TABLE agent_ecosystem_intel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL, -- e.g., 'GitHub', 'Reddit', 'HackerNews', 'OpenRouter'
    intel_type TEXT NOT NULL, -- e.g., 'new_model', 'repo_trending', 'api_pricing_drop'
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_actioned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE agent_ecosystem_intel ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins have full access to ecosystem intel"
    ON agent_ecosystem_intel
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin' OR (SELECT is_admin FROM users WHERE id = auth.uid()) = true);

-- Nobody else can read or write
CREATE POLICY "Deny read to public/users"
    ON agent_ecosystem_intel
    FOR SELECT
    TO public
    USING (false);

-- Trigger for updated_at
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON agent_ecosystem_intel
    FOR EACH ROW
    EXECUTE FUNCTION moddatetime (updated_at);

-- ROLLBACK:
-- DROP TABLE IF EXISTS agent_ecosystem_intel CASCADE;

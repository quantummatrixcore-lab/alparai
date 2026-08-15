-- Migration: Twins & Persona Analytics for Creator Economy

CREATE TABLE persona_usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    twin_id TEXT NOT NULL,
    developer_id UUID REFERENCES auth.users(id), -- Creator of the persona (null if ALPAR AI official)
    consumer_id UUID REFERENCES auth.users(id), -- Who called the API
    model_used TEXT NOT NULL,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    billed_amount_cents INTEGER DEFAULT 0, -- How much we charged the consumer
    cost_amount_cents INTEGER DEFAULT 0, -- How much it cost us (Arbitrage)
    developer_share_cents INTEGER DEFAULT 0, -- 70% share for external developer
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices for leaderboard querying
CREATE INDEX idx_persona_usage_twin_id ON persona_usage_stats(twin_id);
CREATE INDEX idx_persona_usage_created_at ON persona_usage_stats(created_at);

-- RLS
ALTER TABLE persona_usage_stats ENABLE ROW LEVEL SECURITY;

-- Developers can view their own persona stats
CREATE POLICY "Developers can view their persona stats"
    ON persona_usage_stats
    FOR SELECT
    TO authenticated
    USING (developer_id = auth.uid());

-- Consumers can view their own usage
CREATE POLICY "Consumers can view their usage"
    ON persona_usage_stats
    FOR SELECT
    TO authenticated
    USING (consumer_id = auth.uid());

-- Admin can view all
CREATE POLICY "Admins full access to persona stats"
    ON persona_usage_stats
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin' OR (SELECT is_admin FROM users WHERE id = auth.uid()) = true);

-- ROLLBACK:
-- DROP TABLE IF EXISTS persona_usage_stats CASCADE;

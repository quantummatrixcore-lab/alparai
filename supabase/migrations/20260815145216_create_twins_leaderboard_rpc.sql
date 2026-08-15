-- Migration: Create Twins Leaderboard RPC
-- Description: Groups persona_usage_stats by twin_id to rank agents by usage and generated tokens.

CREATE OR REPLACE FUNCTION get_twins_leaderboard()
RETURNS TABLE (
    twin_id UUID,
    total_uses BIGINT,
    total_tokens_generated BIGINT,
    last_used_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        twin_id,
        COUNT(*) as total_uses,
        COALESCE(SUM(tokens_generated), 0) as total_tokens_generated,
        MAX(created_at) as last_used_at
    FROM 
        persona_usage_stats
    GROUP BY 
        twin_id
    ORDER BY 
        total_tokens_generated DESC,
        total_uses DESC;
$$;

-- ROLLBACK:
-- DROP FUNCTION IF EXISTS get_twins_leaderboard();

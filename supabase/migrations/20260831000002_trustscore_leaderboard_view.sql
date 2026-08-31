-- PRODUCTION SEED
-- Migration: Create TrustScore Leaderboard View
-- Matches /methodology logic: Start at 100, deduct points based on incident severity.
-- High = 10 pts, Medium = 5 pts, Low = 2 pts.

CREATE OR REPLACE VIEW public.provider_leaderboard AS
SELECT 
    p.id AS provider_id,
    p.name AS provider_name,
    p.logo_url,
    p.website_url,
    COUNT(i.id) AS total_incidents,
    COALESCE(SUM(
        CASE 
            WHEN i.severity = 'critical' THEN 15
            WHEN i.severity = 'high' THEN 10
            WHEN i.severity = 'medium' THEN 5
            WHEN i.severity = 'low' THEN 2
            ELSE 0
        END
    ), 0) AS total_penalty,
    GREATEST(0, 100 - COALESCE(SUM(
        CASE 
            WHEN i.severity = 'critical' THEN 15
            WHEN i.severity = 'high' THEN 10
            WHEN i.severity = 'medium' THEN 5
            WHEN i.severity = 'low' THEN 2
            ELSE 0
        END
    ), 0)) AS trust_score,
    MAX(i.incident_date) AS last_incident_date
FROM 
    public.ai_providers p
LEFT JOIN 
    public.incidents i ON p.id = i.ai_provider_id AND i.status = 'verified'
GROUP BY 
    p.id, p.name, p.logo_url, p.website_url;

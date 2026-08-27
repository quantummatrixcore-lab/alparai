-- LB-1a RLS
ALTER TABLE ai_provider_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moderators can insert public statements"
  ON ai_provider_responses
  FOR INSERT
  WITH CHECK (
    response_type = 'public_statement' AND
    auth.jwt() ->> 'role' = 'moderator'
  );

-- FUND-1 Schema
ALTER TABLE grant_applications
  ADD COLUMN IF NOT EXISTS amount_granted NUMERIC,
  ADD COLUMN IF NOT EXISTS date_applied TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS amount_requested NUMERIC,
  ADD COLUMN IF NOT EXISTS decision TEXT,
  ADD COLUMN IF NOT EXISTS date_decided TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP WITH TIME ZONE;


-- ROLLBACK:
-- -- Add rollback statements here

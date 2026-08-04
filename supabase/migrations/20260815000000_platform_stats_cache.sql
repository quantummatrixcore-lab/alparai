-- Item 154: Platform Statistics Cache Table & Auto-Update Triggers
CREATE TABLE IF NOT EXISTS platform_statistics (
  stat_key text PRIMARY KEY,
  stat_value bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE platform_statistics ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for dashboard & metrics display)
CREATE POLICY "Allow public read of platform_statistics"
  ON platform_statistics FOR SELECT
  USING (true);

-- Function to safely update a stat key
CREATE OR REPLACE FUNCTION set_platform_stat(p_key text, p_val bigint)
RETURNS void AS $$
BEGIN
  INSERT INTO platform_statistics (stat_key, stat_value, updated_at)
  VALUES (p_key, p_val, now())
  ON CONFLICT (stat_key)
  DO UPDATE SET stat_value = EXCLUDED.stat_value, updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for incidents table count updates
CREATE OR REPLACE FUNCTION refresh_incidents_stat()
RETURNS trigger AS $$
BEGIN
  PERFORM set_platform_stat(
    'total_incidents',
    (SELECT count(*) FROM incidents WHERE status = 'published')
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to incidents table
DROP TRIGGER IF EXISTS trigger_refresh_incidents_stat ON incidents;
CREATE TRIGGER trigger_refresh_incidents_stat
AFTER INSERT OR DELETE OR UPDATE OF status ON incidents
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_incidents_stat();

-- Initial seed of stats
SELECT set_platform_stat('total_incidents', (SELECT count(*) FROM incidents WHERE status = 'published'));
SELECT set_platform_stat('total_providers', (SELECT count(*) FROM ai_providers));
SELECT set_platform_stat('total_models', (SELECT count(*) FROM ai_models));

-- ROLLBACK:
-- DROP TRIGGER IF EXISTS trigger_refresh_incidents_stat ON incidents;
-- DROP FUNCTION IF EXISTS refresh_incidents_stat();
-- DROP FUNCTION IF EXISTS set_platform_stat(text, bigint);
-- DROP POLICY IF EXISTS "Allow public read of platform_statistics" ON platform_statistics;
-- DROP TABLE IF EXISTS platform_statistics;

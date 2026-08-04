-- =============================================================================
-- Scheduled Cron Jobs via pg_cron & pg_net
-- =============================================================================
-- Enables the required extensions and configures the native cron job
-- schedules to trigger the Vercel API endpoints securely.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create helper function to trigger the cron jobs
CREATE OR REPLACE FUNCTION public.trigger_cron_job(cron_path text)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_secret text;
  v_request_id bigint;
  v_url text;
BEGIN
  -- Get secret from vault
  SELECT decrypted_secret INTO v_secret
  FROM vault.decrypted_secrets
  WHERE name = 'cron_secret';

  IF v_secret IS NULL THEN
    RAISE EXCEPTION 'cron_secret not found in vault';
  END IF;

  v_url := 'https://www.alparai.com' || cron_path;

  -- Trigger HTTP GET request
  SELECT net.http_get(
    url := v_url,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_secret,
      'x-vercel-cron', '1'
    ),
    timeout_milliseconds := 30000
  ) INTO v_request_id;

  RETURN v_request_id;
END;
$$;

-- Schedule the cron jobs
SELECT cron.schedule('translate-backfill-cron', '*/10 * * * *', 'SELECT public.trigger_cron_job(''/api/cron/translate-backfill'');');
SELECT cron.schedule('moderation-sla-alarm-cron', '0 0 * * *', 'SELECT public.trigger_cron_job(''/api/cron/moderation-sla-alarm'');');
SELECT cron.schedule('k-provider-preview-cron', '0 1 * * *', 'SELECT public.trigger_cron_job(''/api/cron/k-provider-preview'');');
SELECT cron.schedule('import-incidents-aiaaic-cron', '0 2 * * *', 'SELECT public.trigger_cron_job(''/api/cron/import-incidents?source=aiaaic'');');
SELECT cron.schedule('k-model-retirement-cron', '0 2 * * *', 'SELECT public.trigger_cron_job(''/api/cron/k-model-retirement'');');
SELECT cron.schedule('import-incidents-aiid-cron', '0 3 * * *', 'SELECT public.trigger_cron_job(''/api/cron/import-incidents?source=aiid'');');
SELECT cron.schedule('process-deletions-cron', '0 3 * * *', 'SELECT public.trigger_cron_job(''/api/cron/process-deletions'');');
SELECT cron.schedule('hard-delete-cron', '0 3 * * *', 'SELECT public.trigger_cron_job(''/api/cron/hard-delete'');');
SELECT cron.schedule('fetch-external-cron', '0 4 * * *', 'SELECT public.trigger_cron_job(''/api/cron/fetch-external'');');
SELECT cron.schedule('retro-audit-cron', '0 5 * * *', 'SELECT public.trigger_cron_job(''/api/cron/retro-audit'');');
SELECT cron.schedule('cost-alarm-cron', '0 6 * * *', 'SELECT public.trigger_cron_job(''/api/cron/cost-alarm'');');
SELECT cron.schedule('k-weekly-refresh-cron', '0 8 * * 0', 'SELECT public.trigger_cron_job(''/api/cron/k-weekly-refresh'');');
SELECT cron.schedule('kill-metric-cron', '0 8 9 8 *', 'SELECT public.trigger_cron_job(''/api/cron/kill-metric'');');
SELECT cron.schedule('pivot-check-cron', '0 8 1 9 *', 'SELECT public.trigger_cron_job(''/api/cron/pivot-check'');');
SELECT cron.schedule('generate-marketing-cron', '0 9 * * *', 'SELECT public.trigger_cron_job(''/api/cron/generate-marketing'');');
SELECT cron.schedule('newsletter-cron', '0 10 * * 1', 'SELECT public.trigger_cron_job(''/api/cron/newsletter'');');

-- -- ROLLBACK:
-- SELECT cron.unschedule('translate-backfill-cron');
-- SELECT cron.unschedule('moderation-sla-alarm-cron');
-- SELECT cron.unschedule('k-provider-preview-cron');
-- SELECT cron.unschedule('import-incidents-aiaaic-cron');
-- SELECT cron.unschedule('k-model-retirement-cron');
-- SELECT cron.unschedule('import-incidents-aiid-cron');
-- SELECT cron.unschedule('process-deletions-cron');
-- SELECT cron.unschedule('hard-delete-cron');
-- SELECT cron.unschedule('fetch-external-cron');
-- SELECT cron.unschedule('retro-audit-cron');
-- SELECT cron.unschedule('cost-alarm-cron');
-- SELECT cron.unschedule('k-weekly-refresh-cron');
-- SELECT cron.unschedule('kill-metric-cron');
-- SELECT cron.unschedule('pivot-check-cron');
-- SELECT cron.unschedule('generate-marketing-cron');
-- SELECT cron.unschedule('newsletter-cron');
-- DROP FUNCTION IF EXISTS public.trigger_cron_job(text);

-- Migration: Rollback seed outreach queue items to ensure 100% strict empirical truth (v11.97 compliance)
-- Timestamp: 20260729000004
-- ROLLBACK: SELECT 1;

DELETE FROM public.outreach_queue 
WHERE recipient_email IN (
  'daniel@danielmiessler.com', 
  'contact@yoshuabengio.org', 
  'info@futureoflife.org', 
  'jack@importai.net', 
  'contact@safe.ai', 
  'press@eff.org'
);

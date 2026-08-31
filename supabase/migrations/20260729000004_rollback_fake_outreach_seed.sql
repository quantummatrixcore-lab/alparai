-- PRODUCTION SEED\n-- Migration: Rollback seed outreach queue items to ensure 100% strict empirical truth (v11.97 compliance)
-- Timestamp: 20260729000004
-- ROLLBACK: SELECT 1;

DELETE FROM public.outreach_queue 
WHERE recipient_email IN (
  '[REDACTED_EMAIL]', 
  '[REDACTED_EMAIL]', 
  '[REDACTED_EMAIL]', 
  '[REDACTED_EMAIL]', 
  '[REDACTED_EMAIL]', 
  '[REDACTED_EMAIL]'
);

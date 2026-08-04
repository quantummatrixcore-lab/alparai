-- Migration: Rollback linkedin_contacts status to 'to_add' and delete non-seed contacts in full compliance with v11.100 specification
-- Timestamp: 20260729000007
-- ROLLBACK: SELECT 1;

DELETE FROM public.linkedin_contacts 
WHERE full_name IN (
  'Yacine Jernite', 
  'Sean McGregor', 
  'Daniel Miessler', 
  'Rumman Chowdhury', 
  'Aviv Ovadya', 
  'Sven Cattell', 
  'Irene Solaiman'
);

UPDATE public.linkedin_contacts 
SET status = 'to_add' 
WHERE status = 'added';

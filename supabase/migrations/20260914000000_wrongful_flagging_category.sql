-- Migration: 20260914000000_wrongful_flagging_category.sql
-- Description: Add the 'wrongful_flagging' value to the incident_category enum.
--
-- This category records cases where an AI-detection system flagged human-written
-- work as machine-generated. It is a distinct incident type rather than a variant
-- of an existing one: the reporter is the person harmed by the model's output
-- about them, not a user of the model, and the accused party is a detector whose
-- error rate no vendor publishes.
--
-- Required by src/actions/report-flagging.ts, which inserts with this category and
-- currently fails typecheck because the value does not exist.

alter type public.incident_category
  add value if not exists 'wrongful_flagging';


-- ROLLBACK:
-- -- Add rollback statements here

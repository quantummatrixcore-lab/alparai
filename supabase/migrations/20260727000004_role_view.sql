-- Migration: Add role_view column to users table
-- Description: Adds role_view for role-based dashboard views with rollback path.

alter table public.users add column role_view text;

-- ROLLBACK:
-- alter table public.users drop column if exists role_view;

-- Migration: Add instructor role to user_role enum
-- Description: Registers instructor role type with safe rollback documentation.

-- Add value to the enum type
alter type public.user_role add value 'instructor';

-- ROLLBACK:
-- Note: PostgreSQL does not support dropping enum values easily. 
-- To rollback:
-- CREATE TYPE public.user_role_old AS ENUM ('user', 'moderator', 'admin', 'ceo');
-- ALTER TABLE public.users ALTER COLUMN role TYPE public.user_role_old USING role::text::public.user_role_old;
-- DROP TYPE public.user_role;
-- ALTER TYPE public.user_role_old RENAME TO user_role;

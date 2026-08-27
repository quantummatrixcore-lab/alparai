-- Fix Critical Privilege Escalation Vulnerability (Users modifying their own roles and verification status)
-- Replaces the flawed "Users can update their own profile" policy

BEGIN;

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    -- 🔴 CRITICAL FIX: Users cannot change their own 'role' or 'is_verified' status.
    AND role = (SELECT role FROM public.users WHERE id = auth.uid())
    AND is_verified = (SELECT is_verified FROM public.users WHERE id = auth.uid())
    AND email = (SELECT email FROM public.users WHERE id = auth.uid())
  );

COMMIT;

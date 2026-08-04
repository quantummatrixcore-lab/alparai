-- Migration: Create redaction_requests table for provider name redaction workflow
-- Description: Creates the table, adds RLS policies, and enables moderator review.

CREATE TABLE IF NOT EXISTS public.redaction_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.ai_providers(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.redaction_requests ENABLE ROW LEVEL SECURITY;

-- Read policy (moderators and the user who requested it? Since request doesn't have user_id, it is created by admin/mods, or readable by public if we want)
-- Let's make it readable by public so UI check can show request status
CREATE POLICY "Allow public read access to redaction_requests" ON public.redaction_requests
    FOR SELECT USING (true);

-- Write policies (moderators only)
CREATE POLICY "Allow mod all access to redaction_requests" ON public.redaction_requests
    FOR ALL USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.redaction_requests;

-- Migration: Outreach Queue table
-- Create outreach_queue table for J2a outreach automation

CREATE TABLE IF NOT EXISTS public.outreach_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    template_type TEXT NOT NULL CHECK (template_type IN ('media', 'expert')),
    subject TEXT NOT NULL,
    body_template TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'sent', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.outreach_queue ENABLE ROW LEVEL SECURITY;

-- Read/Write policies (moderators only)
CREATE POLICY "Allow mod all access to outreach_queue" ON public.outreach_queue
    FOR ALL USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.outreach_queue;

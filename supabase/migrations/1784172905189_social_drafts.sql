-- Migration: Social Accounts and Marketing Drafts
-- Date: 2026-07-16

CREATE TABLE IF NOT EXISTS public.social_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform TEXT NOT NULL, -- e.g., 'linkedin', 'twitter'
    account_name TEXT,
    connection_status TEXT DEFAULT 'disconnected', -- 'connected', 'disconnected', 'pending'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketing_drafts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform TEXT NOT NULL,
    content TEXT,
    media_url TEXT,
    status TEXT DEFAULT 'draft', -- 'draft', 'approved', 'published', 'rejected'
    scheduled_for TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_drafts ENABLE ROW LEVEL SECURITY;

-- Only admins/ceos can manage social accounts and drafts
CREATE POLICY "Admins can manage social accounts" 
    ON public.social_accounts 
    FOR ALL 
    USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'ceo')));

CREATE POLICY "Admins can manage marketing drafts" 
    ON public.marketing_drafts 
    FOR ALL 
    USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'ceo')));

-- Give service role full access
CREATE POLICY "Service role full access social accounts"
    ON public.social_accounts
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access marketing drafts"
    ON public.marketing_drafts
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.marketing_drafts;
-- DROP TABLE IF EXISTS public.social_accounts;

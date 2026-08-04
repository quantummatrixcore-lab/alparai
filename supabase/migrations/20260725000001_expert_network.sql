-- Migration: Expert Network & K-Product tables
-- Create expert_network and add verification fields to incidents

CREATE TABLE IF NOT EXISTS public.expert_network (
    id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    title TEXT,
    institution TEXT,
    specialties TEXT[] DEFAULT '{}'::TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add verification fields to incidents
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS expert_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS expert_verifier_id UUID REFERENCES public.expert_network(id) ON DELETE SET NULL;

-- Enable RLS on expert_network
ALTER TABLE public.expert_network ENABLE ROW LEVEL SECURITY;

-- Read policies (everyone)
CREATE POLICY "Allow public read access to expert_network" ON public.expert_network
    FOR SELECT USING (true);

-- Write policies (moderators only)
CREATE POLICY "Allow mod all access to expert_network" ON public.expert_network
    FOR ALL USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));

-- Trigger to restrict expert_verified field updates on incidents to active experts or moderators
CREATE OR REPLACE FUNCTION public.check_incident_verification_auth()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.expert_verified IS DISTINCT FROM OLD.expert_verified) OR 
       (NEW.expert_verifier_id IS DISTINCT FROM OLD.expert_verifier_id) THEN
        
        -- Allow if current user is moderator
        IF public.is_moderator(auth.uid()) THEN
            RETURN NEW;
        END IF;

        -- Require active expert status
        IF NOT EXISTS (
            SELECT 1 FROM public.expert_network
            WHERE id = auth.uid() AND is_active = true
        ) THEN
            RAISE EXCEPTION 'Only active expert network members can verify incidents';
        END IF;

        -- Automatically set verifier ID to expert's ID
        IF NEW.expert_verified = true AND NEW.expert_verifier_id IS NULL THEN
            NEW.expert_verifier_id := auth.uid();
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER check_incident_verification_trigger
    BEFORE UPDATE ON public.incidents
    FOR EACH ROW
    EXECUTE FUNCTION public.check_incident_verification_auth();

-- Paid-tier (K-Product) fields in public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pilot', 'enterprise'));

-- ROLLBACK:
-- DROP TRIGGER IF EXISTS check_incident_verification_trigger ON public.incidents;
-- DROP FUNCTION IF EXISTS public.check_incident_verification_auth();
-- ALTER TABLE public.incidents DROP COLUMN IF EXISTS expert_verified;
-- ALTER TABLE public.incidents DROP COLUMN IF EXISTS expert_verifier_id;
-- DROP TABLE IF EXISTS public.expert_network;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS stripe_customer_id;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS subscription_tier;

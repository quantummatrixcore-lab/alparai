-- =============================================================================
-- Migration: Incident Translations Table (i18n Expansion Phase L1 - DE+FR)
-- Table: incident_translations
-- Features: Unique (incident_id, locale), RLS Policies, Rollback Block
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.incident_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    locale TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    machine_translated BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_incident_translations_locale UNIQUE (incident_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_incident_translations_lookup ON public.incident_translations(incident_id, locale);

ALTER TABLE public.incident_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read incident_translations"
    ON public.incident_translations FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Admin full access incident_translations"
    ON public.incident_translations FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- -- ROLLBACK:
-- DROP POLICY IF EXISTS "Admin full access incident_translations" ON public.incident_translations;
-- DROP POLICY IF EXISTS "Public read incident_translations" ON public.incident_translations;
-- DROP TABLE IF EXISTS public.incident_translations;

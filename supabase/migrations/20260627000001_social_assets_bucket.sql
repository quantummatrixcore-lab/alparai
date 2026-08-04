-- Migration: Create social-assets storage bucket
-- Timestamp: 2026-06-27 00:00:01

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'social-assets',
  'social-assets',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for social-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'social-assets');

CREATE POLICY "Authenticated users can upload social-assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'social-assets'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update their own social-assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'social-assets'
  );

CREATE POLICY "Moderators/Admins can delete social-assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'social-assets'
    AND (
      public.is_moderator(auth.uid()) 
      OR EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
          AND (users.role = 'admin' OR users.role = 'ceo')
      )
    )
  );

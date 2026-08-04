-- =============================================================================
-- Storage Buckets + Policies (v1.0.0)
-- =============================================================================
-- Evidence bucket for incident attachments.
-- Avatars bucket for user profile pictures.
-- =============================================================================

-- ============================================================================
-- Evidence bucket
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'evidence',
  'evidence',
  true,                                    -- public read for published incidents
  10485760,                                -- 10 MB
  array['image/jpeg','image/png','image/webp','image/gif','image/heic','video/mp4','video/webm','application/pdf']
)
on conflict (id) do nothing;

create policy "Public read access for evidence bucket"
  on storage.objects for select
  using (bucket_id = 'evidence');

create policy "Authenticated users can upload evidence"
  on storage.objects for insert
  with check (
    bucket_id = 'evidence'
    and auth.uid() is not null
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own evidence files"
  on storage.objects for update
  using (
    bucket_id = 'evidence'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Moderators can delete evidence"
  on storage.objects for delete using (public.is_moderator(auth.uid()));

-- ============================================================================
-- Avatars bucket
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,                                 -- 2 MB
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do nothing;

create policy "Public read access for avatars"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

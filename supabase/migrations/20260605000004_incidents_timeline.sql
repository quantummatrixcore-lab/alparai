-- Add published_at and moderated_at to incidents for proper timeline ordering.
-- reviewed_at stays for general review state.
alter table public.incidents
  add column if not exists published_at timestamptz,
  add column if not exists moderated_at timestamptz,
  add column if not exists moderation_note text;

create index if not exists idx_incidents_published_at
  on public.incidents (published_at desc)
  where status = 'published';

create index if not exists idx_incidents_status_published
  on public.incidents (status, published_at desc);

-- Backfill: incidents already in 'published' state get their created_at as published_at.
update public.incidents
  set published_at = created_at
  where status = 'published' and published_at is null;

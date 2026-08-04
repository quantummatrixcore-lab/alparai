create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_name text not null,
  badge_icon text not null,
  description text,
  awarded_at timestamptz not null default now(),
  unique(user_id, badge_name)
);

-- RLS
alter table public.user_badges enable row level security;

create policy "Users can view their own badges"
  on public.user_badges for select
  using ( auth.uid() = user_id );

create policy "Everyone can view badges"
  on public.user_badges for select
  using ( true );

-- Insert trigger for points/levels could go here later if we add a user_profiles table.

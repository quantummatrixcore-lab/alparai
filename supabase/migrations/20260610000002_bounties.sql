-- Migration: Bug Bounty System (2026-06-10)
-- AI accountability bounty system: validated incidents earn badges + reward claims

create table if not exists public.bug_bounties (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  reporter_id uuid not null references public.users(id) on delete cascade,
  provider_id uuid references public.ai_providers(id) on delete set null,
  status text not null default 'open'
    check (status in ('open', 'validated', 'claimed', 'paid', 'rejected', 'expired')),
  severity_score integer not null default 0
    check (severity_score between 0 and 100),
  estimated_reward_cents integer default 0,
  actual_reward_cents integer default 0,
  badge_awarded boolean not null default false,
  notes text,
  validated_by uuid references public.users(id) on delete set null,
  validated_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(incident_id, reporter_id)
);

-- Index for fast lookups
create index if not exists idx_bounties_status on public.bug_bounties(status, created_at desc);
create index if not exists idx_bounties_reporter on public.bug_bounties(reporter_id, created_at desc);
create index if not exists idx_bounties_provider on public.bug_bounties(provider_id, status);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_bounties_updated_at on public.bug_bounties;
create trigger trg_bounties_updated_at
  before update on public.bug_bounties
  for each row execute function public.set_updated_at();

-- RLS: anyone can read validated/paid bounties, reporter can see own, moderator+ can update
alter table public.bug_bounties enable row level security;

drop policy if exists "bounties_public_read" on public.bug_bounties;
create policy "bounties_public_read" on public.bug_bounties
  for select using (status in ('validated', 'claimed', 'paid'));

drop policy if exists "bounties_reporter_read" on public.bug_bounties;
create policy "bounties_reporter_read" on public.bug_bounties
  for select using (reporter_id = auth.uid());

drop policy if exists "bounties_reporter_insert" on public.bug_bounties;
create policy "bounties_reporter_insert" on public.bug_bounties
  for insert with check (reporter_id = auth.uid());

drop policy if exists "bounties_mod_update" on public.bug_bounties;
create policy "bounties_mod_update" on public.bug_bounties
  for update using (public.is_moderator(auth.uid()));

-- Bounty badge definitions (stored as enum-like check)
create table if not exists public.bounty_badges (
  code text primary key,
  name_en text not null,
  name_tr text not null,
  description_en text not null,
  description_tr text not null,
  icon text not null,
  threshold_count integer not null default 1
);

insert into public.bounty_badges (code, name_en, name_tr, description_en, description_tr, icon, threshold_count) values
  ('bug_hunter_first', 'First Bug Found', 'İlk Bug Yakalandı', 'Submitted the first validated AI incident.', 'İlk doğrulanmış AI olayını gönderdi.', 'trophy', 1),
  ('bug_hunter_bronze', 'Bug Hunter (Bronze)', 'Bug Avcısı (Bronz)', '5 validated AI incidents.', '5 doğrulanmış AI olayı.', 'medal', 5),
  ('bug_hunter_silver', 'Bug Hunter (Silver)', 'Bug Avcısı (Gümüş)', '25 validated AI incidents.', '25 doğrulanmış AI olayı.', 'medal', 25),
  ('bug_hunter_gold', 'Bug Hunter (Gold)', 'Bug Avcısı (Altın)', '100 validated AI incidents.', '100 doğrulanmış AI olayı.', 'crown', 100),
  ('ethics_advocate', 'Ethics Advocate', 'Etik Savunucu', 'Reported a critical-severity AI incident.', 'Kritik seviye AI olayı bildirdi.', 'shield', 1)
on conflict (code) do nothing;

-- User-badges join
create table if not exists public.user_bounty_badges (
  user_id uuid not null references public.users(id) on delete cascade,
  badge_code text not null references public.bounty_badges(code) on delete cascade,
  awarded_at timestamptz not null default now(),
  bounty_id uuid references public.bug_bounties(id) on delete set null,
  primary key (user_id, badge_code)
);

alter table public.user_bounty_badges enable row level security;

drop policy if exists "user_badges_public_read" on public.user_bounty_badges;
create policy "user_badges_public_read" on public.user_bounty_badges
  for select using (true);

drop policy if exists "user_badges_mod_insert" on public.user_bounty_badges;
create policy "user_badges_mod_insert" on public.user_bounty_badges
  for insert with check (public.is_moderator(auth.uid()));

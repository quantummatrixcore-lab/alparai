-- ============================================================================
-- 20260614000001_model_reviews_and_features.sql
-- ============================================================================

create table if not exists public.model_reviews (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.ai_models(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  is_anonymous boolean not null default false,

  score_overall smallint not null check (score_overall between 1 and 5),
  score_accuracy smallint check (score_accuracy between 1 and 5),
  score_safety smallint check (score_safety between 1 and 5),
  score_creativity smallint check (score_creativity between 1 and 5),
  score_speed smallint check (score_speed between 1 and 5),
  score_value smallint check (score_value between 1 and 5),

  title text check (char_length(title) <= 150),
  body text check (char_length(body) <= 3000),

  status text not null default 'published' check (status in ('published', 'pending', 'rejected')),
  helpful_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(model_id, user_id)
);

create index if not exists idx_model_reviews_model on public.model_reviews(model_id);
create index if not exists idx_model_reviews_status on public.model_reviews(model_id, status);

create table if not exists public.model_review_votes (
  user_id uuid not null references public.users(id) on delete cascade,
  review_id uuid not null references public.model_reviews(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, review_id)
);

create table if not exists public.model_feature_requests (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.ai_models(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  is_anonymous boolean not null default false,
  title text not null check (char_length(title) between 10 and 200),
  description text check (char_length(description) <= 2000),
  category text not null default 'feature' check (category in ('feature', 'safety', 'accuracy', 'ux', 'integration', 'other')),
  status text not null default 'open' check (status in ('open', 'planned', 'in_progress', 'completed', 'declined')),
  votes_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_model_feat_model on public.model_feature_requests(model_id);
create index if not exists idx_model_feat_votes on public.model_feature_requests(model_id, votes_count desc);

create table if not exists public.model_feature_votes (
  user_id uuid not null references public.users(id) on delete cascade,
  request_id uuid not null references public.model_feature_requests(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, request_id)
);

alter table public.model_reviews enable row level security;
alter table public.model_review_votes enable row level security;
alter table public.model_feature_requests enable row level security;
alter table public.model_feature_votes enable row level security;

-- Policies
create policy "model_reviews_select" on public.model_reviews for select using (true);
create policy "model_reviews_insert" on public.model_reviews for insert to authenticated with check (user_id = auth.uid());
create policy "model_reviews_update" on public.model_reviews for update to authenticated using (user_id = auth.uid() or public.is_moderator(auth.uid())) with check (user_id = auth.uid() or public.is_moderator(auth.uid()));
create policy "model_reviews_delete" on public.model_reviews for delete to authenticated using (user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "model_review_votes_select" on public.model_review_votes for select using (true);
create policy "model_review_votes_manage" on public.model_review_votes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "model_feature_requests_select" on public.model_feature_requests for select using (true);
create policy "model_feature_requests_insert" on public.model_feature_requests for insert to authenticated with check (user_id = auth.uid());
create policy "model_feature_requests_update" on public.model_feature_requests for update to authenticated using (user_id = auth.uid() or public.is_moderator(auth.uid())) with check (user_id = auth.uid() or public.is_moderator(auth.uid()));
create policy "model_feature_requests_delete" on public.model_feature_requests for delete to authenticated using (user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "model_feature_votes_select" on public.model_feature_votes for select using (true);
create policy "model_feature_votes_manage" on public.model_feature_votes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Triggers for counts
create or replace function public.tg_model_review_votes_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (TG_OP = 'INSERT') then
    update public.model_reviews
    set helpful_count = helpful_count + 1
    where id = new.review_id;
  elsif (TG_OP = 'DELETE') then
    update public.model_reviews
    set helpful_count = helpful_count - 1
    where id = old.review_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_model_review_votes_count on public.model_review_votes;
create trigger trg_model_review_votes_count
  after insert or delete on public.model_review_votes
  for each row execute function public.tg_model_review_votes_count();

create or replace function public.tg_model_feature_votes_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (TG_OP = 'INSERT') then
    update public.model_feature_requests
    set votes_count = votes_count + 1
    where id = new.request_id;
  elsif (TG_OP = 'DELETE') then
    update public.model_feature_requests
    set votes_count = votes_count - 1
    where id = old.request_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_model_feature_votes_count on public.model_feature_votes;
create trigger trg_model_feature_votes_count
  after insert or delete on public.model_feature_votes
  for each row execute function public.tg_model_feature_votes_count();

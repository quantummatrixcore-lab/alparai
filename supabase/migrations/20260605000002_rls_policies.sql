-- =============================================================================
-- RLS Policies (v1.0.0)
-- =============================================================================
-- All tables have RLS enabled. Policies are written for the
-- "Trustpilot / sikayetvar.com" intermediary model:
--   - Public can READ published content
--   - Authenticated users can CREATE submissions
--   - Moderators can UPDATE status, approve, reject
--   - Service role bypasses RLS (use with caution, server-only)
-- =============================================================================

-- ============================================================================
-- Enable RLS
-- ============================================================================
alter table public.users enable row level security;
alter table public.ai_providers enable row level security;
alter table public.ai_models enable row level security;
alter table public.incidents enable row level security;
alter table public.evidence enable row level security;
alter table public.ai_provider_responses enable row level security;
alter table public.suggestions enable row level security;
alter table public.suggestion_votes enable row level security;
alter table public.consent_log enable row level security;
alter table public.takedown_requests enable row level security;
alter table public.audit_log enable row level security;

-- ============================================================================
-- USERS
-- ============================================================================
create policy "Public profiles are viewable by everyone"
  on public.users for select using (true);

create policy "Users can update their own profile"
  on public.users for update using (auth.uid() = id);

create policy "Admins can manage all users"
  on public.users for all using (public.is_admin(auth.uid()));

-- ============================================================================
-- AI PROVIDERS & MODELS (public read)
-- ============================================================================
create policy "AI providers are viewable by everyone"
  on public.ai_providers for select using (true);

create policy "Admins can manage AI providers"
  on public.ai_providers for all using (public.is_admin(auth.uid()));

create policy "AI models are viewable by everyone"
  on public.ai_models for select using (true);

create policy "Admins can manage AI models"
  on public.ai_models for all using (public.is_admin(auth.uid()));

-- ============================================================================
-- INCIDENTS
-- ============================================================================
create policy "Published incidents are viewable by everyone"
  on public.incidents for select
  using (
    status = 'published'
    or user_id = auth.uid()
    or public.is_moderator(auth.uid())
  );

create policy "Authenticated users can submit incidents"
  on public.incidents for insert
  with check (auth.uid() = user_id and auth.uid() is not null);

create policy "Users can update their own pending incidents"
  on public.incidents for update
  using (
    user_id = auth.uid() and status = 'pending_review'
  );

create policy "Moderators can update any incident"
  on public.incidents for update
  using (public.is_moderator(auth.uid()));

create policy "Admins can delete incidents"
  on public.incidents for delete using (public.is_admin(auth.uid()));

-- ============================================================================
-- EVIDENCE
-- ============================================================================
create policy "Evidence of published incidents is viewable by everyone"
  on public.evidence for select
  using (
    exists (
      select 1 from public.incidents
      where incidents.id = evidence.incident_id
        and (incidents.status = 'published' or public.is_moderator(auth.uid()))
    )
  );

create policy "Users can upload evidence to their own incidents"
  on public.evidence for insert
  with check (
    exists (
      select 1 from public.incidents
      where incidents.id = evidence.incident_id and incidents.user_id = auth.uid()
    )
  );

create policy "Moderators can manage evidence"
  on public.evidence for all using (public.is_moderator(auth.uid()));

-- ============================================================================
-- AI PROVIDER RESPONSES
-- ============================================================================
create policy "Published responses are viewable by everyone"
  on public.ai_provider_responses for select
  using (is_published = true or public.is_moderator(auth.uid()));

create policy "Moderators can manage responses"
  on public.ai_provider_responses for all using (public.is_moderator(auth.uid()));

-- ============================================================================
-- SUGGESTIONS
-- ============================================================================
create policy "Suggestions are viewable by everyone"
  on public.suggestions for select using (true);

create policy "Authenticated users can submit suggestions"
  on public.suggestions for insert
  with check (auth.uid() = user_id and auth.uid() is not null);

create policy "Users can update their own suggestions"
  on public.suggestions for update
  using (user_id = auth.uid() or public.is_moderator(auth.uid()));

create policy "Users can delete their own suggestions"
  on public.suggestions for delete using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- ============================================================================
-- SUGGESTION VOTES
-- ============================================================================
create policy "Suggestion votes are viewable by everyone"
  on public.suggestion_votes for select using (true);

create policy "Users can manage their own votes"
  on public.suggestion_votes for all using (auth.uid() = user_id);

-- ============================================================================
-- CONSENT LOG (insert-only for users; read for owner + moderators)
-- ============================================================================
create policy "Users can view their own consent log"
  on public.consent_log for select
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "Authenticated users can insert consent records"
  on public.consent_log for insert
  with check (auth.uid() is not null and (user_id is null or user_id = auth.uid()));

-- ============================================================================
-- TAKEDOWN REQUESTS
-- ============================================================================
create policy "Moderators can view takedown requests"
  on public.takedown_requests for select using (public.is_moderator(auth.uid()));

create policy "Anyone can submit a takedown request"
  on public.takedown_requests for insert with check (true);

create policy "Moderators can update takedown requests"
  on public.takedown_requests for update using (public.is_moderator(auth.uid()));

-- ============================================================================
-- AUDIT LOG (admins only)
-- ============================================================================
create policy "Admins can view audit log"
  on public.audit_log for select using (public.is_admin(auth.uid()));

create policy "Service role can insert audit log"
  on public.audit_log for insert with check (true);

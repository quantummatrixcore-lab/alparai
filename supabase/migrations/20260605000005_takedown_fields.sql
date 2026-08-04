-- Add fields to takedown_requests to support both the public form and inline-from-incident flow.
alter table public.takedown_requests
  add column if not exists target_url text,
  add column if not exists details text,
  add column if not exists country text,
  add column if not exists organization text,
  add column if not exists identity_proof_url text,
  add column if not exists user_id uuid references public.users(id) on delete set null,
  add column if not exists reviewed_by uuid references public.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists ip_address inet;

-- Relax the reason length constraint so 'defamation' / 'copyright' / etc. categories fit.
alter table public.takedown_requests
  alter column reason type text,
  drop constraint if exists takedown_requests_reason_check;

-- Map our form values to the takedown_status enum.
-- The form sends status = 'pending' but the enum uses 'received'.
create or replace function public.normalize_takedown_status(s text)
returns public.takedown_status
language sql
immutable
as $$
  select case
    when s = 'pending' then 'received'::public.takedown_status
    when s = 'approved' then 'approved'::public.takedown_status
    when s = 'rejected' then 'rejected'::public.takedown_status
    when s = 'under_review' then 'under_review'::public.takedown_status
    when s = 'escalated' then 'escalated'::public.takedown_status
    else 'received'::public.takedown_status
  end;
$$;

-- ============================================================================
-- SEED: First Admin Users
-- Promotes known admin emails to admin/ceo role on first sign-in
-- ============================================================================

update public.users
set role = 'ceo', is_verified = true
where email = '[REDACTED_EMAIL]';

update public.users
set role = 'admin', is_verified = true
where email = '[REDACTED_EMAIL]';

do $$
declare
  v_target_id uuid;
begin
  select id into v_target_id from public.users where email = '[REDACTED_EMAIL]';
  if v_target_id is not null then
    insert into public.audit_log (actor_id, action, entity_type, entity_id, after_data)
    values (
      v_target_id,
      'seed.role.ceo',
      'user',
      v_target_id,
      jsonb_build_object('email', '[REDACTED_EMAIL]', 'method', 'seed_migration', 'migration', '20260609000000_seed_first_admin')
    );
  end if;

  select id into v_target_id from public.users where email = '[REDACTED_EMAIL]';
  if v_target_id is not null then
    insert into public.audit_log (actor_id, action, entity_type, entity_id, after_data)
    values (
      v_target_id,
      'seed.role.admin',
      'user',
      v_target_id,
      jsonb_build_object('email', '[REDACTED_EMAIL]', 'method', 'seed_migration', 'migration', '20260609000000_seed_first_admin')
    );
  end if;
end $$;


-- ROLLBACK:
-- -- Add rollback statements here

-- ============================================================================
-- SEED: First Admin Users
-- Promotes known admin emails to admin/ceo role on first sign-in
-- ============================================================================

update public.users
set role = 'ceo', is_verified = true
where email = 'ercuerde@gmail.com';

update public.users
set role = 'admin', is_verified = true
where email = 'quantum.matrix.core@gmail.com';

do $$
declare
  v_target_id uuid;
begin
  select id into v_target_id from public.users where email = 'ercuerde@gmail.com';
  if v_target_id is not null then
    insert into public.audit_log (actor_id, action, entity_type, entity_id, after_data)
    values (
      v_target_id,
      'seed.role.ceo',
      'user',
      v_target_id,
      jsonb_build_object('email', 'ercuerde@gmail.com', 'method', 'seed_migration', 'migration', '20260609000000_seed_first_admin')
    );
  end if;

  select id into v_target_id from public.users where email = 'quantum.matrix.core@gmail.com';
  if v_target_id is not null then
    insert into public.audit_log (actor_id, action, entity_type, entity_id, after_data)
    values (
      v_target_id,
      'seed.role.admin',
      'user',
      v_target_id,
      jsonb_build_object('email', 'quantum.matrix.core@gmail.com', 'method', 'seed_migration', 'migration', '20260609000000_seed_first_admin')
    );
  end if;
end $$;

create or replace function public.increment_poll_count(
  p_poll_id uuid,
  p_choice text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_choice = 'yes' then
    update ai_polls set yes_count = yes_count + 1 where id = p_poll_id;
  elsif p_choice = 'no' then
    update ai_polls set no_count = no_count + 1 where id = p_poll_id;
  elsif p_choice = 'unsure' then
    update ai_polls set unsure_count = unsure_count + 1 where id = p_poll_id;
  end if;
end;
$$;

revoke all on function public.increment_poll_count(uuid, text) from public;
grant execute on function public.increment_poll_count(uuid, text) to service_role;

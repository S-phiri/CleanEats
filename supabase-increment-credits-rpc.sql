-- ============================================
-- Atomic free-tier credit increment (run once in Supabase SQL Editor)
-- Requires: public.profiles.credits_used
-- ============================================

create or replace function public.increment_credits_if_under_cap(
  p_user_id uuid,
  p_amount integer,
  p_cap integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current integer;
begin
  if p_amount <= 0 then
    return true;
  end if;

  select credits_used into v_current
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    return false;
  end if;

  if v_current + p_amount > p_cap then
    return false;
  end if;

  update public.profiles
  set credits_used = credits_used + p_amount
  where id = p_user_id;

  return true;
end;
$$;

grant execute on function public.increment_credits_if_under_cap(uuid, integer, integer) to authenticated;
grant execute on function public.increment_credits_if_under_cap(uuid, integer, integer) to service_role;

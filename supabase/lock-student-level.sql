-- Abu Shreek: protect student role and study level at database level.
-- Review existing RLS policies before running. Execute in Supabase SQL Editor.
create or replace function public.abu_guard_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  actor uuid := auth.uid();
  actor_admin boolean := false;
begin
  -- Trusted SQL/service operations (without an end-user JWT) remain available
  -- for migrations and administrative maintenance.
  if actor is null then return new; end if;
  select exists (
    select 1 from public.profiles
    where id = actor and role = 'admin'
  ) into actor_admin;

  if tg_op = 'INSERT' then
    if new.id is distinct from actor and not actor_admin then
      raise exception 'Cannot create another user profile';
    end if;
    if not actor_admin then
      new.role := 'student';
      -- A study level is selected once at account creation.
      if new.study_level is null or new.study_level not in
        ('الصف التاسع','بكالوريا علمي','بكالوريا أدبي') then
        raise exception 'Valid study level required';
      end if;
    end if;
  elsif tg_op = 'UPDATE' then
    if not actor_admin then
      if new.id is distinct from old.id then
        raise exception 'Profile identity cannot change';
      end if;
      if new.role is distinct from old.role then
        raise exception 'Only administrators can change roles';
      end if;
      if new.study_level is distinct from old.study_level then
        raise exception 'Only administrators can change study level';
      end if;
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists abu_guard_profile_fields_trigger on public.profiles;
create trigger abu_guard_profile_fields_trigger
before insert or update on public.profiles
for each row execute function public.abu_guard_profile_fields();

-- NOTE: This trigger protects the profile fields, but does not create
-- missing RLS policies or protect educational content routes/API endpoints.

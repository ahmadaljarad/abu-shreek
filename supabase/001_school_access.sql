-- أبو شريك: apply in Supabase SQL Editor after creating the project.
-- Do not grant admin by email alone: verify the user's identity in Supabase Auth first.
create extension if not exists pgcrypto;
create table if not exists public.student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  school_level text not null check (school_level in ('تاسع','بكالوريا علمي','بكالوريا أدبي')),
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now()
);
alter table public.student_profiles enable row level security;
revoke all on public.student_profiles from anon;
grant select on public.student_profiles to authenticated;
create policy "Student can read own profile"
on public.student_profiles for select to authenticated
using (user_id = (select auth.uid()));
create or replace function public.is_school_admin()
returns boolean language sql stable security definer set search_path = '' as $
  select exists(select 1 from public.student_profiles where user_id=auth.uid() and role='admin');
$;
revoke all on function public.is_school_admin() from public,anon;
grant execute on function public.is_school_admin() to authenticated;
create policy "Admin can read all profiles"
on public.student_profiles for select to authenticated
using ((select public.is_school_admin()));
-- No INSERT/UPDATE/DELETE policies for authenticated clients: school level and role are immutable to students.
-- The trigger creates a profile using only the requested grade and verified Auth identity.
create or replace function public.create_student_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
declare chosen text;
begin
  chosen := new.raw_user_meta_data->>'school_level';
  if chosen not in ('تاسع','بكالوريا علمي','بكالوريا أدبي') then
    raise exception 'Choose a valid school level';
  end if;
  insert into public.student_profiles(user_id,display_name,school_level,role)
  values(new.id,left(coalesce(new.raw_user_meta_data->>'display_name',''),100),chosen,'student');
  return new;
end;
$$;
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile after insert on auth.users
for each row execute function public.create_student_profile();
-- Admin actions must use a server-side function; do not expose the service role key to the browser.
create or replace function public.admin_change_school_level(target_user uuid, next_level text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not exists(select 1 from public.student_profiles where user_id=auth.uid() and role='admin') then
    raise exception 'Admin only';
  end if;
  if next_level not in ('تاسع','بكالوريا علمي','بكالوريا أدبي') then
    raise exception 'Invalid school level';
  end if;
  update public.student_profiles set school_level=next_level where user_id=target_user;
  if not found then raise exception 'Student not found'; end if;
end;
$$;
revoke all on function public.admin_change_school_level(uuid,text) from public,anon;
grant execute on function public.admin_change_school_level(uuid,text) to authenticated;
-- One-time manual promotion ONLY AFTER confirming ownership of the verified email in Auth:
-- update public.student_profiles set role='admin'
-- where user_id=(select id from auth.users where lower(email)='ahmad.aljarad@icloud.com' and email_confirmed_at is not null);
-- IMPORTANT: GitHub release PDFs are PUBLIC. To truly protect them, migrate books to private Supabase Storage
-- and serve via an authenticated server endpoint that checks student_profiles.school_level.

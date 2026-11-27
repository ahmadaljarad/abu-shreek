begin;
create table if not exists public.abu_activity (
 user_id uuid not null references auth.users(id) on delete cascade,
 minute_at timestamptz not null,
 subject text not null default '',
 lesson text not null default '',
 action text not null check(action in ('active','subject','card','quiz','book')),
 primary key(user_id,minute_at,action,subject,lesson)
);
alter table public.abu_activity enable row level security;
revoke all on public.abu_activity from anon,authenticated;
grant select on public.abu_activity to authenticated;
drop policy if exists abu_activity_admin on public.abu_activity;
create policy abu_activity_admin on public.abu_activity for select to authenticated using ((select public.is_school_admin()));
create or replace function public.abu_record_activity(p_action text,p_subject text default '',p_lesson text default '')
returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from public.student_profiles where user_id=auth.uid() and role='student') then return; end if;
 if p_action not in ('active','subject','card','quiz','book') then return; end if;
 insert into public.abu_activity(user_id,minute_at,action,subject,lesson)
 values(auth.uid(),date_trunc('minute',now()),p_action,case when p_action='active' then '' else left(coalesce(p_subject,''),100) end,case when p_action='active' then '' else left(coalesce(p_lesson,''),150) end)
 on conflict do nothing;
end; $$;
revoke all on function public.abu_record_activity(text,text,text) from public,anon;
grant execute on function public.abu_record_activity(text,text,text) to authenticated;
commit;
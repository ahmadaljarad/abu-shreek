begin;
create table if not exists public.abu_messages(id uuid primary key default gen_random_uuid(), title text not null check(char_length(title) between 1 and 150), body text not null check(char_length(body) between 1 and 5000), created_at timestamptz not null default now());
create table if not exists public.abu_message_recipients(message_id uuid references public.abu_messages on delete cascade, user_id uuid references auth.users on delete cascade, read_at timestamptz, primary key(message_id,user_id));
alter table public.abu_messages enable row level security;
alter table public.abu_message_recipients enable row level security;
revoke all on public.abu_messages,public.abu_message_recipients from anon,authenticated;
grant select on public.abu_messages,public.abu_message_recipients to authenticated;
grant delete on public.abu_messages to authenticated;
drop policy if exists abu_recipient_read on public.abu_message_recipients;
create policy abu_recipient_read on public.abu_message_recipients for select to authenticated using(user_id=auth.uid() or public.is_school_admin());
drop policy if exists abu_message_read on public.abu_messages;
create policy abu_message_read on public.abu_messages for select to authenticated using(public.is_school_admin() or exists(select 1 from public.abu_message_recipients r where r.message_id=id and r.user_id=auth.uid()));
drop policy if exists abu_message_delete on public.abu_messages;
create policy abu_message_delete on public.abu_messages for delete to authenticated using(public.is_school_admin());
create or replace function public.abu_send_message(p_title text,p_body text,p_target text) returns integer language plpgsql security definer set search_path='' as $$
declare mid uuid; n integer;
begin
if not coalesce(public.is_school_admin(),false) then raise exception 'Forbidden'; end if;
insert into public.abu_messages(title,body) values(trim(p_title),trim(p_body)) returning id into mid;
insert into public.abu_message_recipients(message_id,user_id) select mid,user_id from public.student_profiles where role='student' and (p_target='all' or school_level=p_target or user_id::text=p_target);
get diagnostics n=row_count;
if n=0 then raise exception 'No recipients'; end if;
return n;
end $$;
create or replace function public.abu_read_message(p_id uuid) returns void language sql security definer set search_path='' as $$ update public.abu_message_recipients set read_at=coalesce(read_at,now()) where message_id=p_id and user_id=auth.uid(); $$;
revoke all on function public.abu_send_message(text,text,text),public.abu_read_message(uuid) from public,anon;
grant execute on function public.abu_send_message(text,text,text),public.abu_read_message(uuid) to authenticated;
commit;
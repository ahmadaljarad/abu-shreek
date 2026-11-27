begin;
create table if not exists public.abu_chat_preferences(user_id uuid primary key references auth.users on delete cascade, enabled boolean not null default true);
create table if not exists public.abu_chat_requests(sender uuid references auth.users on delete cascade, recipient uuid references auth.users on delete cascade, accepted boolean not null default false, primary key(sender,recipient),check(sender<>recipient));
create table if not exists public.abu_chat_blocks(owner_id uuid references auth.users on delete cascade, blocked_id uuid references auth.users on delete cascade,primary key(owner_id,blocked_id));
create table if not exists public.abu_peer_messages(id uuid primary key default gen_random_uuid(),sender uuid not null references auth.users on delete cascade,recipient uuid references auth.users on delete cascade,school_level text,body text not null check(char_length(body) between 1 and 2000),created_at timestamptz not null default now(),check((recipient is null)<>(school_level is null)));
create table if not exists public.abu_chat_reports(id uuid primary key default gen_random_uuid(), reporter uuid references auth.users on delete cascade,message_id uuid references public.abu_peer_messages on delete cascade, reason text not null check(char_length(reason) between 1 and 500),created_at timestamptz default now(),unique(reporter,message_id));
alter table public.abu_chat_preferences enable row level security;
alter table public.abu_chat_requests enable row level security;
alter table public.abu_chat_blocks enable row level security;
alter table public.abu_peer_messages enable row level security;
alter table public.abu_chat_reports enable row level security;
revoke all on public.abu_chat_preferences,public.abu_chat_requests,public.abu_chat_blocks,public.abu_peer_messages,public.abu_chat_reports from anon,authenticated;
create or replace function public.abu_chat(p_action text,p_peer uuid default null,p_body text default null,p_message uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); lv text; result jsonb;
begin
if me is null then raise exception 'Forbidden'; end if;
if p_action='reports' and public.is_school_admin() then
return coalesce((select jsonb_agg(to_jsonb(r)||jsonb_build_object('body',m.body,'sender',m.sender)) from public.abu_chat_reports r join public.abu_peer_messages m on m.id=r.message_id),'[]'::jsonb);
end if;
select school_level into lv from public.student_profiles where user_id=me and role='student';
if lv is null or lv='' then raise exception 'Student profile required'; end if;
if p_action='directory' then return coalesce((select jsonb_agg(jsonb_build_object('id',s.user_id,'name',s.display_name)) from public.student_profiles s where s.role='student' and s.school_level=lv and s.user_id<>me and not exists(select 1 from public.abu_chat_preferences p where p.user_id=s.user_id and not p.enabled) and not exists(select 1 from public.abu_chat_blocks b where (b.owner_id=me and b.blocked_id=s.user_id) or (b.owner_id=s.user_id and b.blocked_id=me))),'[]'::jsonb); end if;
if p_action='requests' then return coalesce((select jsonb_agg(to_jsonb(r)||jsonb_build_object('name',s.display_name)) from public.abu_chat_requests r join public.student_profiles s on s.user_id=case when r.sender=me then r.recipient else r.sender end where r.sender=me or r.recipient=me),'[]'::jsonb); end if;
if p_action='enable' or p_action='disable' then insert into public.abu_chat_preferences values(me,p_action='enable') on conflict(user_id) do update set enabled=excluded.enabled; return 'true'; end if;
if p_action='block' then insert into public.abu_chat_blocks values(me,p_peer) on conflict do nothing; delete from public.abu_chat_requests where (sender=me and recipient=p_peer) or (sender=p_peer and recipient=me); return 'true'; end if;
if p_action='unblock' then delete from public.abu_chat_blocks where owner_id=me and blocked_id=p_peer; return 'true'; end if;
if p_action='blocks' then return coalesce((select jsonb_agg(jsonb_build_object('id',b.blocked_id,'name',s.display_name)) from public.abu_chat_blocks b join public.student_profiles s on s.user_id=b.blocked_id where b.owner_id=me),'[]'::jsonb); end if;
if p_action='report' then insert into public.abu_chat_reports(reporter,message_id,reason) select me,m.id,p_body from public.abu_peer_messages m where m.id=p_message and m.sender<>me and (m.recipient=me or (m.recipient is null and m.school_level=lv)) on conflict do nothing; return 'true'; end if;
if p_peer is not null then
if p_peer=me or not exists(select 1 from public.student_profiles where user_id=p_peer and role='student' and school_level=lv) then raise exception 'Unavailable'; end if;
if exists(select 1 from public.abu_chat_blocks where (owner_id=me and blocked_id=p_peer) or (owner_id=p_peer and blocked_id=me)) then raise exception 'Unavailable'; end if;
if p_action in ('request','accept','send') and exists(select 1 from public.abu_chat_preferences where user_id in(me,p_peer) and not enabled) then raise exception 'Private messages disabled'; end if;
if p_action='request' then insert into public.abu_chat_requests values(me,p_peer,false) on conflict do nothing; return 'true'; end if;
if p_action='accept' then update public.abu_chat_requests set accepted=true where sender=p_peer and recipient=me; return 'true'; end if;
if p_action='decline' then delete from public.abu_chat_requests where sender=p_peer and recipient=me; return 'true'; end if;
if not exists(select 1 from public.abu_chat_requests where accepted and ((sender=me and recipient=p_peer) or (sender=p_peer and recipient=me))) then raise exception 'Request not accepted'; end if;
end if;
if p_action='send' then
if (select count(*) from public.abu_peer_messages where sender=me and created_at>now()-interval '1 minute')>=10 then raise exception 'Rate limit'; end if;
insert into public.abu_peer_messages(sender,recipient,school_level,body) values(me,p_peer,case when p_peer is null then lv end,trim(p_body)); return 'true'; end if;
if p_action='read' then return coalesce((select jsonb_agg(to_jsonb(t) order by t.created_at) from (select m.id,m.sender,m.body,m.created_at,s.display_name from public.abu_peer_messages m join public.student_profiles s on s.user_id=m.sender where ((p_peer is null and m.recipient is null and m.school_level=lv) or (p_peer is not null and ((m.sender=me and m.recipient=p_peer) or (m.sender=p_peer and m.recipient=me)))) and not exists(select 1 from public.abu_chat_blocks b where b.owner_id=me and b.blocked_id=m.sender) order by m.created_at desc limit 100) t),'[]'::jsonb); end if;
raise exception 'Unknown action';
end $$;
revoke all on function public.abu_chat(text,uuid,text,uuid) from public,anon;
grant execute on function public.abu_chat(text,uuid,text,uuid) to authenticated;
commit;
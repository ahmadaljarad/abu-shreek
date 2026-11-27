begin;
create table if not exists public.abu_forum_posts(id bigint generated always as identity primary key, author uuid not null references auth.users on delete cascade, level text not null, subject text not null, body text not null check(length(body) between 1 and 2000), parent bigint references public.abu_forum_posts on delete cascade, created_at timestamptz not null default now());
create table if not exists public.abu_forum_likes(post bigint references public.abu_forum_posts on delete cascade, actor uuid references auth.users on delete cascade, primary key(post,actor));
create table if not exists public.abu_forum_reports(post bigint references public.abu_forum_posts on delete cascade, actor uuid references auth.users on delete cascade, reason text not null check(length(reason) between 1 and 500), primary key(post,actor));
alter table public.abu_forum_posts enable row level security;
alter table public.abu_forum_likes enable row level security;
alter table public.abu_forum_reports enable row level security;
revoke all on public.abu_forum_posts,public.abu_forum_likes,public.abu_forum_reports from public,anon,authenticated;
create or replace function public.abu_forum(p_action text,p_id bigint default null,p_subject text default null,p_body text default null) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); lv text; adm boolean; target public.abu_forum_posts%rowtype; result jsonb;
begin
if uid is null then raise exception 'Authentication required'; end if;
adm:=coalesce(public.is_school_admin(),false);
select school_level into lv from public.student_profiles where user_id=uid and role='student';
if not adm and (lv is null or lv not in ('تاسع','بكالوريا علمي','بكالوريا أدبي')) then raise exception 'Student level required'; end if;
if p_action='reports' and adm then
select coalesce(jsonb_agg(to_jsonb(q)),'[]') into result from (select r.post,r.reason,p.body,p.level,p.subject from public.abu_forum_reports r join public.abu_forum_posts p on p.id=r.post limit 200) q; return result;
elsif p_action='list' then
select coalesce(jsonb_agg(to_jsonb(q)),'[]') into result from (select p.id,p.parent,p.subject,p.body,p.created_at,p.level,(select count(*) from public.abu_forum_likes l where l.post=p.id) likes,exists(select 1 from public.abu_forum_likes l where l.post=p.id and l.actor=uid) liked from public.abu_forum_posts p where (adm or p.level=lv) and (p_subject is null or p.subject=p_subject) order by p.created_at desc limit 200) q; return result;
elsif p_action='post' and not adm then
if p_subject not in ('رياضيات','فيزياء','كيمياء','علوم','عربي','إنكليزي','فرنسي','تاريخ','جغرافيا','فلسفة','وطنية','أخرى') or p_subject is null then raise exception 'Invalid subject'; end if;
if exists(select 1 from public.abu_forum_posts where author=uid and created_at>now()-interval '10 seconds') then raise exception 'Please wait before posting'; end if;
insert into public.abu_forum_posts(author,level,subject,body) values(uid,lv,p_subject,trim(p_body)); return 'true';
end if;
select * into target from public.abu_forum_posts where id=p_id and (adm or level=lv);
if not found then raise exception 'Post unavailable'; end if;
if p_action='delete' and (adm or target.author=uid) then delete from public.abu_forum_posts where id=p_id;
elsif p_action='reply' and not adm and target.parent is null then
if exists(select 1 from public.abu_forum_posts where author=uid and created_at>now()-interval '10 seconds') then raise exception 'Please wait before posting'; end if;
insert into public.abu_forum_posts(author,level,subject,body,parent) values(uid,lv,target.subject,trim(p_body),p_id);
elsif p_action='like' and not adm then
delete from public.abu_forum_likes where post=p_id and actor=uid;
if not found then insert into public.abu_forum_likes values(p_id,uid) on conflict do nothing; end if;
elsif p_action='report' and not adm then insert into public.abu_forum_reports values(p_id,uid,trim(p_body)) on conflict(post,actor) do update set reason=excluded.reason;
else raise exception 'Action not allowed'; end if;
return 'true';
end $$;
revoke all on function public.abu_forum(text,bigint,text,text) from public,anon;
grant execute on function public.abu_forum(text,bigint,text,text) to authenticated;
commit;
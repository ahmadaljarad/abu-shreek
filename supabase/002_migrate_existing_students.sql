-- One-time safe migration of legacy Abu Shreek Auth users.
-- Preserve auth.users, passwords, and any existing progress records.
-- Only migrate verified users with a recognized legacy study_level.
-- Do not guess a school level for ambiguous accounts.
with legacy as (
 select u.id,
        left(coalesce(nullif(trim(u.raw_user_meta_data->>'display_name'),''),''),100) as display_name,
        case
          when u.raw_user_meta_data->>'school_level' in ('تاسع','الصف التاسع') then 'تاسع'
          when u.raw_user_meta_data->>'study_level' in ('تاسع','الصف التاسع') then 'تاسع'
          when u.raw_user_meta_data->>'school_level' in ('بكالوريا علمي','بكالوريا أدبي') then u.raw_user_meta_data->>'school_level'
          when u.raw_user_meta_data->>'study_level' in ('بكالوريا علمي','بكالوريا أدبي') then u.raw_user_meta_data->>'study_level'
          else null
        end as level
 from auth.users u
 where u.email_confirmed_at is not null
)
insert into public.student_profiles(user_id,display_name,school_level,role)
select l.id,l.display_name,l.level,'student'
from legacy l
where l.level is not null
on conflict(user_id) do nothing;

-- View legacy accounts that still need an admin decision.
-- This query does not reveal passwords or change any accounts.
select u.id as user_id,
       u.email,
       u.raw_user_meta_data->>'study_level' as previous_level,
       u.raw_user_meta_data->>'school_level' as selected_level,
       case when u.email_confirmed_at is null then 'email_not_confirmed'
            else 'school_level_needs_review' end as reason
from auth.users u
left join public.student_profiles p on p.user_id=u.id
where p.user_id is null
order by u.created_at;

-- Existing user profile roles, school levels, and progress remain untouched.

-- REVIEW ONLY: apply to isolated staging database first, not shared production.
begin;
create schema if not exists wall_private;
revoke all on schema wall_private from public, anon, authenticated;
create table if not exists wall_private.moderation_log (
 id bigint generated always as identity primary key,
 entry_id bigint not null, actor uuid not null, action text not null,
 display_name text not null, old_record jsonb not null, new_record jsonb not null,
 created_at timestamptz not null default now()
);
alter table wall_private.moderation_log enable row level security;
revoke all on wall_private.moderation_log from public, anon, authenticated;
create or replace function wall_private.require_admin() returns void
language plpgsql security invoker set search_path='' as $$
begin
 if auth.uid() is null or not exists (
 select 1 from auth.users u where u.id=auth.uid() and u.raw_app_meta_data->>'wall_admin'='true'
 ) then raise exception 'Access denied' using errcode='42501'; end if;
end; $$;
revoke all on function wall_private.require_admin() from public, anon, authenticated;
create or replace function public.wall_admin_queue() returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 perform wall_private.require_admin();
 return jsonb_build_object(
 'approved',(select count(*) from public.wall_of_names where status='approved'),
 'pending',coalesce((select jsonb_agg(jsonb_build_object('id',q.id::text,'display_name',q.display_name,'remark',q.remark) order by q.id) from (select id,display_name,remark from public.wall_of_names where status='pending' order by id limit 100) q),'[]'::jsonb),
 'history',coalesce((select jsonb_agg(to_jsonb(h) order by h.created_at desc) from (select actor,action,display_name,created_at from wall_private.moderation_log order by created_at desc limit 100) h),'[]'::jsonb));
end; $$;
create or replace function public.wall_admin_decide(p_id bigint,p_action text,p_name text,p_remark text) returns void
language plpgsql security definer set search_path='' as $$
declare before_row public.wall_of_names%rowtype; after_row public.wall_of_names%rowtype;
begin
 perform wall_private.require_admin();
 if p_action is null or p_action not in ('approve','edit','reject') then raise exception 'Invalid action'; end if;
 if p_action <> 'reject' and (p_name is null or char_length(btrim(p_name)) not between 1 and 80 or coalesce(char_length(p_remark),0)>500) then raise exception 'Invalid entry'; end if;
 select * into before_row from public.wall_of_names where id=p_id and status='pending' for update;
 if not found then raise exception 'Entry no longer pending'; end if;
 update public.wall_of_names set
 display_name=case when p_action='reject' then display_name else btrim(p_name) end,
 remark=case when p_action='reject' then remark else nullif(btrim(p_remark),'') end,
 status=case p_action when 'approve' then 'approved' when 'reject' then 'rejected' else 'pending' end,
 approved_at=case when p_action='approve' then now() else null end
 where id=p_id returning * into after_row;
 insert into wall_private.moderation_log(entry_id,actor,action,display_name,old_record,new_record)
 values(p_id,auth.uid(),p_action,after_row.display_name,to_jsonb(before_row),to_jsonb(after_row));
end; $$;
revoke all on function public.wall_admin_queue() from public, anon, authenticated;
revoke all on function public.wall_admin_decide(bigint,text,text,text) from public, anon, authenticated;
grant execute on function public.wall_admin_queue() to authenticated;
grant execute on function public.wall_admin_decide(bigint,text,text,text) to authenticated;
commit;
-- Owner role provisioning requires verified account identity; never assign by unverified client metadata.
-- Validate schema constraints, grants, stale concurrent decisions and ordinary-user denial before release.

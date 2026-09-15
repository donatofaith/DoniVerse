-- DoniVerse rebrand migration
-- Run once on an existing deployment that previously used FUTAGO-named admin functions.
-- Safe to run more than once.

begin;

create or replace function public.is_doniverse_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users as au
    where au.user_id = check_user_id
  );
$$;

create or replace function public.is_doniverse_super_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users as au
    where au.user_id = check_user_id and au.role = 'super_admin'
  );
$$;

revoke all on function public.is_doniverse_admin(uuid) from public;
revoke all on function public.is_doniverse_super_admin(uuid) from public;
grant execute on function public.is_doniverse_admin(uuid) to authenticated;
grant execute on function public.is_doniverse_super_admin(uuid) to authenticated;

create or replace function public.list_doniverse_admins()
returns table (user_id uuid, email text, role text, created_at timestamptz)
language sql
stable
security definer
set search_path = public, auth
as $$
  select au.user_id, usr.email::text, au.role, au.created_at
  from public.admin_users as au
  left join auth.users as usr on usr.id = au.user_id
  where public.is_doniverse_admin(auth.uid())
  order by case when au.role = 'super_admin' then 0 else 1 end, au.created_at asc;
$$;

revoke all on function public.list_doniverse_admins() from public;
grant execute on function public.list_doniverse_admins() to authenticated;

drop function if exists public.set_doniverse_admin_by_email(text, text);
create function public.set_doniverse_admin_by_email(target_email text, target_role text default 'admin')
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_email text;
  v_role text;
begin
  if not public.is_doniverse_super_admin(auth.uid()) then
    raise exception 'Super admin access required';
  end if;

  v_role := lower(trim(target_role));
  if v_role not in ('admin', 'super_admin') then
    raise exception 'Invalid admin role';
  end if;

  v_email := lower(trim(target_email));
  select usr.id into v_user_id
  from auth.users as usr
  where lower(usr.email::text) = v_email
  limit 1;

  if v_user_id is null then
    raise exception 'No DoniVerse account was found with that email';
  end if;

  insert into public.admin_users as au (user_id, role)
  values (v_user_id, v_role)
  on conflict (user_id) do update set role = excluded.role;

  return jsonb_build_object('user_id', v_user_id, 'email', v_email, 'role', v_role);
end;
$$;

revoke all on function public.set_doniverse_admin_by_email(text, text) from public;
grant execute on function public.set_doniverse_admin_by_email(text, text) to authenticated;

create or replace function public.remove_doniverse_admin(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_doniverse_super_admin(auth.uid()) then
    raise exception 'Super admin access required';
  end if;
  if target_user_id = auth.uid() then
    raise exception 'You cannot remove your own super admin access';
  end if;
  delete from public.admin_users as au where au.user_id = target_user_id;
end;
$$;

revoke all on function public.remove_doniverse_admin(uuid) from public;
grant execute on function public.remove_doniverse_admin(uuid) to authenticated;

-- Keep old function names as compatibility aliases until every deployed client is updated.
create or replace function public.is_futago_admin(check_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public
as $$ select public.is_doniverse_admin(check_user_id); $$;

create or replace function public.is_futago_super_admin(check_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public
as $$ select public.is_doniverse_super_admin(check_user_id); $$;

create or replace function public.list_futago_admins()
returns table (user_id uuid, email text, role text, created_at timestamptz)
language sql stable security definer set search_path = public, auth
as $$ select * from public.list_doniverse_admins(); $$;

create or replace function public.set_futago_admin_by_email(target_email text, target_role text default 'admin')
returns jsonb language sql security definer set search_path = public, auth
as $$ select public.set_doniverse_admin_by_email(target_email, target_role); $$;

create or replace function public.remove_futago_admin(target_user_id uuid)
returns void language sql security definer set search_path = public
as $$ select public.remove_doniverse_admin(target_user_id); $$;

drop policy if exists "Admins can read all events" on public.events;
create policy "Admins can read all events" on public.events for select to authenticated using (public.is_doniverse_admin());
drop policy if exists "Admins can insert events" on public.events;
create policy "Admins can insert events" on public.events for insert to authenticated with check (public.is_doniverse_admin());
drop policy if exists "Admins can update events" on public.events;
create policy "Admins can update events" on public.events for update to authenticated using (public.is_doniverse_admin()) with check (public.is_doniverse_admin());
drop policy if exists "Admins can delete events" on public.events;
create policy "Admins can delete events" on public.events for delete to authenticated using (public.is_doniverse_admin());

drop policy if exists "Admins can read all communities" on public.communities;
create policy "Admins can read all communities" on public.communities for select to authenticated using (public.is_doniverse_admin());
drop policy if exists "Admins can insert communities" on public.communities;
create policy "Admins can insert communities" on public.communities for insert to authenticated with check (public.is_doniverse_admin());
drop policy if exists "Admins can update communities" on public.communities;
create policy "Admins can update communities" on public.communities for update to authenticated using (public.is_doniverse_admin()) with check (public.is_doniverse_admin());
drop policy if exists "Admins can delete communities" on public.communities;
create policy "Admins can delete communities" on public.communities for delete to authenticated using (public.is_doniverse_admin());

commit;

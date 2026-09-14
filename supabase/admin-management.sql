-- FUTAGO admin management
-- Run after supabase/admin-foundation.sql.
-- Lets super admins add/remove other admins securely by email.
-- Safe to run again: functions and policies are replaced cleanly.

begin;

create or replace function public.is_futago_super_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = check_user_id
      and role = 'super_admin'
  );
$$;

revoke all on function public.is_futago_super_admin(uuid) from public;
grant execute on function public.is_futago_super_admin(uuid) to authenticated;

-- Super admins can see the full admin membership table.
drop policy if exists "Super admins can read all admin roles" on public.admin_users;
create policy "Super admins can read all admin roles"
on public.admin_users
for select
to authenticated
using (public.is_futago_super_admin());

-- Listing is exposed through an RPC so emails can be shown without exposing auth.users directly.
create or replace function public.list_futago_admins()
returns table (
  user_id uuid,
  email text,
  role text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_futago_admin(auth.uid()) then
    raise exception 'Admin access required';
  end if;

  return query
  select
    a.user_id,
    u.email::text,
    a.role,
    a.created_at
  from public.admin_users as a
  left join auth.users as u on u.id = a.user_id
  order by
    case when a.role = 'super_admin' then 0 else 1 end,
    a.created_at asc;
end;
$$;

revoke all on function public.list_futago_admins() from public;
grant execute on function public.list_futago_admins() to authenticated;

-- Add a registered FUTAGO user as admin using their Supabase Auth email.
create or replace function public.set_futago_admin_by_email(
  target_email text,
  target_role text default 'admin'
)
returns table (
  user_id uuid,
  email text,
  role text
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_user_id uuid;
  normalized_email text;
begin
  if not public.is_futago_super_admin(auth.uid()) then
    raise exception 'Super admin access required';
  end if;

  if target_role not in ('admin', 'super_admin') then
    raise exception 'Invalid admin role';
  end if;

  normalized_email := lower(trim(target_email));

  select u.id
  into target_user_id
  from auth.users as u
  where lower(u.email) = normalized_email
  limit 1;

  if target_user_id is null then
    raise exception 'No FUTAGO account was found with that email';
  end if;

  insert into public.admin_users (user_id, role)
  values (target_user_id, target_role)
  on conflict (user_id)
  do update set role = excluded.role;

  return query
  select target_user_id, normalized_email, target_role;
end;
$$;

revoke all on function public.set_futago_admin_by_email(text, text) from public;
grant execute on function public.set_futago_admin_by_email(text, text) to authenticated;

-- Remove an admin. A super admin cannot remove their own access from the UI.
create or replace function public.remove_futago_admin(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_futago_super_admin(auth.uid()) then
    raise exception 'Super admin access required';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'You cannot remove your own super admin access';
  end if;

  delete from public.admin_users
  where user_id = target_user_id;
end;
$$;

revoke all on function public.remove_futago_admin(uuid) from public;
grant execute on function public.remove_futago_admin(uuid) to authenticated;

commit;

-- FUTAGO Admin foundation
-- Step 1 of the admin/moderation flow.
-- Run this file in the Supabase SQL editor after supabase/discover.sql.
-- Safe to run more than once.

begin;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin','super_admin')),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Helper used by RLS policies. Keeping this in the database means admin access
-- is not protected by a client-side check alone.
create or replace function public.is_futago_admin(check_user_id uuid default auth.uid())
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
  );
$$;

revoke all on function public.is_futago_admin(uuid) from public;
grant execute on function public.is_futago_admin(uuid) to authenticated;

-- Admins may read the admin membership table only for themselves.
drop policy if exists "Admins can read own admin role" on public.admin_users;
create policy "Admins can read own admin role"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

-- Existing public read policies remain intact. These policies add secure
-- moderation access for authenticated admins only.
drop policy if exists "Admins can read all events" on public.events;
create policy "Admins can read all events"
on public.events
for select
to authenticated
using (public.is_futago_admin());

drop policy if exists "Admins can insert events" on public.events;
create policy "Admins can insert events"
on public.events
for insert
to authenticated
with check (public.is_futago_admin());

drop policy if exists "Admins can update events" on public.events;
create policy "Admins can update events"
on public.events
for update
to authenticated
using (public.is_futago_admin())
with check (public.is_futago_admin());

drop policy if exists "Admins can delete events" on public.events;
create policy "Admins can delete events"
on public.events
for delete
to authenticated
using (public.is_futago_admin());

drop policy if exists "Admins can read all communities" on public.communities;
create policy "Admins can read all communities"
on public.communities
for select
to authenticated
using (public.is_futago_admin());

drop policy if exists "Admins can insert communities" on public.communities;
create policy "Admins can insert communities"
on public.communities
for insert
to authenticated
with check (public.is_futago_admin());

drop policy if exists "Admins can update communities" on public.communities;
create policy "Admins can update communities"
on public.communities
for update
to authenticated
using (public.is_futago_admin())
with check (public.is_futago_admin());

drop policy if exists "Admins can delete communities" on public.communities;
create policy "Admins can delete communities"
on public.communities
for delete
to authenticated
using (public.is_futago_admin());

commit;

-- After running this file, promote your first admin manually with the UUID from
-- Supabase Authentication > Users. Example:
-- insert into public.admin_users (user_id, role)
-- values ('YOUR-AUTH-USER-UUID', 'super_admin')
-- on conflict (user_id) do update set role = excluded.role;

-- DoniVerse places management
-- Run after supabase/doniverse-rebrand.sql.
-- Extends the existing places directory so admins can maintain a richer campus map.

begin;

alter table public.places
  add column if not exists aliases text[] not null default '{}',
  add column if not exists campus_area text,
  add column if not exists source text not null default 'doniverse',
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

-- Keep source values predictable without blocking older rows.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'places_source_check'
      and conrelid = 'public.places'::regclass
  ) then
    alter table public.places
      add constraint places_source_check
      check (source in ('doniverse', 'openstreetmap', 'community', 'import'));
  end if;
end $$;

create index if not exists places_aliases_gin_idx
  on public.places using gin (aliases);

create index if not exists places_campus_area_idx
  on public.places (campus_area);

create index if not exists places_active_name_idx
  on public.places (is_active, name);

create or replace function public.touch_place_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_places_updated_at on public.places;
create trigger touch_places_updated_at
before update on public.places
for each row execute function public.touch_place_updated_at();

alter table public.places enable row level security;

-- Existing public read policies can remain. This policy guarantees active places
-- stay readable by the app, while inactive places remain admin-only.
drop policy if exists "Public can read active places" on public.places;
create policy "Public can read active places"
on public.places
for select
to anon, authenticated
using (is_active = true);

-- Admins need full visibility so inactive locations can be restored or edited.
drop policy if exists "DoniVerse admins can read all places" on public.places;
create policy "DoniVerse admins can read all places"
on public.places
for select
to authenticated
using (public.is_doniverse_admin(auth.uid()));

drop policy if exists "DoniVerse admins can insert places" on public.places;
create policy "DoniVerse admins can insert places"
on public.places
for insert
to authenticated
with check (public.is_doniverse_admin(auth.uid()));

drop policy if exists "DoniVerse admins can update places" on public.places;
create policy "DoniVerse admins can update places"
on public.places
for update
to authenticated
using (public.is_doniverse_admin(auth.uid()))
with check (public.is_doniverse_admin(auth.uid()));

drop policy if exists "DoniVerse admins can delete places" on public.places;
create policy "DoniVerse admins can delete places"
on public.places
for delete
to authenticated
using (public.is_doniverse_admin(auth.uid()));

commit;

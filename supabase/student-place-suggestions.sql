-- DoniVerse student place suggestions
-- Students submit campus places with a GPS/map pin. Admins review and promote approved suggestions into public.places.

begin;

create table if not exists public.place_suggestions (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  name text not null,
  short_name text,
  aliases text[] not null default '{}',
  category text not null,
  description text,
  building_name text,
  floor text,
  campus_area text,
  latitude double precision not null,
  longitude double precision not null,
  gps_accuracy_m double precision,
  location_source text not null default 'map',
  status text not null default 'pending',
  admin_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  approved_place_id bigint references public.places(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint place_suggestions_category_check check (
    category in ('academic','study','health','food','services','support','sports','hostel','religious','transport','other')
  ),
  constraint place_suggestions_status_check check (status in ('pending','approved','rejected')),
  constraint place_suggestions_location_source_check check (location_source in ('gps','map')),
  constraint place_suggestions_latitude_check check (latitude between -90 and 90),
  constraint place_suggestions_longitude_check check (longitude between -180 and 180),
  constraint place_suggestions_accuracy_check check (gps_accuracy_m is null or gps_accuracy_m >= 0)
);

create index if not exists place_suggestions_status_created_idx
  on public.place_suggestions (status, created_at desc);
create index if not exists place_suggestions_created_by_idx
  on public.place_suggestions (created_by, created_at desc);
create index if not exists place_suggestions_coordinates_idx
  on public.place_suggestions (latitude, longitude);

create or replace function public.touch_place_suggestion_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_place_suggestions_updated_at on public.place_suggestions;
create trigger touch_place_suggestions_updated_at
before update on public.place_suggestions
for each row execute function public.touch_place_suggestion_updated_at();

alter table public.place_suggestions enable row level security;

-- Students may submit only as themselves and only into the pending queue.
drop policy if exists "Students can submit place suggestions" on public.place_suggestions;
create policy "Students can submit place suggestions"
on public.place_suggestions
for insert
to authenticated
with check (
  created_by = auth.uid()
  and status = 'pending'
  and reviewed_by is null
  and reviewed_at is null
  and approved_place_id is null
);

-- Students can see their own submissions and statuses.
drop policy if exists "Students can read own place suggestions" on public.place_suggestions;
create policy "Students can read own place suggestions"
on public.place_suggestions
for select
to authenticated
using (created_by = auth.uid());

-- Admins can review the entire queue and correct submitted details/pins before deciding.
drop policy if exists "DoniVerse admins can read place suggestions" on public.place_suggestions;
create policy "DoniVerse admins can read place suggestions"
on public.place_suggestions
for select
to authenticated
using (public.is_doniverse_admin(auth.uid()));

drop policy if exists "DoniVerse admins can update place suggestions" on public.place_suggestions;
create policy "DoniVerse admins can update place suggestions"
on public.place_suggestions
for update
to authenticated
using (public.is_doniverse_admin(auth.uid()))
with check (public.is_doniverse_admin(auth.uid()));

-- Approving is atomic: create the searchable place, then mark the suggestion approved.
create or replace function public.approve_doniverse_place_suggestion(p_suggestion_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.place_suggestions%rowtype;
  base_slug text;
  final_slug text;
  suffix integer := 1;
  new_place_id bigint;
begin
  if not public.is_doniverse_admin(auth.uid()) then
    raise exception 'Admin access required';
  end if;

  select * into s
  from public.place_suggestions
  where id = p_suggestion_id
  for update;

  if not found then
    raise exception 'Place suggestion not found';
  end if;

  if s.status <> 'pending' then
    raise exception 'Only pending suggestions can be approved';
  end if;

  base_slug := trim(both '-' from regexp_replace(lower(s.name), '[^a-z0-9]+', '-', 'g'));
  if base_slug = '' then
    base_slug := 'place-' || left(s.id::text, 8);
  end if;

  final_slug := base_slug;
  while exists (select 1 from public.places where slug = final_slug) loop
    suffix := suffix + 1;
    final_slug := base_slug || '-' || suffix::text;
  end loop;

  insert into public.places (
    name, slug, category, short_name, description, latitude, longitude,
    building_name, floor, is_featured, is_verified, is_active,
    aliases, campus_area, source, created_by, updated_by
  ) values (
    s.name, final_slug, s.category, nullif(s.short_name, ''), nullif(s.description, ''),
    s.latitude, s.longitude, nullif(s.building_name, ''), nullif(s.floor, ''),
    false, true, true, coalesce(s.aliases, '{}'), nullif(s.campus_area, ''),
    'community', s.created_by, auth.uid()
  )
  returning id into new_place_id;

  update public.place_suggestions
  set status = 'approved',
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      approved_place_id = new_place_id
  where id = p_suggestion_id;

  return new_place_id;
end;
$$;

create or replace function public.reject_doniverse_place_suggestion(
  p_suggestion_id uuid,
  p_admin_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_doniverse_admin(auth.uid()) then
    raise exception 'Admin access required';
  end if;

  update public.place_suggestions
  set status = 'rejected',
      admin_note = nullif(trim(coalesce(p_admin_note, '')), ''),
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = p_suggestion_id
    and status = 'pending';

  if not found then
    raise exception 'Pending place suggestion not found';
  end if;
end;
$$;

grant execute on function public.approve_doniverse_place_suggestion(uuid) to authenticated;
grant execute on function public.reject_doniverse_place_suggestion(uuid, text) to authenticated;

commit;

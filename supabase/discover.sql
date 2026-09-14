-- FUTAGO Discover data model
-- Run this file once in the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  event_type text not null default 'campus' check (event_type in ('academic','community','faith','social','sports','career','campus','other')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue_name text,
  venue_place_id bigint references public.places(id) on delete set null,
  organizer_name text not null,
  organizer_type text,
  official_url text,
  image_url text,
  status text not null default 'pending' check (status in ('draft','pending','approved','rejected')),
  is_featured boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_end_after_start check (ends_at is null or ends_at >= starts_at)
);

create index if not exists events_status_starts_at_idx on public.events(status, starts_at);
create index if not exists events_featured_idx on public.events(is_featured) where status = 'approved';
create index if not exists events_venue_place_idx on public.events(venue_place_id);

create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null default 'student' check (category in ('faith','academic','tech','creative','volunteering','student','sports','other')),
  description text,
  location_name text,
  place_id bigint references public.places(id) on delete set null,
  contact_url text,
  official_url text,
  status text not null default 'pending' check (status in ('draft','pending','approved','rejected')),
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists communities_status_idx on public.communities(status);
create index if not exists communities_category_idx on public.communities(category);

alter table public.events enable row level security;
alter table public.communities enable row level security;

drop policy if exists "Public can read approved events" on public.events;
create policy "Public can read approved events"
on public.events for select
to anon, authenticated
using (status = 'approved');

drop policy if exists "Public can read approved communities" on public.communities;
create policy "Public can read approved communities"
on public.communities for select
to anon, authenticated
using (status = 'approved');

-- Admin write policies are intentionally not added yet.
-- They will be introduced when FUTAGO Admin is built, so public clients cannot
-- create, approve, edit or delete Discover content directly.

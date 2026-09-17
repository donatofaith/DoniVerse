-- DoniVerse admin Discover submissions
-- Admins are also students, but their own event/community submissions do not need moderation.
-- This migration keeps normal student submissions pending while auto-approving submissions created by an admin.

begin;

create or replace function public.submit_doniverse_event(
  p_title text,
  p_description text,
  p_event_type text,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_venue_name text,
  p_venue_place_id bigint,
  p_organizer_name text,
  p_official_url text,
  p_image_url text,
  p_inquiry_name text,
  p_inquiry_phone text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_event_id uuid;
  v_title text := nullif(trim(p_title), '');
  v_organizer text := nullif(trim(p_organizer_name), '');
  v_slug text;
  v_is_admin boolean := false;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to submit an event';
  end if;

  v_is_admin := public.is_doniverse_admin(v_user_id);

  if v_title is null then raise exception 'Event title is required'; end if;
  if v_organizer is null then raise exception 'Organiser name is required'; end if;
  if p_starts_at is null then raise exception 'Event start date and time are required'; end if;
  if p_ends_at is not null and p_ends_at < p_starts_at then
    raise exception 'Event end time cannot be before the start time';
  end if;
  if p_event_type not in ('academic','community','faith','social','sports','career','campus','other') then
    raise exception 'Invalid event type';
  end if;
  if p_venue_place_id is not null and not exists (
    select 1 from public.places where id = p_venue_place_id and is_active = true
  ) then
    raise exception 'Selected campus venue is not available';
  end if;

  v_slug := regexp_replace(lower(v_title), '[^a-z0-9]+', '-', 'g');
  v_slug := trim(both '-' from v_slug);
  if v_slug = '' then v_slug := 'event'; end if;
  v_slug := left(v_slug, 70) || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);

  insert into public.events (
    title, slug, description, event_type, starts_at, ends_at, venue_name, venue_place_id,
    organizer_name, official_url, image_url, inquiry_name, inquiry_phone,
    status, is_featured, created_by, approved_by, approved_at, created_at, updated_at
  ) values (
    v_title, v_slug, nullif(trim(p_description), ''), p_event_type, p_starts_at, p_ends_at,
    nullif(trim(p_venue_name), ''), p_venue_place_id, v_organizer,
    nullif(trim(p_official_url), ''), nullif(trim(p_image_url), ''),
    nullif(trim(p_inquiry_name), ''), nullif(trim(p_inquiry_phone), ''),
    case when v_is_admin then 'approved' else 'pending' end,
    false,
    v_user_id,
    case when v_is_admin then v_user_id else null end,
    case when v_is_admin then now() else null end,
    now(), now()
  )
  returning id into v_event_id;

  return v_event_id;
end;
$$;

create or replace function public.submit_doniverse_community(
  p_name text,
  p_category text,
  p_description text,
  p_location_name text,
  p_place_id bigint,
  p_contact_url text,
  p_official_url text,
  p_image_url text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_id uuid;
  v_name text := nullif(trim(p_name), '');
  v_slug text;
  v_is_admin boolean := false;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to submit a community';
  end if;

  v_is_admin := public.is_doniverse_admin(v_user_id);

  if v_name is null then raise exception 'Community name is required'; end if;
  if p_category not in ('faith','academic','tech','creative','volunteering','student','sports','other') then
    raise exception 'Invalid community category';
  end if;
  if p_place_id is not null and not exists (
    select 1 from public.places where id = p_place_id and is_active = true
  ) then
    raise exception 'Selected campus location is not available';
  end if;

  v_slug := regexp_replace(lower(v_name), '[^a-z0-9]+', '-', 'g');
  v_slug := trim(both '-' from v_slug);
  if v_slug = '' then v_slug := 'community'; end if;
  v_slug := left(v_slug, 70) || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);

  insert into public.communities (
    name, slug, category, description, location_name, place_id, contact_url, official_url,
    image_url, status, is_verified, created_by, created_at, updated_at
  ) values (
    v_name, v_slug, p_category, nullif(trim(p_description), ''), nullif(trim(p_location_name), ''),
    p_place_id, nullif(trim(p_contact_url), ''), nullif(trim(p_official_url), ''),
    nullif(trim(p_image_url), ''),
    case when v_is_admin then 'approved' else 'pending' end,
    v_is_admin,
    v_user_id, now(), now()
  )
  returning id into v_id;

  return v_id;
end;
$$;

commit;

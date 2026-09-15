-- DoniVerse student event submissions
-- Run in Supabase SQL Editor after discover.sql, event-moderation.sql,
-- event-posters-storage.sql and doniverse-rebrand.sql.
-- Students can submit events for moderation but cannot publish or feature them.

begin;

-- Pending/rejected submissions must not become readable through the normal
-- events table just because the submitter is signed in. Discover only exposes
-- approved content. A dedicated "My submissions" RPC can be added separately
-- when that screen is built.
drop policy if exists "Students can read own event submissions" on public.events;

-- Student poster uploads are restricted to that user's own submissions folder.
-- The bucket's MIME type and 2 MB limits still apply.
drop policy if exists "Students can upload event submission posters" on storage.objects;
create policy "Students can upload event submission posters"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'event-posters'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] = 'submissions'
);

-- A controlled RPC is used instead of direct client inserts so students cannot
-- set approval, featured or moderation fields themselves.
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
begin
  if v_user_id is null then
    raise exception 'You must be signed in to submit an event';
  end if;

  if v_title is null then
    raise exception 'Event title is required';
  end if;

  if v_organizer is null then
    raise exception 'Organiser name is required';
  end if;

  if p_starts_at is null then
    raise exception 'Event start date and time are required';
  end if;

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
    title,
    slug,
    description,
    event_type,
    starts_at,
    ends_at,
    venue_name,
    venue_place_id,
    organizer_name,
    official_url,
    image_url,
    inquiry_name,
    inquiry_phone,
    status,
    is_featured,
    created_by,
    approved_by,
    approved_at,
    created_at,
    updated_at
  ) values (
    v_title,
    v_slug,
    nullif(trim(p_description), ''),
    p_event_type,
    p_starts_at,
    p_ends_at,
    nullif(trim(p_venue_name), ''),
    p_venue_place_id,
    v_organizer,
    nullif(trim(p_official_url), ''),
    nullif(trim(p_image_url), ''),
    nullif(trim(p_inquiry_name), ''),
    nullif(trim(p_inquiry_phone), ''),
    'pending',
    false,
    v_user_id,
    null,
    null,
    now(),
    now()
  )
  returning id into v_event_id;

  return v_event_id;
end;
$$;

revoke all on function public.submit_doniverse_event(
  text,text,text,timestamptz,timestamptz,text,bigint,text,text,text,text,text
) from public;
grant execute on function public.submit_doniverse_event(
  text,text,text,timestamptz,timestamptz,text,bigint,text,text,text,text,text
) to authenticated;

commit;

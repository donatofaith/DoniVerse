-- DoniVerse student community submissions
-- Run in Supabase SQL Editor after discover.sql and admin-foundation.sql.
-- Students can submit communities for moderation but cannot publish or verify them.

begin;

alter table public.communities
  add column if not exists created_by uuid references auth.users(id) on delete set null;

create index if not exists communities_created_by_idx on public.communities(created_by);

create or replace function public.submit_doniverse_community(
  p_name text,
  p_category text,
  p_description text,
  p_location_name text,
  p_place_id bigint,
  p_contact_url text,
  p_official_url text
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
begin
  if v_user_id is null then
    raise exception 'You must be signed in to submit a community';
  end if;

  if v_name is null then
    raise exception 'Community name is required';
  end if;

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
    name,
    slug,
    category,
    description,
    location_name,
    place_id,
    contact_url,
    official_url,
    status,
    is_verified,
    created_by,
    created_at,
    updated_at
  ) values (
    v_name,
    v_slug,
    p_category,
    nullif(trim(p_description), ''),
    nullif(trim(p_location_name), ''),
    p_place_id,
    nullif(trim(p_contact_url), ''),
    nullif(trim(p_official_url), ''),
    'pending',
    false,
    v_user_id,
    now(),
    now()
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_doniverse_community(text,text,text,text,bigint,text,text) from public;
grant execute on function public.submit_doniverse_community(text,text,text,text,bigint,text,text) to authenticated;

commit;

-- FUTAGO Discover test seed
-- Run this AFTER supabase/discover.sql.
-- This creates one clearly labeled test event so the Discover UI can be verified end-to-end.
-- It is intentionally not presented as a real FUTA event.

insert into public.events (
  title,
  slug,
  description,
  event_type,
  starts_at,
  ends_at,
  venue_name,
  organizer_name,
  organizer_type,
  status,
  is_featured,
  approved_at
)
values (
  'FUTAGO Test Event — Remove After Testing',
  'futago-test-event-remove-after-testing',
  'Internal FUTAGO test event used only to confirm that Discover can load approved event data from Supabase. This is not an official FUTA event.',
  'campus',
  '2026-09-16 14:00:00+01',
  '2026-09-16 16:00:00+01',
  'FUTA Campus — Test Venue',
  'FUTAGO Test',
  'internal test',
  'approved',
  true,
  now()
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  event_type = excluded.event_type,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  venue_name = excluded.venue_name,
  organizer_name = excluded.organizer_name,
  organizer_type = excluded.organizer_type,
  status = excluded.status,
  is_featured = excluded.is_featured,
  approved_at = now(),
  updated_at = now();

-- When testing is complete, remove it with:
-- delete from public.events where slug = 'futago-test-event-remove-after-testing';

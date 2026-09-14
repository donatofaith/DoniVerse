-- FUTAGO event moderation fields
-- Run after supabase/discover.sql and supabase/admin-foundation.sql.
-- Safe to run more than once.

begin;

alter table public.events
  add column if not exists inquiry_name text,
  add column if not exists inquiry_phone text;

create index if not exists events_created_at_idx
  on public.events(created_at desc);

commit;

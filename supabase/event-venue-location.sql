-- FUTAGO event venue coordinates
-- Run after supabase/discover.sql.
-- Safe to run more than once.

begin;

alter table public.events
  add column if not exists venue_latitude double precision,
  add column if not exists venue_longitude double precision;

commit;

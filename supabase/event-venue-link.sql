-- FUTAGO event venue map link
-- Run after supabase/discover.sql.
-- Safe to run more than once.

begin;

alter table public.events
  add column if not exists venue_place_id bigint;

-- Add the foreign key only if it does not already exist.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'events_venue_place_id_fkey'
      and conrelid = 'public.events'::regclass
  ) then
    alter table public.events
      add constraint events_venue_place_id_fkey
      foreign key (venue_place_id)
      references public.places(id)
      on delete set null;
  end if;
end
$$;

create index if not exists events_venue_place_idx
  on public.events(venue_place_id);

commit;

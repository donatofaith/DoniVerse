-- FUTAGO event poster storage
-- Run after supabase/admin-foundation.sql.
-- Creates a public bucket for event posters while keeping uploads admin-only.

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-posters',
  'event-posters',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Anyone can read poster files because Discover is public.
drop policy if exists "Public can view event posters" on storage.objects;
create policy "Public can view event posters"
on storage.objects
for select
to public
using (bucket_id = 'event-posters');

-- Only FUTAGO admins can upload or manage posters.
drop policy if exists "Admins can upload event posters" on storage.objects;
create policy "Admins can upload event posters"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'event-posters'
  and public.is_futago_admin(auth.uid())
);

drop policy if exists "Admins can update event posters" on storage.objects;
create policy "Admins can update event posters"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'event-posters'
  and public.is_futago_admin(auth.uid())
)
with check (
  bucket_id = 'event-posters'
  and public.is_futago_admin(auth.uid())
);

drop policy if exists "Admins can delete event posters" on storage.objects;
create policy "Admins can delete event posters"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'event-posters'
  and public.is_futago_admin(auth.uid())
);

commit;

-- DoniVerse approval email notification tracking
-- Run once in the Supabase SQL editor before enabling the approval webhooks.

begin;

create table if not exists public.notification_broadcasts (
  id uuid primary key default gen_random_uuid(),
  content_kind text not null check (content_kind in ('event', 'community')),
  content_id uuid not null,
  title text not null,
  status text not null default 'sending' check (status in ('sending', 'sent', 'failed')),
  recipients_count integer not null default 0,
  provider_message_ids jsonb,
  batch_keys jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (content_kind, content_id)
);

create index if not exists notification_broadcasts_created_at_idx
  on public.notification_broadcasts(created_at desc);

alter table public.notification_broadcasts enable row level security;

-- This table is server-only. The Supabase service role used by the Edge Function
-- bypasses RLS, while normal app clients do not need direct access.
revoke all on table public.notification_broadcasts from anon, authenticated;

commit;

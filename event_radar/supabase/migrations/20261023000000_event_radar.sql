create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  summary text not null check (char_length(summary) between 1 and 800),
  description text,
  event_date date not null,
  starts_at timestamptz,
  ends_at timestamptz,
  location text not null check (char_length(location) between 2 and 160),
  category text not null default 'other' check (category in ('workshop', 'social', 'career', 'arts', 'sports', 'other')),
  is_free_food boolean not null default false,
  source_url text,
  flyer_path text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  content_hash text not null unique,
  ai_confidence numeric(4,3) check (ai_confidence is null or (ai_confidence >= 0 and ai_confidence <= 1)),
  ai_provider text,
  ai_model text,
  created_by uuid references auth.users(id) on delete set null,
  moderated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_public_feed_idx on public.events (status, event_date, starts_at);
create index if not exists events_category_idx on public.events (category, status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

alter table public.events enable row level security;

drop policy if exists "Anyone can read approved events" on public.events;
create policy "Anyone can read approved events"
on public.events for select
to anon, authenticated
using (status = 'approved');

drop policy if exists "Moderators can read all events" on public.events;
create policy "Moderators can read all events"
on public.events for select
to authenticated
using (true);

drop policy if exists "Moderators can update events" on public.events;
create policy "Moderators can update events"
on public.events for update
to authenticated
using (true)
with check (true);

drop policy if exists "Moderators can delete events" on public.events;
create policy "Moderators can delete events"
on public.events for delete
to authenticated
using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('event-flyers', 'event-flyers', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can view event flyers" on storage.objects;
create policy "Anyone can view event flyers"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'event-flyers');

drop policy if exists "Moderators can upload event flyers" on storage.objects;
create policy "Moderators can upload event flyers"
on storage.objects for insert
to authenticated
with check (bucket_id = 'event-flyers');

drop policy if exists "Moderators can update event flyers" on storage.objects;
create policy "Moderators can update event flyers"
on storage.objects for update
to authenticated
using (bucket_id = 'event-flyers')
with check (bucket_id = 'event-flyers');

drop policy if exists "Moderators can delete event flyers" on storage.objects;
create policy "Moderators can delete event flyers"
on storage.objects for delete
to authenticated
using (bucket_id = 'event-flyers');

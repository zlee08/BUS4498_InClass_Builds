-- Week 10: memory of the agent's earlier work and chat messages.
-- The public website never receives agent_notes or chat message contents.
alter table public.events
  add column if not exists agent_notes jsonb not null default '{}'::jsonb;

create index if not exists events_club_history_idx
  on public.events (lower(club), created_at desc);

create table if not exists public.channel_messages (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'groupme',
  message_id text not null,
  sender_name text not null default '',
  message_text text not null,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  response_status text not null default ''
);

create unique index if not exists channel_messages_source_message_idx
  on public.channel_messages (source, message_id);

alter table public.channel_messages enable row level security;

grant select, insert, update, delete on public.channel_messages to service_role;
create index if not exists channel_messages_sender_idx
  on public.channel_messages (sender_name, created_at desc);

-- The event history itself remains readable only through the existing
-- published-event policy for visitors. The agent uses the service key to
-- inspect the latest ten published or waiting posts before each decision.

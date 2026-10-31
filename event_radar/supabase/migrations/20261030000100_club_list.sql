-- Week 10: durable club knowledge.
-- Moderators maintain this table in Supabase Table Editor. The agent reads it
-- before every post, so aliases can resolve to an official club name without
-- redeploying the function.
create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  official_name text not null,
  aliases text[] not null default '{}',
  active boolean not null default true,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists clubs_official_name_idx
  on public.clubs (lower(official_name));

create or replace function public.set_clubs_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clubs_set_updated_at on public.clubs;
create trigger clubs_set_updated_at
before update on public.clubs
for each row execute function public.set_clubs_updated_at();

alter table public.clubs enable row level security;

drop policy if exists "Moderators can read clubs" on public.clubs;
create policy "Moderators can read clubs"
  on public.clubs for select to authenticated using (true);

drop policy if exists "Moderators can add clubs" on public.clubs;
create policy "Moderators can add clubs"
  on public.clubs for insert to authenticated with check (true);

drop policy if exists "Moderators can update clubs" on public.clubs;
create policy "Moderators can update clubs"
  on public.clubs for update to authenticated using (true) with check (true);

grant select on public.clubs to authenticated;
grant select, insert, update, delete on public.clubs to service_role;

-- Week 10: moderator lessons.
-- Lessons are explicit, one sentence at a time. A public post can never add
-- or edit a lesson because there is no anon policy or grant for this table.
create table if not exists public.agent_lessons (
  id uuid primary key default gen_random_uuid(),
  lesson text not null check (char_length(lesson) between 1 and 300),
  active boolean not null default true,
  created_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_agent_lessons_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists agent_lessons_set_updated_at on public.agent_lessons;
create trigger agent_lessons_set_updated_at
before update on public.agent_lessons
for each row execute function public.set_agent_lessons_updated_at();

alter table public.agent_lessons enable row level security;

drop policy if exists "Moderators can read lessons" on public.agent_lessons;
create policy "Moderators can read lessons"
  on public.agent_lessons for select to authenticated using (true);

drop policy if exists "Moderators can add lessons" on public.agent_lessons;
create policy "Moderators can add lessons"
  on public.agent_lessons for insert to authenticated with check (true);

drop policy if exists "Moderators can update lessons" on public.agent_lessons;
create policy "Moderators can update lessons"
  on public.agent_lessons for update to authenticated using (true) with check (true);

grant select, insert, update on public.agent_lessons to authenticated;
grant select, insert, update, delete on public.agent_lessons to service_role;

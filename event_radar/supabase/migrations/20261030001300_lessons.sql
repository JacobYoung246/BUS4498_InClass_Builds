-- Stage 13: lessons (what moderators teach the agent).
-- Only signed-in moderators can write lessons. The agent reads the active ones before
-- every post; it never writes a lesson itself, and text in a post can never become one.

create table public.lessons (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lesson     text not null check (char_length(lesson) between 5 and 300),
  active     boolean not null default true,
  created_by text not null default '',
  from_post  uuid references public.events (id) on delete set null
);

-- Security rules: row-level security on, signed-in moderators only.
alter table public.lessons enable row level security;

create policy "Moderators can read lessons"
  on public.lessons
  for select
  to authenticated
  using (true);

create policy "Moderators can add lessons"
  on public.lessons
  for insert
  to authenticated
  with check (created_by = coalesce(auth.jwt() ->> 'email', ''));

create policy "Moderators can switch lessons on and off"
  on public.lessons
  for update
  to authenticated
  using (true)
  with check (true);

-- Grants: start from nothing; visitors get nothing at all.
revoke all on table public.lessons from anon, authenticated;
grant select on table public.lessons to authenticated;
grant insert (lesson, created_by, from_post) on table public.lessons to authenticated;
grant update (active) on table public.lessons to authenticated;
grant select, insert, update, delete on table public.lessons to service_role;

-- The lessons the agent followed, saved with every post.
alter table public.events
  add column lessons_used text[] not null default '{}';

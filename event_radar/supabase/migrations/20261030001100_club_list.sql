-- Stage 11: the club list (knowledge).
-- The agent reads the active clubs before every post. Moderators keep the list
-- current in Table Editor -> clubs, and the next post sees the change with nothing redeployed.

create table public.clubs (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  name               text not null unique check (char_length(name) between 1 and 100),
  nicknames          text not null default '',
  usual_place_code   text not null default '',
  usual_place_detail text not null default '',
  active             boolean not null default true,
  note               text not null default ''
);

-- Security rules: row-level security on, visitors may only see active clubs.
alter table public.clubs enable row level security;

create policy "Visitors can read active clubs"
  on public.clubs
  for select
  to anon, authenticated
  using (active);

-- Grants: start from nothing (some projects hand every new table to visitors),
-- then give the website the names only. The usual places stay with the agent.
revoke all on table public.clubs from anon, authenticated;
grant select (id, name, nicknames, active) on table public.clubs to anon, authenticated;
grant select, insert, update, delete on table public.clubs to service_role;

-- The six made-up clubs from context/clubs.md.
insert into public.clubs (name, nicknames, usual_place_code, usual_place_detail) values
  ('Board Game Guild',              'BGG, board game club, board gamers',                        'UU',          'Room 220'),
  ('Mustang Pitch Society',         'MPS, pitch society, pitch club',                            'UU-PLAZA',    ''),
  ('Women in Finance Circle',       'WIFC, women in finance',                                    'BUSINESS',    'Room 104'),
  ('Sustainability Crew',           'sustainability club, green crew',                           'DEXTER-LAWN', ''),
  ('Accounting Society',            'accounting club, AcctSoc',                                  'BUSINESS',    'Room 212'),
  ('Cal Poly Ski & Snowboard Club', 'ski club, snowboard club, ski and snowboard club, Ski & Snowboard', 'UU', '')
on conflict (name) do nothing;

-- What the agent looked at before it decided, saved with every post.
alter table public.events
  add column agent_notes text[] not null default '{}';

-- The moderator's "Clear the board" tool deletes posts.
create policy "Moderators can delete events"
  on public.events
  for delete
  to authenticated
  using (true);

grant delete on table public.events to authenticated;

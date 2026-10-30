-- Stage 14: read posts from a chat group (GroupMe).
-- Every minute, a scheduled job asks the reader (read-channel) to read the group's new messages.
-- The reader sends each one to the agent, which decides it once and only once.

-- Where each post came from: "groupme", the message id, and the sender's name.
alter table public.events
  add column source      text not null default '',
  add column source_id   text not null default '',
  add column source_name text not null default '';

-- One decision per chat message, enforced by the database.
create unique index events_one_per_message
  on public.events (source, source_id)
  where source_id <> '';

-- The reader's bookmark: the last message it read, so it never reads a message twice.
create table public.channel_cursor (
  source     text primary key,
  last_id    text not null default '',
  read_count integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Security rules: only the reader (the secret key, acting as service_role) may touch the bookmark.
alter table public.channel_cursor enable row level security;
revoke all on table public.channel_cursor from anon, authenticated;
grant select, insert, update, delete on table public.channel_cursor to service_role;

-- The scheduled job (Integrations -> Cron). pg_net lets the database call the reader over the web.
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Replace the job if it already exists, so this file can run again safely.
select cron.unschedule(jobid) from cron.job where jobname = 'read-chat-channel';

-- The Project URL and the publishable key are public values; the publishable key goes on the apikey header.
select cron.schedule(
  'read-chat-channel',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://uxffylbnvxxqrypjebdm.supabase.co/functions/v1/read-channel',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'sb_publishable_puliS7JvMwE2ryNVg5P96g_I9x45uzK'
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);

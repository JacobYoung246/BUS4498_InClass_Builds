-- Stage 12: the club's earlier posts (memory of what happened).
-- When a post updates one of the club's upcoming posts, the earlier post is retired
-- as "replaced" instead of leaving two cards for one event.

-- A fifth status: replaced.
alter table public.events drop constraint events_status_check;
alter table public.events add constraint events_status_check
  check (status in ('published', 'waiting', 'rejected', 'archived', 'replaced'));

-- replaced_by: on the earlier post, the newer post that replaced it.
-- updates_id: on a waiting update, the earlier post it will replace once a moderator approves it.
alter table public.events
  add column replaced_by uuid references public.events (id) on delete set null,
  add column updates_id  uuid references public.events (id) on delete set null;

-- Moderators may now also mark a post replaced (approving an update retires the earlier post).
drop policy "Moderators can review events" on public.events;

create policy "Moderators can review events"
  on public.events
  for update
  to authenticated
  using (true)
  with check (status in ('published', 'waiting', 'rejected', 'replaced'));

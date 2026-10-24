-- Stage 7: photo uploads.
-- Each post can have a flyer photo. The agent uploads it and saves its public link here.

alter table public.events
  add column flyer_url text not null default '';

-- The website may read the flyer link, like the other public columns.
grant select (flyer_url) on table public.events to anon, authenticated;

-- A public storage bucket for flyer photos: 5 MB each, JPG or PNG only.
-- Anyone can open a photo by its link, but the website gets no storage policies,
-- so only the agent (using the secret key) can upload.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('flyers', 'flyers', true, 5242880, array['image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

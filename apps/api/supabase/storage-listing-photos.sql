-- Storage setup for manual-entry vehicle photos.
--
-- The manual "Ask Ralph" flow lets a buyer upload photos of the car. They are
-- stored in a PUBLIC bucket so the saved report (and the confirm step) can show
-- them via a plain public URL. Uploads are scoped: a signed-in user may only
-- write into a folder named after their own auth uid (path = `<uid>/<uuid>.ext`,
-- matching apps/web/app/lib/upload-listing-photos.ts).
--
-- Run this ONCE in the Supabase SQL Editor (PostgREST/REST can't create buckets
-- or storage policies). Idempotent — safe to re-run.

-- 1. The bucket (public read).
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do update set public = true;

-- 2. Anyone can read (bucket is public; explicit policy keeps intent clear).
drop policy if exists "listing-photos public read" on storage.objects;
create policy "listing-photos public read"
on storage.objects
for select
to public
using (bucket_id = 'listing-photos');

-- 3. A signed-in user may upload only into their own `<uid>/…` folder.
drop policy if exists "listing-photos owner insert" on storage.objects;
create policy "listing-photos owner insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'listing-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. A signed-in user may replace/delete only their own files.
drop policy if exists "listing-photos owner modify" on storage.objects;
create policy "listing-photos owner modify"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'listing-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "listing-photos owner delete" on storage.objects;
create policy "listing-photos owner delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'listing-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

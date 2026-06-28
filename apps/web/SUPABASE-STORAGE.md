# Supabase Storage — manual-entry listing photos

Manual checks let users upload car photos. Ralph's AI **reads those photos by
URL** during analysis, so they must live in a **public** Supabase Storage
bucket. The web app uploads to a bucket called `listing-photos`
(see `apps/web/app/lib/upload-listing-photos.ts`).

You only need to do this **once per Supabase project**.

## Option A — SQL (fastest)

Open Supabase → **SQL Editor** → run:

```sql
-- 1. Public bucket for listing photos
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

-- 2. Signed-in users may upload into their own folder (path = <user-id>/<file>)
create policy "listing-photos: users upload own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Anyone can read (the AI fetches the public URL)
create policy "listing-photos: public read"
  on storage.objects for select to public
  using (bucket_id = 'listing-photos');
```

## Option B — Dashboard (clicky)

1. Supabase → **Storage** → **New bucket**.
2. Name it `listing-photos`, tick **Public bucket**, create.
3. **Policies** → add an INSERT policy for `authenticated` and a SELECT policy
   for `public` (the SQL above shows the exact rules).

## Notes

- **Public bucket** is required because OpenAI's vision model fetches the image
  by URL. If you'd rather keep photos private, we'd need to switch to signed
  URLs and pass those to the analyser — a follow-up change.
- Photos are stored under `listing-photos/<user-id>/<uuid>.<ext>`.
- Consider setting a bucket file-size limit (e.g. 10 MB) and restricting MIME
  types to `image/*` in the bucket settings to keep storage tidy.
- No new env vars are needed — uploads use the existing
  `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

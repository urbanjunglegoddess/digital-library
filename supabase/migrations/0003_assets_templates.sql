-- =============================================================================
-- Digital Asset Library — Phase 4: assets, templates, preferences
-- Migration 0003_assets_templates
--
--   1. `assets.owner_id` — v1 created `assets` with a public-read / admin-write
--      policy and no owner, so a signed-in user had nowhere to put an upload.
--      Uploads are now owned, and visibility is explicit rather than implied.
--   2. A private Storage bucket plus the object-level policies that keep each
--      user inside their own folder.
--   3. `templates` gains timestamps so the Template Hub can order by recency.
--   4. `profiles.preferences` — per-account UI defaults (opening skin, default
--      code target), so they follow a user across devices instead of living in
--      one browser's localStorage.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. assets: ownership and visibility
-- ---------------------------------------------------------------------------
alter table public.assets
  add column if not exists owner_id  uuid references auth.users (id) on delete cascade,
  add column if not exists is_public boolean not null default false;

create index if not exists assets_owner_id_idx on public.assets (owner_id);
create index if not exists assets_type_idx     on public.assets (type);

-- v1's blanket public-read predates uploads; replace it with one that keeps a
-- user's own files private unless they publish them. Seeded catalog assets
-- (owner_id is null) stay world-readable, which is what that policy was for.
drop policy if exists assets_public_read on public.assets;
create policy assets_public_read on public.assets
  for select using (
    owner_id is null or is_public or owner_id = auth.uid() or public.is_admin()
  );

drop policy if exists assets_admin_write on public.assets;
create policy assets_admin_write on public.assets
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- A signed-in user manages the rows they own; `owner_id = auth.uid()` in the
-- WITH CHECK is what stops anyone inserting a row owned by someone else.
drop policy if exists assets_owner_write on public.assets;
create policy assets_owner_write on public.assets
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 2. Storage bucket for user uploads
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'assets',
  'assets',
  false,                                   -- served through signed URLs
  10485760,                                -- 10 MB per object
  array[
    'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif',
    'image/svg+xml', 'application/json', 'text/plain', 'text/css',
    'text/markdown', 'application/zip'
  ]
)
on conflict (id) do update
  set file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types,
      public             = excluded.public;

-- Objects are keyed `<user-id>/<filename>`, so the first path segment is the
-- owner. Comparing it to auth.uid() is what confines a user to their own
-- folder — there is no application code in this path to get it wrong.
drop policy if exists "assets own folder read"   on storage.objects;
create policy "assets own folder read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "assets own folder insert" on storage.objects;
create policy "assets own folder insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "assets own folder update" on storage.objects;
create policy "assets own folder update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "assets own folder delete" on storage.objects;
create policy "assets own folder delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- 3. templates: timestamps
-- ---------------------------------------------------------------------------
alter table public.templates
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists templates_set_updated_at on public.templates;
create trigger templates_set_updated_at
  before update on public.templates
  for each row execute function public.set_updated_at();

create index if not exists templates_updated_at_idx
  on public.templates (owner_id, updated_at desc);

-- ---------------------------------------------------------------------------
-- 4. profiles: per-account UI preferences
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists preferences jsonb not null default '{}'::jsonb;

-- =============================================================================
-- Digital Asset Library — schema v1
-- Migration 0001_init
--
-- Realizes the LOCKED v1 data model (CLAUDE.md / ClickUp 838qa-87871
-- "Data Model & Schema") in Supabase Postgres, project ref cmluzusujsbxscljszbn.
--
-- Everything lives in the `public` schema with Row-Level Security enabled on
-- every table. RLS is the real authorization boundary, not the API layer:
--   * public (anon) read on the PUBLISHED catalog,
--   * writes limited to owner/admin (admin via profiles.role),
--   * user-scoped rows (collections, collection_items, templates) private to
--     their owner via auth.uid().
--
-- "Published" for a component = its status is on the shippable end of the
-- ladder: built | audited | reusable. (Idea / drafting rows stay private to
-- admins.) Snippets and references inherit their parent component's visibility.
--
-- All tables are CREATED here in Phase 0; individual features go live later
-- (catalog Phase 2, accounts Phase 3, assets/templates Phase 4).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists pg_trgm;     -- trigram fuzzy search

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'component_status') then
    create type public.component_status as enum
      ('idea', 'drafting', 'built', 'audited', 'reusable');
  end if;
  if not exists (select 1 from pg_type where typname = 'reference_source') then
    create type public.reference_source as enum
      ('mdn', 'so', 'github', 'apg', 'other');
  end if;
  if not exists (select 1 from pg_type where typname = 'asset_type') then
    create type public.asset_type as enum
      ('component', 'snippet', 'template', 'token', 'image');
  end if;
end$$;

-- ---------------------------------------------------------------------------
-- Helper: updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Helper: is_admin() — SECURITY DEFINER so it reads profiles without tripping
-- RLS (and without recursive policy evaluation on the profiles table).
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- =============================================================================
-- Core content tables  (Phase 0 create · Phase 2 live)
-- =============================================================================

-- categories -----------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  sort        int not null default 0
);

-- components ------------------------------------------------------------------
create table if not exists public.components (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  name             text not null,
  category_id      uuid references public.categories (id) on delete set null,
  status           public.component_status not null default 'idea',
  summary          text,
  doc_md           text,
  clickup_page_id  text,                       -- traceability to doc 838qa-81211
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- Full-text search vector, kept in sync automatically.
  search_vector    tsvector generated always as (
    to_tsvector(
      'english',
      coalesce(name, '') || ' ' ||
      coalesce(summary, '') || ' ' ||
      coalesce(doc_md, '')
    )
  ) stored
);

create trigger components_set_updated_at
  before update on public.components
  for each row execute function public.set_updated_at();

-- Search indexes: GIN over the tsvector, trigram GIN for fuzzy name/slug.
create index if not exists components_search_vector_idx
  on public.components using gin (search_vector);
create index if not exists components_name_trgm_idx
  on public.components using gin (name gin_trgm_ops);
create index if not exists components_slug_trgm_idx
  on public.components using gin (slug gin_trgm_ops);
create index if not exists components_category_id_idx
  on public.components (category_id);
create index if not exists components_status_idx
  on public.components (status);

-- visual_styles --------------------------------------------------------------
create table if not exists public.visual_styles (
  id   uuid primary key default gen_random_uuid(),
  key  text unique not null,
  name text not null
);

-- code_snippets --------------------------------------------------------------
create table if not exists public.code_snippets (
  id           uuid primary key default gen_random_uuid(),
  component_id uuid not null references public.components (id) on delete cascade,
  language     text not null,
  framework    text,
  code         text not null,
  is_primary   boolean not null default false
);

create index if not exists code_snippets_component_id_idx
  on public.code_snippets (component_id);

-- tags -----------------------------------------------------------------------
create table if not exists public.tags (
  id   uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null
);

-- component_tags (M:N) -------------------------------------------------------
create table if not exists public.component_tags (
  component_id uuid not null references public.components (id) on delete cascade,
  tag_id       uuid not null references public.tags (id) on delete cascade,
  primary key (component_id, tag_id)
);

create index if not exists component_tags_tag_id_idx
  on public.component_tags (tag_id);

-- references -----------------------------------------------------------------
create table if not exists public.references (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  url          text not null,
  source       public.reference_source not null default 'other',
  component_id uuid references public.components (id) on delete cascade
);

create index if not exists references_component_id_idx
  on public.references (component_id);

-- =============================================================================
-- Asset & template tables  (Phase 0 create · live Phase 4)
-- =============================================================================

-- assets ---------------------------------------------------------------------
create table if not exists public.assets (
  id           uuid primary key default gen_random_uuid(),
  type         public.asset_type not null,
  title        text not null,
  storage_path text,
  meta         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

-- templates (owner-scoped) ---------------------------------------------------
create table if not exists public.templates (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  owner_id    uuid not null references auth.users (id) on delete cascade,
  config      jsonb not null default '{}'::jsonb
);

create index if not exists templates_owner_id_idx
  on public.templates (owner_id);

-- =============================================================================
-- Account & personalization tables  (Phase 0 create · live Phase 3)
-- =============================================================================

-- profiles (1:1 with auth.users) ---------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role         text not null default 'user'
);

-- collections (owner-scoped) -------------------------------------------------
create table if not exists public.collections (
  id       uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name     text not null
);

create index if not exists collections_owner_id_idx
  on public.collections (owner_id);

-- collection_items (M:N) -----------------------------------------------------
create table if not exists public.collection_items (
  collection_id uuid not null references public.collections (id) on delete cascade,
  component_id  uuid not null references public.components (id) on delete cascade,
  primary key (collection_id, component_id)
);

create index if not exists collection_items_component_id_idx
  on public.collection_items (component_id);

-- ---------------------------------------------------------------------------
-- Auto-provision a profile row when a new auth user is created (used Phase 3).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', null))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Guard: a non-admin user may update their own profile but NOT their role.
-- ---------------------------------------------------------------------------
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    new.role = old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- =============================================================================
-- Row-Level Security
-- =============================================================================
alter table public.categories       enable row level security;
alter table public.components        enable row level security;
alter table public.visual_styles     enable row level security;
alter table public.code_snippets     enable row level security;
alter table public.tags              enable row level security;
alter table public.component_tags    enable row level security;
alter table public.references        enable row level security;
alter table public.assets            enable row level security;
alter table public.templates         enable row level security;
alter table public.profiles          enable row level security;
alter table public.collections       enable row level security;
alter table public.collection_items  enable row level security;

-- --- Reference data: public read, admin write ------------------------------
-- categories
create policy categories_public_read on public.categories
  for select using (true);
create policy categories_admin_write on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- visual_styles
create policy visual_styles_public_read on public.visual_styles
  for select using (true);
create policy visual_styles_admin_write on public.visual_styles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- tags
create policy tags_public_read on public.tags
  for select using (true);
create policy tags_admin_write on public.tags
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- component_tags
create policy component_tags_public_read on public.component_tags
  for select using (true);
create policy component_tags_admin_write on public.component_tags
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- --- components: public read on published rows; admin sees & writes all -----
create policy components_public_read on public.components
  for select using (
    status in ('built', 'audited', 'reusable') or public.is_admin()
  );
create policy components_admin_write on public.components
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- --- code_snippets: visible when parent component is published (or admin) ---
create policy code_snippets_public_read on public.code_snippets
  for select using (
    public.is_admin() or exists (
      select 1 from public.components c
      where c.id = code_snippets.component_id
        and c.status in ('built', 'audited', 'reusable')
    )
  );
create policy code_snippets_admin_write on public.code_snippets
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- --- references: standalone rows public; component-bound follow the component
create policy references_public_read on public.references
  for select using (
    public.is_admin()
    or component_id is null
    or exists (
      select 1 from public.components c
      where c.id = references.component_id
        and c.status in ('built', 'audited', 'reusable')
    )
  );
create policy references_admin_write on public.references
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- --- assets: public read, admin write --------------------------------------
create policy assets_public_read on public.assets
  for select using (true);
create policy assets_admin_write on public.assets
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- --- profiles: read own (or admin any); update own; role changes admin-only -
create policy profiles_self_read on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy profiles_self_insert on public.profiles
  for insert to authenticated with check (id = auth.uid() or public.is_admin());
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
create policy profiles_admin_delete on public.profiles
  for delete to authenticated using (public.is_admin());

-- --- templates: private to owner -------------------------------------------
create policy templates_owner_all on public.templates
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- --- collections: private to owner -----------------------------------------
create policy collections_owner_all on public.collections
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- --- collection_items: gated through the parent collection's ownership ------
create policy collection_items_owner_all on public.collection_items
  for all to authenticated
  using (
    exists (
      select 1 from public.collections c
      where c.id = collection_items.collection_id
        and c.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.collections c
      where c.id = collection_items.collection_id
        and c.owner_id = auth.uid()
    )
  );

-- =============================================================================
-- Seed data
-- =============================================================================

-- The 11 visual styles. `key` matches the [data-style="…"] attribute the
-- component-library token layer (styles/tokens.css) switches on, so the app
-- can map a DB style straight onto a rendered skin.
insert into public.visual_styles (key, name) values
  ('ujg',      'UJG'),
  ('flat',     'Flat'),
  ('material', 'Material'),
  ('glass',    'Glassmorphism'),
  ('liquid',   'Liquid Glass'),
  ('neu',      'Neumorphism'),
  ('skeu',     'Skeuomorphism'),
  ('brut',     'Neo-Brutalism'),
  ('clay',     'Claymorphism'),
  ('aurora',   'Aurora'),
  ('swiss',    'Swiss')
on conflict (key) do nothing;

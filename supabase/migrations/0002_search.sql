-- =============================================================================
-- Digital Asset Library — Phase 2: data & search
-- Migration 0002_search
--
-- Schema v1 (0001) is unchanged in shape; this migration is purely additive:
--
--   1. `component_styles` — the M:N between a component and the skins it ships
--      under. v1 modelled `visual_styles` but never joined it to components.
--   2. Ordering / grouping columns on `visual_styles`, plus the 19 extended
--      skins the token layer grew after v1 was written (styles/tokens.css now
--      defines 30; the database only knew the base 11).
--   3. `components.meta` — presentation metadata carried in the MDX
--      frontmatter (playground basename, preview spec) that has no v1 column.
--   4. `search_components()` — one ranked, filtered query behind the search
--      API. SECURITY INVOKER, so Row-Level Security still decides what a
--      caller can see; the function is a query shape, never a privilege.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. component_styles
-- ---------------------------------------------------------------------------
create table if not exists public.component_styles (
  component_id uuid not null references public.components (id) on delete cascade,
  style_id     uuid not null references public.visual_styles (id) on delete cascade,
  primary key (component_id, style_id)
);

create index if not exists component_styles_style_id_idx
  on public.component_styles (style_id);

alter table public.component_styles enable row level security;

drop policy if exists component_styles_public_read on public.component_styles;
create policy component_styles_public_read on public.component_styles
  for select using (true);

drop policy if exists component_styles_admin_write on public.component_styles;
create policy component_styles_admin_write on public.component_styles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. visual_styles: ordering + core/extended grouping, then the extended skins
-- ---------------------------------------------------------------------------
alter table public.visual_styles
  add column if not exists sort    int     not null default 0,
  add column if not exists is_core boolean not null default false;

-- Base 11 (the locked set).
insert into public.visual_styles (key, name, sort, is_core) values
  ('ujg',      'UJG',            1,  true),
  ('flat',     'Flat',           2,  true),
  ('material', 'Material',       3,  true),
  ('glass',    'Glassmorphism',  4,  true),
  ('liquid',   'Liquid Glass',   5,  true),
  ('neu',      'Neumorphism',    6,  true),
  ('skeu',     'Skeuomorphism',  7,  true),
  ('brut',     'Neo-Brutalism',  8,  true),
  ('clay',     'Claymorphism',   9,  true),
  ('aurora',   'Aurora',        10,  true),
  ('swiss',    'Swiss',         11,  true)
on conflict (key) do update
  set name = excluded.name, sort = excluded.sort, is_core = excluded.is_core;

-- Extended 19 (added to styles/tokens.css after v1 was locked).
insert into public.visual_styles (key, name, sort, is_core) values
  ('minimal',   'Minimalism',           12, false),
  ('maximal',   'Maximalism',           13, false),
  ('surreal',   'Surrealism',           14, false),
  ('scrap',     'Scrapbook',            15, false),
  ('y2k',       'Y2K',                  16, false),
  ('bento',     'Bento Grid',           17, false),
  ('boho',      'Bohemian',             18, false),
  ('victorian', 'Victorian',            19, false),
  ('cyber',     'Cyberpunk',            20, false),
  ('gothic',    'Gothic',               21, false),
  ('graffiti',  'Graffiti',             22, false),
  ('sketch',    'Conceptual Sketch',    23, false),
  ('afro',      'Afrofuturism',         24, false),
  ('psych',     'Psychedelic',          25, false),
  ('editorial', 'Editorial',            26, false),
  ('nsibidi',   'Uli / Nsibidi',        27, false),
  ('sudanese',  'Sudanese Modernism',   28, false),
  ('bauhaus',   'Bauhaus',              29, false),
  ('punk',      'Punk Grunge',          30, false)
on conflict (key) do update
  set name = excluded.name, sort = excluded.sort, is_core = excluded.is_core;

-- ---------------------------------------------------------------------------
-- 3. components.meta — playground basename + preview spec from frontmatter
-- ---------------------------------------------------------------------------
alter table public.components
  add column if not exists meta jsonb not null default '{}'::jsonb;

-- Language filtering hits code_snippets by lowercased language.
create index if not exists code_snippets_language_idx
  on public.code_snippets (lower(language));

-- ---------------------------------------------------------------------------
-- 4. search_components()
--
-- Ranked full-text search with a trigram fallback, plus category / tag /
-- language / style / status filters. Returns the window total alongside every
-- row so a caller can paginate without a second round trip.
--
-- SECURITY INVOKER (the default) is deliberate: the function runs as the
-- caller, so the RLS policies from 0001 still gate which components are
-- visible. Only an admin sees idea/drafting rows.
-- ---------------------------------------------------------------------------
create or replace function public.search_components(
  q               text     default null,
  category_slugs  text[]   default null,
  tag_slugs       text[]   default null,
  languages       text[]   default null,
  style_keys      text[]   default null,
  status_filter   text[]   default null,
  lim             int      default 60,
  off             int      default 0
)
returns table (
  id            uuid,
  slug          text,
  name          text,
  summary       text,
  status        public.component_status,
  category_slug text,
  category_name text,
  tags          text[],
  languages     text[],
  style_count   int,
  rank          real,
  total         bigint
)
language sql
stable
as $function$
  with normalized as (
    select
      nullif(btrim(coalesce(q, '')), '') as term,
      case
        when coalesce(array_length(languages, 1), 0) = 0 then null
        else (select array_agg(lower(l)) from unnest(languages) as l)
      end as langs
  ),
  matched as (
    select
      c.id,
      c.slug,
      c.name,
      c.summary,
      c.status,
      cat.slug as category_slug,
      cat.name as category_name,
      -- Rank: lexical match first, then fuzzy name similarity, so a typo
      -- ("accordian") still surfaces the component but never outranks a
      -- genuine full-text hit. An exact slug match always wins.
      case
        when n.term is null then 0::real
        else ts_rank(c.search_vector, websearch_to_tsquery('english', n.term))
             + similarity(c.name, n.term)
             + case when c.slug = lower(n.term) then 1.0 else 0 end
      end as rank
    from public.components c
    left join public.categories cat on cat.id = c.category_id
    cross join normalized n
    where
      (status_filter is null or c.status::text = any (status_filter))
      and (category_slugs is null or cat.slug = any (category_slugs))
      and (
        tag_slugs is null or exists (
          select 1
          from public.component_tags ct
          join public.tags t on t.id = ct.tag_id
          where ct.component_id = c.id and t.slug = any (tag_slugs)
        )
      )
      and (
        n.langs is null or exists (
          select 1 from public.code_snippets s
          where s.component_id = c.id and lower(s.language) = any (n.langs)
        )
      )
      and (
        style_keys is null or exists (
          select 1
          from public.component_styles cs
          join public.visual_styles vs on vs.id = cs.style_id
          where cs.component_id = c.id and vs.key = any (style_keys)
        )
      )
      and (
        n.term is null
        or c.search_vector @@ websearch_to_tsquery('english', n.term)
        or c.name ilike '%' || n.term || '%'
        or c.slug ilike '%' || n.term || '%'
        or similarity(c.name, n.term) > 0.2
      )
  )
  select
    m.id,
    m.slug,
    m.name,
    m.summary,
    m.status,
    m.category_slug,
    m.category_name,
    coalesce(
      (select array_agg(t.slug order by t.slug)
       from public.component_tags ct
       join public.tags t on t.id = ct.tag_id
       where ct.component_id = m.id),
      '{}'::text[]
    ) as tags,
    coalesce(
      (select array_agg(distinct lower(s.language))
       from public.code_snippets s
       where s.component_id = m.id),
      '{}'::text[]
    ) as languages,
    coalesce(
      (select count(*)::int from public.component_styles cs
       where cs.component_id = m.id),
      0
    ) as style_count,
    m.rank,
    count(*) over () as total
  from matched m
  order by m.rank desc, m.name asc
  limit greatest(coalesce(lim, 60), 0)
  offset greatest(coalesce(off, 0), 0);
$function$;

-- The catalog is public, so searching it is public too. RLS inside still applies.
grant execute on function public.search_components(
  text, text[], text[], text[], text[], text[], int, int
) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Facet helper: tag counts across the components the caller can see.
-- ---------------------------------------------------------------------------
create or replace function public.component_tag_counts()
returns table (slug text, name text, count bigint)
language sql
stable
as $function$
  select t.slug, t.name, count(*)::bigint
  from public.tags t
  join public.component_tags ct on ct.tag_id = t.id
  join public.components c on c.id = ct.component_id
  group by t.slug, t.name
  order by count(*) desc, t.slug asc;
$function$;

grant execute on function public.component_tag_counts() to anon, authenticated;

# CLAUDE.md — Digital Asset Library (build context)

You are building the **Digital Asset Library (DAL)** for Urban Jungle Goddess: a full-stack,
searchable catalog of reusable, accessibility-audited UI components and code assets across
11 visual styles and 12 language/framework targets, plus templates and web-search integration.
It is both Omegea's personal engineering asset system and a portfolio-grade, sellable product.

The full project docs live in ClickUp doc `838qa-87871` ("Base of Operations"). The 51 deep
component reference docs live in ClickUp doc `838qa-81211`. This file is the short version so
you can build without re-deriving decisions. **These decisions are LOCKED — do not relitigate
the stack.**

## Stack (locked)
- **Next.js (App Router, latest) + React + TypeScript.** (React was the intent; Next.js is the
  chosen React meta-framework — Vercel-native, SSR/SSG + route handlers, Supabase-friendly.)
- **Tailwind CSS** layered over the existing UJG design-token CSS (11 visual styles + brand
  palette + 4-font system already in the component library package).
- **Supabase** — Postgres, Auth (email + OAuth), Storage, Row-Level Security, optional Edge
  Functions. Search via Postgres `tsvector` + `pg_trgm`.
- **API = Next.js Route Handlers** (`app/api/*`) using a server Supabase client. RLS is the real
  authorization boundary. Service-role key is server-only, never shipped to the client.
- **Host: Vercel** (auto-deploys `main`). Supabase cloud for data.
- RETIRED — do NOT introduce: Express, MongoDB, AWS, Electron, Redux. (Client state: RSC first,
  Zustand only if genuinely needed.)

## Repo layout (target)
```
app/                      # App Router
  layout.tsx  page.tsx
  catalog/  catalog/[slug]/  search/  account/
  api/{components,search,collections,websearch}/route.ts
components/                # app UI (consumes the design-token layer)
lib/supabase/{server.ts,client.ts,types.ts}
content/docs/*.mdx         # component docs ported from ClickUp 838qa-81211
public/playgrounds/*.html  # 42 prebuilt interactive playgrounds — embed in detail pages
styles/tokens/             # UJG design tokens (11 styles, palette, fonts)
supabase/migrations/       # schema v1+
mdx-components.tsx  next.config.mjs
```

## Supabase schema v1 (public schema; RLS on all tables)
- `categories`(id, slug, name, description, sort)
- `components`(id, slug, name, category_id→categories, status[idea|drafting|built|audited|reusable],
  summary, doc_md, clickup_page_id, created_at, updated_at)
- `visual_styles`(id, key, name) — 11 skins: Flat, Material, Glassmorphism, Liquid Glass,
  Neumorphism, Skeuomorphism, Neo-Brutalism, Claymorphism, Aurora, Swiss, UJG
- `code_snippets`(id, component_id→components, language, framework, code, is_primary) — 12 targets
- `tags`(id, slug, name) + `component_tags`(component_id, tag_id)
- `assets`(id, type[component|snippet|template|token|image], title, storage_path, meta jsonb, created_at)
- `templates`(id, name, description, owner_id→auth.users, config jsonb)
- `references`(id, title, url, source[mdn|so|github|apg|other], component_id nullable)
- `profiles`(id→auth.users, display_name, role); `collections`(id, owner_id, name) +
  `collection_items`(collection_id, component_id)
- `components.search_vector tsvector` (GIN) + `pg_trgm` trigram index.
- RLS: public read on published catalog rows; writes owner/admin (role via profiles.role);
  user-scoped rows (collections, templates) private to owner via `auth.uid()`.

> Realized in `supabase/migrations/0001_init.sql`. "Published" for a component is defined as its
> status being on the shippable end of the ladder (`built | audited | reusable`); snippets and
> references inherit their parent component's visibility. `visual_styles.key` matches the
> `[data-style="…"]` attribute in `styles/tokens.css` so a DB style maps straight onto a skin.

## Roadmap (build in this order; respect phase gates)
- **Phase 0 — Foundation:** scaffold Next.js+TS+Tailwind; set Vercel framework to Next.js; add
  Supabase env vars; write schema v1 migration. Gate: `main` deploys a Next.js app on Vercel AND a
  server route reads Supabase.
- **Phase 1 — Catalog MVP:** render all 51 docs from `content/docs` MDX; detail page = docs +
  embedded playground + copyable code tabs + 11-style switcher; browse by category/tag; responsive.
  Gate: all 51 live at the Vercel URL. (No auth yet.)
- **Phase 2 — Data & search:** move component/asset metadata into Supabase; route handlers read it;
  full-text + tag/language filters; <1s search. Gate: search & filter live.
- **Phase 3 — Accounts:** Supabase Auth; profiles; save snippets/collections. Gate: user can sign in & save.
- **Phase 4 — Assets/templates/web-search:** Storage uploads; template builder → ZIP; web-search proxy.
- **Phase 5 — Harden & launch:** a11y audit, perf (<1s/10k assets, 100+ concurrent), SEO, custom domain.

## Content sourcing (Phase 1) — LOCKED
When porting the component docs from ClickUp `838qa-81211`:
- **Template:** use the **Component Asset Template v2** — ClickUp page `838qa-218971`
  ("⭐ COMPONENT ASSET TEMPLATE v2 (the real one)"). Do **not** use the older v1 template.
- **Versions:** when a component appears more than once in the content doc, use the
  **deep-spec / Full Build** version (pages suffixed "(Deep Spec)" / "(Full Build)"), not the
  earlier short/stub version. The deep spec is the source of truth for that component.
- Every `components` row carries `clickup_page_id` back to the specific `838qa-81211` page used.

## Conventions
- TypeScript strict. Server components by default; `"use client"` only when needed.
- Two Supabase clients: server (`lib/supabase/server.ts`, service/SSR) and browser
  (`lib/supabase/client.ts`, anon). Never import the service-role key into a client component.
- Every `components` row carries `clickup_page_id` for traceability back to doc 838qa-81211.
- Component "done" = the Component Asset Template bar (17 sections) + status ladder
  Idea→Drafting→Built→Audited→Reusable.
- Trunk-based: short feature branches, PR to `main`, Vercel preview per PR.

## Infra is managed directly (no Cowork/MCP connector for this project)
The Cowork Vercel/Supabase connectors are reserved for the Melanaxis build (only one project connects
at a time), so this project is managed the normal dev way:
- **Vercel:** dashboard + auto-deploy from `main`. Set `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` in Vercel → Project (digital-library)
  → Settings → Environment Variables (Production + Preview + Development), and mirror them in `.env.local`.
- **Framework flip:** the Vercel project currently detects `framework: null` (static). After the Next.js
  scaffold lands on `main`, confirm Project Settings → Build & Development shows Framework Preset = Next.js.
- **Supabase migrations:** run with the Supabase CLI linked to THIS project —
  `supabase link --project-ref cmluzusujsbxscljszbn` then `supabase db push`.
  **Do NOT point the CLI at the Melanaxis project.**
- IDs: Vercel project `prj_viUSYKkHJ4qBOs4Vy8dGwlwVOXWQ`, team `team_PDU5UVwmWjZQKNOccYHEeAsX`.

## ⚠️ Open item to verify before Phase 0 exit
Supabase project `https://cmluzusujsbxscljszbn.supabase.co` was provisioned but is on a different
account than the one connected in Cowork. **Confirm which Supabase login/org owns it, then put the
three keys above into `.env.local` and the Vercel dashboard.** (Branch hygiene: already fixed — repo is on `main`.)

> Status (Phase 0): confirmed — the Supabase account connected via MCP in the build environment only
> exposes the **Melanaxis** org/project (`ujrltjzlebxkdbwptsap`); the DAL project
> `cmluzusujsbxscljszbn` is **not** reachable from it. So the migration and env keys must be applied
> by the account that owns `cmluzusujsbxscljszbn` (Supabase CLI `db push` + keys into Vercel/.env.local).
> The migration file is ready and idempotent; `/api/health` will return the live count once the keys land.

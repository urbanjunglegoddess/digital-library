# Digital Asset Library

Urban Jungle Goddess component library — a full-stack, searchable catalog of
reusable, accessibility-audited UI components and code assets across **30 visual
styles** (the locked base 11 plus 19 extended skins) and **12 language/framework
targets**, plus templates, file storage and web-search integration.

This repo is both the published UJG **component-library package** (design-token
layer + components in `styles/` and `components/`) and the **Next.js app** that
consumes it.

See [`CLAUDE.md`](./CLAUDE.md) for the locked build context, schema and roadmap.

## Stack

- **Next.js** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4**, layered on top of the existing UJG design-token CSS
  (`styles/tokens.css`) — the tokens are not replaced
- **Supabase** — Postgres, Auth, Storage, Row-Level Security; search via
  `tsvector` + `pg_trgm`
- **Host:** Vercel (auto-deploys `main`)

## Quick start

Requires Node 20+ (Node 22 or 24 recommended).

```bash
npm install
cp .env.example .env.local     # then fill in the real Supabase values
npm run db:push                # apply migrations
npm run db:seed                # load content/docs into Postgres
npm run dev                    # http://localhost:3000
```

## Scripts

| Command               | What it does                                        |
| --------------------- | --------------------------------------------------- |
| `npm run dev`         | Start the dev server                                 |
| `npm run build`       | Production build                                     |
| `npm run start`       | Serve the production build                           |
| `npm run lint`        | ESLint (`next/core-web-vitals`)                      |
| `npm run typecheck`   | `tsc --noEmit` (strict)                              |
| `npm run db:status`   | Which migrations are applied                         |
| `npm run db:push`     | Apply pending migrations                             |
| `npm run db:seed`     | Port `content/docs` into Supabase (idempotent)       |
| `npm run db:seed:dry` | Report what seeding would change, write nothing      |
| `npm run verify:rls`  | Prove the row-level-security boundary still holds    |
| `npm run verify:app`  | Authenticated end-to-end smoke test (server must be running) |

## How the data flows

```
content/docs/*.mdx  ──(npm run db:seed)──>  Postgres  ──>  /search, /api/*
        │                                                        
        └──(build time)──>  118 prerendered pages
```

`content/docs/*.mdx` is the **authoring source of truth** — YAML frontmatter plus
the deep-spec Markdown body ported from ClickUp `838qa-81211`. It is what the
component detail pages render, statically, at build time.

Postgres is the **derived index**: seeding mirrors every doc into `components`,
`code_snippets`, `tags`, `references` and `component_styles` so the catalog can be
searched, filtered and joined to user data. Editing a doc means re-running
`npm run db:seed`.

That split is deliberate. Docs stay reviewable in git and render without a
database; search, collections and templates need a database and get one.

## Architecture notes

**Row-level security is the authorization boundary.** Route handlers and server
components do not re-check ownership in JavaScript — they query as the caller,
and the policies in `supabase/migrations/0001_init.sql` decide what comes back.
`npm run verify:rls` exercises that boundary from the outside (both the positive
paths and the negative ones: cross-user reads, forged inserts, privilege
escalation) and fails loudly if a policy stops working.

**Static first.** The 98 component pages and 11 reference pages are prerendered.
Per-viewer fragments — the account block in the rail, "save to collection", the
preferred skin — hydrate against small JSON endpoints instead of forcing those
pages to render per request. Reading the session in `app/layout.tsx` would undo
this for the entire app; don't.

**Graceful degradation.** Every Supabase read returns `null` rather than throwing
when the database is unreachable, and callers fall back to the file-backed
content layer. A preview deploy with no env vars renders the catalog rather than
a 500.

## Environment

Set these in `.env.local` (git-ignored) and mirror them in the Vercel dashboard
(Production + Preview + Development). See `.env.example` for the annotated
template.

| Variable                        | Required | Notes                                              |
| ------------------------------- | -------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | yes      | Project URL                                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes      | Anon **or** publishable key; RLS-scoped             |
| `SUPABASE_SERVICE_ROLE_KEY`     | yes      | Service-role **or** secret key; bypasses RLS        |
| `SUPABASE_DB_URL`               | scripts  | Session pooler (port 5432) — used by the CLI scripts |
| `NEXT_PUBLIC_SITE_URL`          | prod     | Canonical origin; also enables search indexing       |
| `NEXT_PUBLIC_AUTH_OAUTH_PROVIDERS` | no    | e.g. `github,google` — must also be on in Supabase   |
| `WEBSEARCH_PROVIDER` / `WEBSEARCH_API_KEY` | no | `brave` or `tavily`; falls back to scoped links |

Supabase renamed its API keys (anon → publishable, service_role → secret). The
app accepts either spelling; `lib/env.ts` is the single place that resolves them.

The service-role key is used only by `lib/supabase/server.ts`
(`createAdminClient`) and the CLI scripts. Never import it into a client
component.

## Database migrations

| File                          | What it adds                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| `0001_init.sql`               | Schema v1: all tables, enums, RLS policies, the 11 seed visual styles.                    |
| `0002_search.sql`             | `component_styles`, the 19 extended skins, `components.meta`, `search_components()`.      |
| `0003_assets_templates.sql`   | Asset ownership, the private `assets` Storage bucket, template timestamps, `preferences`. |

`npm run db:push` applies anything not yet applied, one transaction per file,
recording each in `public.schema_migrations`. It talks to Postgres directly over
the **session-mode pooler** (port 5432), so it needs neither Docker nor the
Supabase CLI — useful because the direct host `db.<ref>.supabase.co` is IPv6-only
and does not resolve on most networks, and transaction mode (6543) cannot run DDL.

The Supabase CLI still works if you prefer it:

```bash
supabase link --project-ref cmluzusujsbxscljszbn
supabase db push
```

> Do **not** point the CLI at any other Supabase project.

## API

| Route                     | Method            | Purpose                                            |
| ------------------------- | ----------------- | -------------------------------------------------- |
| `/api/health`             | GET               | Connection + seed state                             |
| `/api/search`             | GET               | Ranked full-text search with filters                |
| `/api/components`         | GET               | Catalog index with the same filters, ordered by name |
| `/api/collections`        | GET/POST          | A user's saved sets; toggle membership               |
| `/api/templates`          | GET/POST/DELETE   | Saved compositions                                   |
| `/api/templates/export`   | POST              | Composition → project ZIP                            |
| `/api/assets`             | GET/POST/DELETE   | Storage uploads, served via signed URLs              |
| `/api/preferences`        | GET/PUT           | Per-account UI defaults                              |
| `/api/websearch`          | GET               | Web-search proxy                                     |
| `/api/account/export`     | GET               | Everything the account holds, as JSON                |
| `/api/auth/me`            | GET               | Viewer identity for the app shell                    |

### Health check

```json
{
  "status": "ok",
  "supabase": "connected",
  "seeded": true,
  "components": 98,
  "code_snippets": 601,
  "visual_styles": 30,
  "visual_styles_core": 11
}
```

## Project layout

```
app/
  layout.tsx  page.tsx  globals.css   # brand shell (palette + 4-font system + skins)
  (auth)/{login,signup}/              # sign-in surfaces + server actions
  auth/{callback,oauth,signout}/      # OAuth + email-link exchange
  account/  settings/                 # profile, collections, files, defaults
  knowledge/  knowledge/[slug]/       # the component catalog (prerendered)
  reference/  reference/[slug]/       # system-level reference docs
  search/                             # Postgres-backed search + filters
  build/  templates/  workspace/      # composer, template hub, playground
  portal/  dashboard/                 # ops surfaces
  api/…                               # route handlers (see table above)
  sitemap.ts  robots.ts  not-found.tsx
components/                           # app UI + the component-library package
lib/
  env.ts  site.ts  auth.ts  collections.ts  zip.ts
  content.ts  reference.ts  styles.ts  targets.ts  snippets.ts  composer.ts
  supabase/{server,client,middleware,queries,types}.ts
content/docs/*.mdx                    # 98 component specs — authoring source of truth
content/reference/*.mdx               # system reference docs
styles/                               # tokens.css + per-surface stylesheets
supabase/migrations/                  # schema
scripts/                              # db-push, seed, verify-rls
middleware.ts                         # session refresh + route protection
```

## Roadmap status

All five phases are implemented. See **Build status** in [`CLAUDE.md`](./CLAUDE.md)
for the detail, the three gotchas worth knowing, and what still has to be done by
hand in the Vercel dashboard.

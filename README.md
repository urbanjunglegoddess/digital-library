# Digital Asset Library

Urban Jungle Goddess component library — a full-stack, searchable catalog of
reusable, accessibility-audited UI components and code assets across **11 visual
styles** and **12 language/framework targets**, plus templates and web-search
integration.

This repo is both the published UJG **component-library package** (design-token
layer + components in `styles/` and `components/`) and the **Next.js app** that
consumes it.

## Stack

- **Next.js** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4**, layered on top of the existing UJG design-token CSS
  (`styles/tokens.css`) — the tokens are not replaced
- **Supabase** — Postgres, Auth, Storage, Row-Level Security; search via
  `tsvector` + `pg_trgm`
- **Host:** Vercel (auto-deploys `main`)

See [`CLAUDE.md`](./CLAUDE.md) for the locked build context, schema, and roadmap.

## Local development

Requires Node 20+ (Node 22 recommended).

```bash
# 1. Install
npm install

# 2. Configure env — copy the example and fill in real Supabase keys
cp .env.example .env.local
#   then edit .env.local (see "Environment" below)

# 3. Run the dev server
npm run dev          # http://localhost:3000
```

### Scripts

| Command             | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start the dev server                           |
| `npm run build`     | Production build                               |
| `npm run start`     | Serve the production build                     |
| `npm run lint`      | ESLint (`next/core-web-vitals`)                |
| `npm run typecheck` | `tsc --noEmit` (strict)                        |

### Environment

Set these in `.env.local` (git-ignored) and mirror them in the Vercel dashboard
(Production + Preview + Development). See `.env.example` for the template.

| Variable                        | Scope        | Notes                                    |
| ------------------------------- | ------------ | ---------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | public       | `https://cmluzusujsbxscljszbn.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public       | anon key, RLS-scoped                     |
| `SUPABASE_SERVICE_ROLE_KEY`     | server-only  | bypasses RLS — never ship to the client  |

The service-role key is used only by `lib/supabase/server.ts`
(`createAdminClient`). Never import it into a client component.

### Database migrations

Schema v1 lives in `utils/supabase/migrations/0001_init.sql` (all tables, the 11
`visual_styles` seed rows, full-text + trigram search indexes, and RLS policies).
Apply it with the Supabase CLI linked to **this** project:

```bash
supabase link --project-ref cmluzusujsbxscljszbn
supabase db push
```

> Do **not** point the CLI at any other Supabase project.

### Health check (Phase 0 gate)

`GET /api/health` counts the seeded `visual_styles` rows through the server
Supabase client, proving the server client + keys + RLS read path all work:

```json
{ "status": "ok", "supabase": "connected", "visual_styles": 11, "expected": 11 }
```

## Project layout

```
app/                       # App Router
  layout.tsx  page.tsx     # brand shell (palette + 4-font system + 11 skins)
  globals.css              # Tailwind + UJG tokens
  api/health/route.ts      # proof-of-life Supabase read
components/                # component-library package (Button seed component)
lib/supabase/              # server.ts (SSR + admin), client.ts, types.ts
styles/tokens.css          # UJG design tokens (11 styles, palette)
supabase/migrations/       # schema v1+
playground/                # prebuilt interactive playground(s)
```

## Roadmap

Phase 0 (this) — foundation. Phases 1–5 build the catalog, data/search,
accounts, assets/templates/web-search, then harden & launch. See `CLAUDE.md`.

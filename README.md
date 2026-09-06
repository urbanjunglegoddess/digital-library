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

| Command             | What it does                    |
| ------------------- | ------------------------------- |
| `npm run dev`       | Start the dev server            |
| `npm run build`     | Production build                |
| `npm run start`     | Serve the production build      |
| `npm run lint`      | ESLint (`next/core-web-vitals`) |
| `npm run typecheck` | `tsc --noEmit` (strict)         |

### Environment

Set these in `.env.local` (git-ignored) and mirror them in the Vercel dashboard
(Production + Preview + Development). See `.env.example` for the template.

| Variable                        | Scope       | Notes                                      |
| ------------------------------- | ----------- | ------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | public      | `https://cmluzusujsbxscljszbn.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public      | anon key, RLS-scoped                       |
| `SUPABASE_SERVICE_ROLE_KEY`     | server-only | bypasses RLS — never ship to the client    |

The service-role key is used only by `lib/supabase/server.ts`
(`createAdminClient`). Never import it into a client component.

### Database migrations

Schema v1 lives in `supabase/migrations/0001_init.sql` (all tables, the 11
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

# Drop-in files for urbanjunglegoddess/digital-library @ main

Paths here mirror the repo. Copy over the same paths and commit.

| File                         | Change                                                                                                                                                                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/page.tsx`               | **Replaces** the current landing with 1b — the spec-sheet home. Light ground, numbered sections 01–04, counts read live from `lib/content.ts`. Primary CTA "Start an Adventure" → `/catalog`; footer link → `/portal`. |
| `styles/home.css`            | New. Scoped under `.lp`.                                                                                                                                                                                               |
| `app/portal/page.tsx`        | **New route** `/portal` — 1c. Night ground, 248px rail, KPI row, runs table, library readiness.                                                                                                                        |
| `styles/portal.css`          | New. Scoped under `.pt`.                                                                                                                                                                                               |
| `components/site/Header.tsx` | Adds a `Portal` nav link. Otherwise unchanged.                                                                                                                                                                         |

Notes

- Both pages are server components; no client JS added.
- Library figures (`written`, `categories`, `ALL_STYLES`) come from `lib/content.ts`. Only `PLANNED_TOTAL = 51`, `TARGET_COUNT = 12`, `FILLED_TARGETS = 8`, and the `RUNS` array are hardcoded — the runs array is the Phase 2 Supabase `runs` table stand-in and is marked as such in the file.
- Type faces use the four families already loaded in `app/layout.tsx` (Playfair Display for display, Inter for body, JetBrains Mono for data/labels). The real UJG faces — Methanerse, Mallong, Omega Sans, Data Control — are not in the repo; swap the `--lp-*`/`--pt-*` font vars once they ship.
- CSS imports assume the `@/` path alias already used across the app.

# Drop-in: `/build` route + responsive app shell

Generated against `urbanjunglegoddess/digital-library@main` (read 2026-09-06).
Paths below are relative to the repo root — copy each file to the same path.

## New files

| From                                      | To                                   |
| ----------------------------------------- | ------------------------------------ |
| `repo/app/build/page.tsx`                 | `app/build/page.tsx`                 |
| `repo/components/build/BuildComposer.tsx` | `components/build/BuildComposer.tsx` |
| `repo/components/build/CanvasItem.tsx`    | `components/build/CanvasItem.tsx`    |
| `repo/components/build/generate.ts`       | `components/build/generate.ts`       |
| `repo/components/build/types.ts`          | `components/build/types.ts`          |
| `repo/components/build/build.css`         | `components/build/build.css`         |
| `repo/lib/targets.ts`                     | `lib/targets.ts`                     |
| `repo/lib/composer.ts`                    | `lib/composer.ts`                    |
| `repo/styles/shell.css`                   | `styles/shell.css`                   |

## Replaced file

| From                                | To                             |
| ----------------------------------- | ------------------------------ |
| `repo/components/site/AppShell.tsx` | `components/site/AppShell.tsx` |

## One manual edit to `app/globals.css`

`styles/shell.css` now owns the shell. Delete the old block from `globals.css`
so the two don't fight — everything from:

```
/* ==========...
   App shell — persistent left sidebar (the 8 surfaces) + content area
   ========== */
.app { ... }
```

down to and including:

```
@media (max-width: 860px) {
  .app { flex-direction: column; align-items: stretch; }
  ...
}
```

That `860px` rule is the thing being replaced: it flattened the rail into a
two-column grid of eight nav items stacked _above_ the content. Nothing else in
`globals.css` is touched — `.page`, `.card*`, `.dash-*`, `.surface-*`, and the
`doc-prose` block all still apply.

`shell.css` is imported by `AppShell.tsx` directly, so no `@import` is needed.

## What ships

**`/build`** — the route the rail has always linked to. Server component reads
`lib/content.ts` (same source as the Knowledge Hub) and hands the client
composer a tray of all 14 documented components.

- **Tray → canvas → inspector**, three panels at desktop.
- **Skin** switches all 11 styles by setting `data-style` on the canvas, so it
  is genuinely exercising `styles/tokens.css`, not a mock.
- **Target** lists all 12 language targets. HTML, React, and React + TypeScript
  generate real code today; the other nine return an honest Phase 4 note rather
  than unverified output. Marked `· Phase 4` in the dropdown.
- **Copy code** works now. **Export ZIP** is disabled with a title explaining
  why — same Phase 4 dependency the Template Hub waits on.
- Seven components have composer renderers (`lib/composer.ts`): field,
  checkbox, button, alert, badge, divider, blockquote. Any other doc still
  appears in the tray, drops onto the canvas, and renders as a labelled block
  flagged `doc` — so the tray grows with `content/docs/` for free.
- `Button` on the canvas is the **real** `components/button/Button.tsx`.

**Responsive shell** — three sizes, replacing the single 860px breakpoint:

| Width      | Nav                                                        | Composer                                        |
| ---------- | ---------------------------------------------------------- | ----------------------------------------------- |
| ≥1024px    | 256px rail, label + hint                                   | tray · canvas · inspector                       |
| 768–1023px | 64px icon rail                                             | canvas · inspector; tray behind "Add component" |
| ≤767px     | fixed bottom tabs (Home · Portal · Library · Build · More) | canvas only; both panels are sheets             |

The five tab surfaces are the daily ones; Dashboard, Template Hub, Workspace,
and Settings live in the More sheet. Escape and route changes close it.
`env(safe-area-inset-bottom)` is respected, every target is ≥44px, and every
interactive element keeps the house 3px `--dl-focus` ring.

## Not included

- No new colours, fonts, radii, or shadows — every value resolves to a
  `--dl-*` token or an existing `oklch()` from `globals.css`.
- No changes to `app/layout.tsx`. It already renders `<AppShell>`.
- `components/site/Header.tsx` is left alone; it is unused by the shell.
- No export pipeline, no persistence. Builds live in component state.

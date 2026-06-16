# Construction OS

Construction transparency platform: a Next.js dashboard that puts clients, contractors, and project managers on one shared view of a portfolio of NZ construction projects (overview, site map, RFIs/queries, supplier price comparison, analytics).

> **Naming note:** The repo directory is `Construction Material Scraper`, but the product is **Construction OS** and there is **no scraping** anywhere in the code. All supplier/material/price data is hardcoded synthetic demo data. See `docs/PROJECT.md` (Known Gaps) for detail.

## Tech Stack

- **Framework:** Next.js 14.2.5 (App Router), React 18.3.1, TypeScript 5.4 (strict)
- **Styling:** Tailwind CSS 3.4.6 (`darkMode: 'class'`), PostCSS + autoprefixer; dark "Blueprint" / Palantir-Foundry-style theme via CSS-variable tokens
- **Maps:** Leaflet 1.9.4 + react-leaflet 4.2.1
- **Charts:** Recharts 2.12.7
- **Icons:** lucide-react 0.400
- **Auth:** Supabase (`@supabase/supabase-js` 2.45, `@supabase/ssr` 0.4) — email magic-link OTP; used for auth/session only (no DB queries)
- **Runtime:** Node 20+

## Commands

```bash
npm run dev        # next dev on port 3000
npm run build      # production build
npm run start      # serve the production build
npm run lint       # next lint
npm run typecheck  # tsc --noEmit
```

There is no test runner configured.

## Architecture

The app is a single-user (`currentUserId = "u-logan"`, Logan Street, Project Manager) demo. All pages share a `Shell` (left rail on desktop / bottom tabs on mobile) and live RFI state from `CollabProvider` (`src/lib/collab-store.tsx`), which optimistically updates and syncs through internal `/api/rfis` routes.

There are **two parallel, non-shared data systems**:
1. **Domain data** (Projects, RFIs/Variations/Queries, site boundaries) — served by Next.js API route handlers backed by `src/server/store.ts`, a cached JSON-file store at `.data/db.json`, seeded from constants in `src/lib/site-data.ts`.
2. **Procurement/cost-engine mocks** (Suppliers, Products, Shipments, exec KPIs) — client-side only in `src/lib/mock-data.ts`, never persisted, no API route. Powers `/search`, the delivery map overlay, and the link graph.

`NEXT_PUBLIC_DEMO_MODE` defaults to `true`: middleware skips the auth gate entirely and the app runs on bundled mocks. When `false`, `src/middleware.ts` refreshes the Supabase session on every request and redirects unauthenticated users to `/login`. The API routes never check auth or query Supabase regardless of mode — auth is enforced only at the middleware/page level.

## Directory Map

```
src/
├── middleware.ts              # Auth gate + Supabase session refresh; bypassed when DEMO_MODE=true
├── app/
│   ├── layout.tsx             # Root layout: dark theme, fonts, metadata, wraps app in CollabProvider
│   ├── page.tsx               # / — Overview dashboard (portfolio metrics, needs-attention, activity)
│   ├── map/page.tsx           # /map — Leaflet site map, delivery overlay, boundary editor
│   ├── explore/page.tsx       # /explore — link-graph ontology explorer
│   ├── rfis/page.tsx          # /rfis — RFI/Variation/Query collaboration threads
│   ├── analytics/page.tsx     # /analytics — cadence metrics (response/approval time, ball-in-court load)
│   ├── search/page.tsx        # /search (nav "Procurement") — material/supplier landed-cost comparison
│   ├── login/page.tsx         # /login — Supabase magic-link sign-in (outside Shell)
│   ├── auth/callback/route.ts # Exchanges magic-link ?code for a Supabase session
│   └── api/
│       ├── projects/route.ts            # GET projects (boundary overrides merged over seed)
│       ├── projects/[id]/route.ts       # PATCH edited site boundary
│       ├── rfis/route.ts                # GET list / POST create RFI
│       ├── rfis/[id]/route.ts           # PATCH status / ballInCourt
│       ├── rfis/[id]/messages/route.ts  # POST append message (auto open->in_review)
│       └── buildings/route.ts           # GET OSM Overpass proxy for building footprint
├── components/
│   ├── Shell.tsx              # SideRail + bottom tabs + sticky PageHeader/command bar
│   ├── SiteMap.tsx            # react-leaflet map, basemap toggle, boundary editor, delivery routes
│   ├── LinkGraph.tsx          # Hand-rolled SVG entity graph (supplier->project->rfi->person)
│   ├── ProjectInspector.tsx  # Single-project detail panel + edit-boundary action
│   └── ui.tsx                # Design system primitives (Button/Card/Table/Badge/Tabs/...) + cx()
├── lib/
│   ├── site-data.ts          # Canonical domain model + seed data (Project, Person/TEAM, Rfi, Activity)
│   ├── mock-data.ts          # Client-only procurement dataset + optimize() landed-cost engine
│   ├── graph-data.ts         # buildGraph(rfis)/neighbours for the link graph
│   ├── collab-store.tsx      # CollabProvider/useCollab — RFI state + optimistic /api sync
│   ├── format.ts             # Display formatters (nzd, pct, relative time, dates)
│   ├── cn.ts                 # Class-name joiner (duplicates ui.tsx's cx())
│   └── supabase/{client,server}.ts  # Browser + server Supabase clients (anon key)
├── server/
│   └── store.ts              # ONLY persistence: cached JSON file .data/db.json (boundaries + rfis)
└── styles/
    └── globals.css           # Global styles / Tailwind layers
```

## Conventions

- **TypeScript:** strict mode, ES2021/esnext, bundler resolution, `jsx: preserve`, `noEmit`. Path alias `@/*` -> `src/*`.
- **Styling:** Tailwind only, dark theme via CSS-variable tokens (`surface-base/raised/overlay`, `line`, `fg`/`fg-muted`/`fg-faint`, `primary`, intent colors). Use the `ui.tsx` primitives and `cx()`; prefer them over ad-hoc markup. Note `src/lib/cn.ts` is a redundant duplicate of `cx()`.
- **`reactStrictMode` is `false`** in `next.config.mjs` — React 18 strict-mode double-mount breaks react-leaflet maps in dev. Do not re-enable without fixing the map components.
- **Data layer:** `src/server/store.ts` is the only persistence seam (explicitly designed to swap in Postgres/Supabase later). API mutations are read-modify-write on a module-level in-memory cache, not transactional. `POST` routes for RFIs/messages accept the entire entity (including its `id`) from the request body with no server-side id generation, no auth check, and no author validation — fine for a demo, must be hardened before real use.
- **Maps** must be loaded with `next/dynamic` (`ssr: false`).
- All API route handlers set `export const dynamic = 'force-dynamic'`.

## Project Goals & Status

A working, demo-first prototype: all six routes are functional on bundled synthetic data. Persistence is a local JSON file; Supabase is wired for auth but dormant in demo mode. Not production-hardened (no auth on API routes, mock pricing labelled "not live quotes", single hardcoded user). See `docs/PROJECT.md` for features, gaps, and (inferred) roadmap.

## Project Docs

- [`docs/PROJECT.md`](docs/PROJECT.md) — purpose, current features, known gaps, goals & roadmap.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — tech stack, data model, API surface, auth flow, key files.

**Keep these docs updated when the project's purpose, architecture, commands, or goals change.**

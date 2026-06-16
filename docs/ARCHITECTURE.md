_Last updated: 2026-06-16_

# Construction OS — Architecture

> Repo directory is `Construction Material Scraper`; the product is **Construction OS**. There is no scraping in the codebase — all supplier/material/price data is hardcoded synthetic demo data.

## Tech Stack

| Area | Technology | Version |
|------|-----------|---------|
| Framework | Next.js (App Router) | 14.2.5 (exact) |
| UI runtime | React / React DOM | 18.3.1 |
| Language | TypeScript (strict) | 5.4 |
| Styling | Tailwind CSS (`darkMode: class`) | 3.4.6 |
| CSS tooling | PostCSS / autoprefixer | 8.4.39 / 10.4.19 |
| Maps | Leaflet / react-leaflet | 1.9.4 / 4.2.1 |
| Charts | Recharts | 2.12.7 |
| Icons | lucide-react | 0.400 |
| Auth/session | @supabase/supabase-js / @supabase/ssr | 2.45 / 0.4 |
| Runtime | Node | >= 20 |

Config notes: `next.config.mjs` sets `reactStrictMode: false` (React 18 strict double-mount breaks react-leaflet maps in dev) and defaults `NEXT_PUBLIC_DEMO_MODE` to `true`. `tsconfig.json`: strict, ES2021/esnext, bundler resolution, `jsx: preserve`, `noEmit`, Next plugin, path alias `@/*` → `src/*`. Tailwind scans `src` `.ts/.tsx`, defines a Blueprint charcoal/blue palette + intent colors, custom fontSize, a 14rem rail, 3px radii, and `pulseDot`/`fadeIn` animations.

## Directory Structure

```
src/
├── middleware.ts              # Auth gate + Supabase session refresh; early-returns when DEMO_MODE=true
├── app/
│   ├── layout.tsx             # Root layout (dark theme, fonts, metadata, CollabProvider)
│   ├── page.tsx               # / Overview dashboard
│   ├── map/page.tsx           # /map site map
│   ├── explore/page.tsx       # /explore link graph
│   ├── rfis/page.tsx          # /rfis RFI collaboration
│   ├── analytics/page.tsx     # /analytics cadence metrics
│   ├── search/page.tsx        # /search procurement comparison
│   ├── login/page.tsx         # /login magic-link sign-in
│   ├── auth/callback/route.ts # Supabase code→session exchange
│   └── api/...                # Route handlers (see API Surface)
├── components/                # Shell, SiteMap, LinkGraph, ProjectInspector, ui.tsx
├── lib/                       # site-data, mock-data, graph-data, collab-store, format, cn, supabase/
├── server/store.ts           # JSON-file persistence (the only backend store)
└── styles/globals.css        # Global styles / Tailwind layers
```

## Data Model & Persistence

Two parallel data systems that do **not** share storage.

**1. Domain data** — `src/lib/site-data.ts` (seed) + `src/server/store.ts` (persistence):

- **Project** `{ id, name, region, lat, long, status, progress, value, units, client, contractor, eta, boundary: [number,number][] }`; `ProjectStatus = design | consented | in_progress | at_risk | complete`. 6 seeded projects; `boundary` polygons generated deterministically by `genBoundary(lat, long, seed)` at module load.
- **Person / TEAM** `{ id, name, role, company }`; `Role = Client | Project manager | Head contractor | Subcontractor | Architect | Council`. 6 hardcoded members; current user is `u-logan` (Logan Street, Project Manager).
- **Rfi** `{ id, ref, projectId, type, subject, status, priority, ballInCourt, createdById, createdAt, due?, messages: Message[] }`; `RfiType = RFI | Variation | Query`, `RfiStatus = open | in_review | answered | closed`, `Priority = low | normal | high | urgent`. **Message** `{ id, authorId, at, body }` is embedded inside each RFI (not a separate table). 6 seeded RFIs.
- **Activity** `{ id, at, kind, actorId, text, projectId? }` — display-only feed; not persisted, not exposed via any API.
- **Relationships:** Project 1—* Rfi (via `projectId`); Rfi 1—* Message (embedded); Rfi *—1 Person twice (`createdById`, `ballInCourt`); Message *—1 Person (`authorId`). `PROJECT_SUPPLIERS` maps `projectId` → short supplier codes (used only by the link graph).

**Persistence (`src/server/store.ts`):** the only persistence layer. DB shape `{ boundaries: Record<projectId, [number,number][]>, rfis: Rfi[] }`, written to `<cwd>/.data/db.json`. On first `load()` with no file it seeds from `PROJECTS` boundaries + `INITIAL_RFIS` and writes the file. A module-level `cache` is populated once and never invalidated; every mutation rewrites the whole JSON file via `persist()` (pretty-printed). Helpers: `getBoundaries`, `setBoundary`, `listRfis`, `createRfi` (prepends, de-dupes by id), `addMessage` (pushes message, auto `open`→`in_review`), `patchRfi` (status / ballInCourt). Reads/writes are non-transactional read-modify-write on the shared cache. The comment explicitly marks this interface as the seam to swap in Postgres/Supabase later.

**2. Procurement / cost-engine mocks** — `src/lib/mock-data.ts` (client-side only, never persisted, no API route):

- **Supplier** `{ code, name, reliability, avgLeadDays, baseDiscount, deliveryFlat, distanceKm, freeDeliveryThreshold?, rebatePct? }` (12).
- **Product** `{ key, name, category, unit, prices: Record<supplierCode, number> }` (12).
- **Shipment** `{ id, po, from, to, material, qty, carrier, value, status, eta, progress, risk? }` (7); `ShipStatus = in_transit | scheduled | delivered`.
- Plus `SUPPLIER_BRANCHES`, `PROJECT_SITES` (`Place = {nm, lat, long}`) for the map, an `EXEC` KPI object, and `optimize()` (landed-cost ranking; weights cost 0.7 / reliability 0.2 / lead 0.1). Note: supplier codes here (PLACEMAKERS/CARTERS/…) differ from the short codes in `PROJECT_SUPPLIERS` — two separate namespaces. `src/lib/graph-data.ts` assembles the link graph (nodes: supplier | project | rfi | person; edges supplier→project→rfi→person).

## API Surface

All route handlers set `export const dynamic = 'force-dynamic'`. None validate the Supabase session.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/projects` | List all projects with persisted boundary overrides merged over seed. |
| PATCH | `/api/projects/[id]` | Persist an edited site boundary (≥3 points). 404 unknown project, 400 if boundary not an array / <3 points. |
| GET | `/api/rfis` | List all RFIs. |
| POST | `/api/rfis` | Create an RFI from the full JSON body (client supplies the entire `Rfi`, incl. `id`). 400 if missing `id` or `projectId`. |
| PATCH | `/api/rfis/[id]` | Update `status` and/or `ballInCourt`. 404 if not found. |
| POST | `/api/rfis/[id]/messages` | Append a `Message` (client supplies full message incl. `id`); auto-transitions `open`→`in_review`. 400 empty body, 404 if RFI not found. |
| GET | `/api/buildings?lat=&lng=` | Proxy to the OSM Overpass API; returns the nearest building footprint ring. 400 if lat/lng not finite, 502 on Overpass failure, `{found:false}` when no polygon. Only outbound network call in the backend. |

`/api/buildings` calls `https://overpass-api.de/api/interpreter` with `way(around:80,lat,lng)['building']`, sends an explicit `User-Agent` (Overpass returns 406 without one), uses `next:{revalidate:60}`, and picks the polygon containing the point (ray-casting) else the nearest centroid. Keyless/free external dependency.

## Auth Flow

- **Mechanism:** Supabase Auth, passwordless email magic-link (OTP). `src/app/login/page.tsx` (client) calls `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: origin + '/auth/callback' } })`. No password/OAuth provider buttons.
- **Callback:** `src/app/auth/callback/route.ts` (GET) reads `?code` and optional `?next` (default `/`), calls `supabase.auth.exchangeCodeForSession(code)` via the server client, then redirects to `origin + next` on success or `/login?error=auth` on failure.
- **Gate / session (`src/middleware.ts`):** runs on all paths except static assets (matcher excludes `_next/static`, `_next/image`, favicon, and common image extensions). If `NEXT_PUBLIC_DEMO_MODE === 'true'` it returns early and skips auth entirely (app runs on bundled mocks with no Supabase). Otherwise it builds a `createServerClient` with cookie `getAll`/`setAll` wired to request+response, calls `supabase.auth.getUser()` to refresh the session cookie every request, and redirects unauthenticated users to `/login` (`/login` and `/auth` exempt).
- **Clients:** `src/lib/supabase/client.ts` (`createBrowserClient`, anon key) for Client Components; `src/lib/supabase/server.ts` (`createServerClient`, anon key, cookie-backed via `next/headers`) for Server Components / Route Handlers (`setAll` wrapped in try/catch). Both use the anon key (subject to RLS + user JWT). No service-role key, and **no Supabase table queries anywhere** — Supabase is used purely for auth/session, while domain data lives in the JSON store.
- **Env / flags:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (required for auth, non-null-asserted), `NEXT_PUBLIC_DEMO_MODE` (`'true'` bypasses the auth gate; default).

## Key Files

| File | Role |
|------|------|
| `src/server/store.ts` | Only persistence layer: cached JSON-file store at `.data/db.json` (boundaries + rfis); seam to later swap in Postgres/Supabase. |
| `src/lib/site-data.ts` | Canonical domain model + seed data: Project, Person/TEAM/Role, Rfi/Message, Activity, `PROJECTS`, `INITIAL_RFIS`, `PROJECT_SUPPLIERS`, `projectById`. |
| `src/lib/mock-data.ts` | Client-only procurement dataset (Supplier, Product, Shipment, EXEC, map Places) + `optimize()` landed-cost engine. Never persisted. |
| `src/lib/graph-data.ts` | `buildGraph(rfis)` / `neighbours` for the link graph; node kinds, colors, labels. |
| `src/lib/collab-store.tsx` | `CollabProvider` / `useCollab` — shared RFI state with optimistic `/api/rfis` sync; hardcodes `currentUserId = 'u-logan'`. |
| `src/lib/format.ts` | Pure display formatters (nzd, pct, relative time, dateTime/dateShort). |
| `src/lib/supabase/client.ts` | Browser Supabase client (anon key) for Client Components. |
| `src/lib/supabase/server.ts` | Server Supabase client (anon key, cookie-backed) for Server Components / Route Handlers. |
| `src/middleware.ts` | Auth gate + per-request session refresh; bypassed entirely when `DEMO_MODE=true`. |
| `src/app/layout.tsx` | Root layout: dark theme, fonts, metadata, wraps app in `CollabProvider`. |
| `src/components/Shell.tsx` | App navigation (SideRail + mobile tabs) + sticky `PageHeader`/command bar; live open-RFI badge. |
| `src/components/SiteMap.tsx` | react-leaflet NZ map: basemap toggle, fly-to, polygon boundary editor, curved delivery overlay. |
| `src/components/LinkGraph.tsx` | Hand-rolled SVG entity graph (supplier→project→rfi→person) with select/neighbour highlighting. |
| `src/components/ProjectInspector.tsx` | Single-project detail panel + "Edit site boundary" action. |
| `src/components/ui.tsx` | Design-system primitives (Button/Input/Card/Table/Badge/StatusDot/Progress/Avatar/Tabs/Segmented/EmptyState) + `cx()` and the Tone system. |
| `src/lib/cn.ts` | 3-line class-name joiner; redundant duplicate of `ui.tsx`'s `cx()`. |

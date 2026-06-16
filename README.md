# Construction OS

A construction transparency platform — one live view of every project, build and
conversation. Portfolio overview, interactive site map, RFIs/queries, supplier
search & landed-cost comparison, and analytics.

> **Status:** runs fully on bundled demo data (`NEXT_PUBLIC_DEMO_MODE=true`) — no
> database or external services required. All prices and figures are synthetic
> demo data, not live quotes.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

## Project structure

```
src/
├── app/            Next.js App Router pages (overview, map, rfis, search, explore, analytics, login)
│   └── api/        Route handlers (projects, rfis, buildings) backed by a JSON file store
├── components/     Shell, UI primitives, map + graph components
├── lib/            Mock/demo data, formatting helpers, Supabase client, collab store
├── server/         Server-side JSON persistence (.data/db.json)
└── styles/         Global CSS
```

## Tech stack

Next.js 14 (App Router) · React 18 · TypeScript · TailwindCSS · Leaflet · Recharts ·
Supabase (auth/storage, optional — bypassed in demo mode).

## Notes

- The local backend persists to `.data/db.json` (gitignored), seeded from
  `src/lib/site-data.ts` on first run. Delete that file to reset to seed state.
- Supabase auth is wired but dormant in demo mode; set real Supabase env vars and
  `NEXT_PUBLIC_DEMO_MODE=false` to enable it.

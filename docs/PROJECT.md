_Last updated: 2026-06-16_

# Construction OS

## Purpose

Construction OS is a **construction transparency / collaboration platform**. It puts clients, head contractors, subcontractors, architects, council, and project managers on one shared, real-time-feeling view of a portfolio of New Zealand residential/commercial builds.

The core idea is the **"ball in court"** — every project, query, and action has a clearly visible owner who is responsible for the next move, so nothing stalls invisibly between parties. Around that, the app provides a portfolio overview, an interactive geographic site map with delivery tracking, an RFI/Variation/Query collaboration timeline, an entity link-graph for tracing what connects to (and blocks) what, operational analytics, and a supplier landed-cost comparison tool.

The product presents an "operational console" UI register modeled on Palantir Foundry (dark theme, ontology/command-bar language). It currently runs entirely on bundled synthetic demo data.

## Current Features

- **Overview (`/`):** Portfolio dashboard with a metrics strip (active projects, avg. progress, open queries incl. a "waiting on you" count, in-transit deliveries, portfolio value in NZD), a projects list with status/progress/ETA, a "Needs attention" RFI panel (items where the ball is in the current user's court sort first), and a recent-activity feed.
- **Site map (`/map`):** Full-screen Leaflet map of all project sites; Imagery/Map basemap toggle; a deliveries overlay drawing curved supplier→site shipment routes with status colours and an animated in-transit marker; a project list that opens a `ProjectInspector`; and an editable site-boundary mode (click to add vertices, drag handles, remove/cancel/save) that persists via `PATCH /api/projects/{id}`.
- **Explore (`/explore`):** Hand-rolled SVG link graph laying out four columns — suppliers → projects → queries/RFIs → people — with click-to-select, neighbour highlighting, and a kind-specific detail side panel.
- **Queries & RFIs (`/rfis`):** The core collaboration surface. Status-filter tabs with live counts; a master list of threads and a chat-style detail pane; reply composer (Cmd/Ctrl+Enter to send); a "Waiting on" (ball-in-court) selector bound to the team; Mark answered / Close / Reopen controls; and a "New query" modal to create an RFI/Variation/Query. Sending a message auto-transitions `open` → `in_review`.
- **Analytics (`/analytics`):** Operational cadence metrics — avg. first response time, variation approval cycle time, open-query load, on-time delivery %, avg. build progress — plus a per-member ball-in-court load chart, a query-status breakdown, and an "Oldest unresolved" friction list.
- **Procurement (`/search`):** Material search over a static catalog with a multi-supplier landed-cost comparison table (list price, net after trade discount, delivery/free, rebate, landed total, per-unit, lead days) and "Best" (score-ranked) / "Cheapest" badges. Ranking math from `optimize()` (weights: cost 0.7, reliability 0.2, lead 0.1).
- **Auth (`/login` + `/auth/callback`):** Supabase passwordless email magic-link (OTP) sign-in, rendered outside the app shell.
- **Local backend:** Internal `/api` routes persist RFIs and edited site boundaries to a JSON file (`.data/db.json`) that survives reloads with zero external services. A `/api/buildings` route proxies the OpenStreetMap Overpass API to fetch a real building footprint near a point.

## Known Gaps / TODOs

- **Name vs. functionality divergence (important):** The repo directory is named **`Construction Material Scraper`**, but the product is **Construction OS** and **there is no scraping** anywhere — no crawler, no external-site fetching, no HTML parsing, no data-extraction pipeline. All supplier/material/price data is hardcoded synthetic demo data (`src/lib/mock-data.ts`), explicitly labelled "synthetic NZD ex-GST demo figures — not live quotes." The `/search` page is an in-memory comparison UI over a static catalog, not a price scraper.
- **Mock data vs. real persistence:** Domain data is seeded from TypeScript constants and persisted only to a local cached JSON file (`src/server/store.ts` → `.data/db.json`). Procurement data (suppliers, products, shipments, exec KPIs) is client-side only and never persisted. The store is explicitly the seam to later swap in Postgres/Supabase.
- **Supabase is auth-only:** Supabase is wired for magic-link auth/session but performs no database queries; in `NEXT_PUBLIC_DEMO_MODE=true` (the default) auth is bypassed entirely.
- **API routes are unauthenticated and trusting:** No route validates the Supabase session. `POST /api/rfis` and `POST /api/rfis/[id]/messages` accept the entire entity (including its `id`) from the request body with no server-side id generation and no author validation. Mutations are read-modify-write on a shared in-memory cache and are not transactional.
- **Single hardcoded user:** `currentUserId` is hardcoded to `u-logan` (Logan Street, Project Manager); there is no real per-user identity, and "collaboration" is single-user, file-backed optimistic state — not multi-user live sync (no WebSocket/SSE/CRDT/presence).
- **Seed-data inconsistencies:** The six seeded projects use North-Island place-name ids (hobsonville, cambridge, tauranga, johnsonville, rolleston, queenstown) while names/regions read as Christchurch. Two separate supplier code namespaces exist — short codes (PM/ITM/CAR/BUN…) in `PROJECT_SUPPLIERS` vs. long codes (PLACEMAKERS/CARTERS…) in `mock-data.ts`.
- **Redundant helper:** `src/lib/cn.ts` duplicates `cx()` in `src/components/ui.tsx`.
- **Decorative header controls:** The command bar's ontology search, "AIP" button, and notifications bell appear non-wired.
- **No tests:** No test runner is configured.

## Goals & Roadmap

> The items below are **inferred** from the current code and naming; the real goals are owned by the maintainer. Please edit/confirm.

- **[INFERRED — confirm]** Replace the JSON-file store with a real database (Postgres/Supabase) using `src/server/store.ts` as the seam, and persist procurement data too.
- **[INFERRED — confirm]** Enforce authentication and authorization on the `/api` routes, generate ids server-side, and validate message authorship.
- **[INFERRED — confirm]** Replace the hardcoded single user with real Supabase-backed multi-user identity and per-role access (Client / PM / Head contractor / Subcontractor / Architect / Council).
- **[INFERRED — confirm]** Decide whether the "Material Scraper" name implies a planned live supplier-pricing ingestion feature, or whether the repo should be renamed to "Construction OS" to match the product.
- **[INFERRED — confirm]** Add real-time multi-user collaboration (live presence / sync) for RFIs.
- **[INFERRED — confirm placeholder]** _Add maintainer-owned goals here._

## Maintaining this doc

Update this document whenever the product's purpose, feature set, or roadmap changes — especially when mock data is replaced with real persistence, when auth moves out of demo mode, when new routes/features ship, or when any "Known Gap" above is resolved. Update the `_Last updated_` date at the top on each meaningful edit, and replace `[INFERRED — confirm]` markers with confirmed, maintainer-owned statements.

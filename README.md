# ClinicGo

Helps Greater Toronto Area (GTA) residents find walk-in clinics that are actually open and accepting patients right now, by scraping clinic websites with Firecrawl and tracking status over time.

## Repo layout

- `/` (this folder): backend. Node.js, TypeScript, Express API, Firecrawl scraper, Supabase schema.
- `/frontend`: Next.js and Tailwind web app. Talks directly to Supabase and Firecrawl through its own API routes, so it does not need the backend running.

## Backend setup

1. `npm install`
2. Copy `.env.example` to `.env` if you don't already have one, and fill in:
   - `FIRECRAWL_API_KEY` (already set for this project)
   - `SUPABASE_URL` (already set, the `clinicgo` project, ca-central-1)
   - `SUPABASE_SERVICE_ROLE_KEY`: get this from the Supabase dashboard, Project Settings, API Keys, `service_role` (secret). This key bypasses row-level security, so it must never be committed or shipped to a browser.
3. The database is already seeded with 43 real GTA walk-in and urgent care clinics (see `src/seed/clinics.seed.json`) and has live status checks. Add more clinics to that file and run `npm run seed` to add them.
4. Run `npm run scrape` any time to batch re-scrape all clinics for current walk-in and wait status. This is separate from the frontend's live per-search sweep (see below).
5. Run `npm run dev` to start the API on `http://localhost:3000`.

### API

- `GET /clinics`: all clinics with their latest known status
- `GET /clinics/open`: clinics currently believed to be accepting walk-ins
- `GET /clinics/:id`: one clinic plus its last 20 status checks

### Database

Schema lives in the `clinicgo` Supabase project (region ca-central-1):

- `clinics`: static info, name, address, coordinates (geocoded via OpenStreetMap Nominatim), website and booking URLs
- `clinic_status_checks`: append-only log of every scrape (accepting walk-ins, estimated wait, raw text, success or error)
- `clinic_latest_status`: view returning just the most recent check per clinic
- `clinic_hours`: regular posted operating hours per day of week (not yet populated by the scraper)

### Scraping approach

`src/scraper/clinicScraper.ts` uses Firecrawl's structured JSON extraction (a Zod schema) to pull `accepting_walk_ins`, `estimated_wait_minutes`, and a raw text snippet out of each clinic's website, including JS-rendered pages and booking widgets, since Firecrawl renders the page first. `src/scraper/runScrape.ts` runs this across all clinics (3 at a time) and logs a `clinic_status_checks` row per clinic, recording failures too so a broken scrape doesn't silently disappear. This is a good way to do a full batch refresh (e.g. on a schedule); the frontend's live sweep (below) is a separate, narrower mechanism triggered by user searches.

Next steps to make this more robust:

1. Keep expanding `clinics.seed.json` toward full GTA coverage (there are hundreds of walk-in clinics; 43 is a solid starting sample, not the ceiling).
2. For clinics where the website has no live status at all, decide a fallback (e.g. show posted hours from `clinic_hours`, or mark status as unknown, which is already the default).
3. Put `npm run scrape` on a schedule (cron, GitHub Actions, Supabase Edge Function cron, etc.) so status stays fresh even for clinics nobody has searched near recently.
4. Consider a real routing API (Google Maps, Mapbox) if traffic-aware drive times matter more than the current straight-line estimate.

## Frontend setup

The frontend does its own geocoding and its own live scraping through Next.js API routes, using server-only environment variables (never exposed to the browser).

1. `cd frontend && npm install`
2. Copy `.env.example` to `.env.local` and fill in `SUPABASE_SERVICE_ROLE_KEY` (see above) and `FIRECRAWL_API_KEY`.
3. `npm run dev`, runs on `http://localhost:3000`

See [frontend/README.md](frontend/README.md) for the page structure, the live "sweep" behavior, and the drive-time estimate's limitations.

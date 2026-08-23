# ClinicGo Backend

Helps Brampton residents find walk-in clinics that are actually open and accepting patients right now, by scraping clinic websites with Firecrawl and tracking status over time.

## Stack

- Node.js + TypeScript + Express
- Supabase (Postgres) for storage
- Firecrawl for scraping clinic websites

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` if you don't already have one, and fill in:
   - `FIRECRAWL_API_KEY` (already set for this project)
   - `SUPABASE_URL` (already set: the `clinicgo` project, ca-central-1)
   - `SUPABASE_SERVICE_ROLE_KEY` — **get this from the Supabase dashboard**: Project Settings > API Keys > `service_role` (secret). This key bypasses row-level security, so it must never be committed or shipped to the frontend/browser.
3. The database is already seeded with 8 real Brampton walk-in/urgent care clinics (see `src/seed/clinics.seed.json`) and has one round of live status checks. Add more clinics to that file and run `npm run seed` to add them.
4. Run `npm run scrape` any time to re-scrape all clinics for current walk-in/wait status.
5. Run `npm run dev` to start the API on `http://localhost:3000`.

## API

- `GET /clinics` — all clinics with their latest known status
- `GET /clinics/open` — clinics currently believed to be accepting walk-ins
- `GET /clinics/:id` — one clinic plus its last 20 status checks

## For the frontend

Two ways to get data, pick whichever is easier:

**Option A — hit this Express API.** Run `npm run dev` (see Setup below) and call `http://localhost:3000/clinics` etc. Simplest if you don't want to deal with Supabase directly.

**Option B — query Supabase directly** from the frontend using the public (read-only) key:

```
SUPABASE_URL=https://tswmmqhtikfrmmimncpy.supabase.co
SUPABASE_ANON_KEY=sb_publishable_jwK1pgHZnf6zSig91jdofw_8WCdgi6w
```

This key is safe to put in frontend code / a public `.env` — row-level security is on and it can only `SELECT`, never write. Useful tables/views: `clinics`, `clinic_latest_status` (join on `clinic_id`), `clinic_status_checks` (history), `clinic_hours`.

Do **not** use the `service_role` key anywhere in frontend code — that one bypasses RLS and is backend-only.

## Database

Schema lives in the `clinicgo` Supabase project (region ca-central-1):

- `clinics` — static info: name, address, coordinates, website/booking URLs
- `clinic_status_checks` — append-only log of every scrape (accepting walk-ins?, estimated wait, raw text, success/error)
- `clinic_latest_status` — view returning just the most recent check per clinic
- `clinic_hours` — regular posted operating hours per day of week (not yet populated by the scraper)

## Scraping approach

`src/scraper/clinicScraper.ts` uses Firecrawl's structured JSON extraction (a Zod schema) to pull `accepting_walk_ins`, `estimated_wait_minutes`, and a raw text snippet out of each clinic's website — including JS-rendered pages/booking widgets, since Firecrawl renders the page first. `src/scraper/runScrape.ts` runs this across all clinics (3 at a time) and logs a `clinic_status_checks` row per clinic, recording failures too so a broken scrape doesn't silently disappear.

Known limitations in the current seed data: Pulse Urgent Care's two locations and UCC's two Brampton locations each share one homepage, so they'll get identical scraped status per run (the source site doesn't expose per-location status). Cornerstone Medical Clinic and Vital Urgent Care's homepages don't have any wait/walk-in language readable by the extractor, so their status is null (unknown) rather than wrong.

Next steps to make this genuinely useful:

1. Populate `clinics.seed.json` with real Brampton walk-in clinics/urgent care sites (name, address, website).
2. For clinics where the website has no live status at all, decide a fallback (e.g. just show posted hours from `clinic_hours`, or mark status "unknown").
3. Put `npm run scrape` on a schedule (cron, GitHub Actions, Supabase Edge Function cron, etc.) so status stays fresh.
4. Add geolocation-based sorting once clinics have `lat`/`lng` filled in (could geocode `address` during seeding).

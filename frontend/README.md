# ClinicGo Frontend

Next.js and Tailwind app for finding GTA walk-in clinics by address, with a live status sweep and estimated drive distance.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Fill in `.env.local` with:
- `SUPABASE_URL` (already filled in, points at the shared `clinicgo` project)
- `SUPABASE_SERVICE_ROLE_KEY`: from the Supabase dashboard, Project Settings, API Keys, `service_role` (secret). Server-only, used by `/api/sweep` to write fresh scrape results. Never exposed to the browser.
- `FIRECRAWL_API_KEY`: used by `/api/sweep` to live-scrape nearby clinics.

Open `http://localhost:3000`.

## Pages

- `/`: Home. A hero with a photo background, the address input, and a small photo gallery below.
- `/locate`: enter an address (or arrive from Home with one pre-filled) to sweep the nearest clinics across the GTA, checked live, with an "accepting walk-ins only" filter.
- `/founders`: founder profiles. Avatars are placeholders (initials); replace with real photos when available.

## How the live sweep works

Unlike a typical cached listing, searching an address on `/locate` triggers a real scrape, not just a database read:

1. `/api/geocode` resolves the typed address to coordinates via OpenStreetMap Nominatim, biased to the GTA.
2. `/api/sweep` finds the 15 nearest clinics (by straight-line distance) to those coordinates.
3. For any of those clinics whose last check is older than 10 minutes (or has none), it scrapes that clinic's website live via Firecrawl and writes a fresh `clinic_status_checks` row.
4. It returns all 15 clinics with their latest status (freshly scraped or still-fresh cached) and distance.

The 10-minute freshness window and 15-clinic cap exist to keep repeated searches from re-scraping the same clinics over and over and burning Firecrawl credits pointlessly. This does mean a search can take several seconds since it's waiting on live scrapes, not just a database query.

## Structure

- `src/lib/geo.ts`: haversine distance, plus a rough drive-time estimate (straight-line distance divided by an assumed 35 km/h city speed, not a routed ETA)
- `src/lib/types.ts`: `Clinic` and `ClinicLatestStatus` types matching the backend schema
- `src/lib/sweepSchema.ts`: the Zod schema for live extraction, mirrors the backend's `clinicScraper.ts`
- `src/app/api/geocode/route.ts`: server route that geocodes a free-text address via Nominatim
- `src/app/api/sweep/route.ts`: server route that finds nearby clinics and live-scrapes stale ones
- `src/components/Header.tsx`: nav (Home, Locate, Founders, View on GitHub)
- `src/components/AddressSearch.tsx`: reusable address input and submit button
- `src/components/DecorativeBlobs.tsx`: purely decorative background shapes
- `src/app/locate/LocateClient.tsx`: calls geocode then sweep, renders results sorted by distance
- `src/components/ClinicCard.tsx`: one clinic's card, status badge, distance and drive time, wait time, address, phone/website/booking links

## Known limitations

- Drive time is a rough estimate (straight-line distance at an assumed average speed), not a real routed or traffic-aware ETA. A routing API (Google Maps, Mapbox) would be needed for that.
- Geocoding is limited to about 1 request per second per Nominatim's usage policy, fine for interactive use, not for bulk lookups.
- The live sweep only checks the 15 nearest clinics per search, and skips re-scraping anything checked in the last 10 minutes.
- Founders page has placeholder avatars, not real photos.

## Next steps

- Swap founder placeholder avatars for real photos.
- Add a map view now that clinics have `lat`/`lng`.
- Consider a real routing API if accurate, traffic-aware drive times matter more than the current estimate.

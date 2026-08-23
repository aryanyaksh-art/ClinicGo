# ClinicGo Frontend

Next.js + Tailwind app for finding Brampton walk-in clinics by address, with live status and drive distance.

## Setup

```bash
cp .env.example .env.local   # already has working, safe (read-only) Supabase credentials
npm install
npm run dev
```

Open `http://localhost:3000`.

## Pages

- `/` — Home: minimal hero with an address input. Submitting routes to `/locate?address=...`.
- `/locate` — enter an address (or arrive from Home with one pre-filled) to see all clinics sorted by distance, with an "accepting walk-ins only" filter.
- `/founders` — founder profiles. Avatars are placeholders (initials) — drop real photos into `/public/founders/` and swap the `<div>` avatar in `src/app/founders/page.tsx` for an `<Image>`.

## Structure

- `src/lib/supabase.ts` — Supabase client using the public anon key (RLS restricts it to read-only)
- `src/lib/types.ts` — `Clinic` / `ClinicLatestStatus` types matching the backend schema
- `src/lib/geo.ts` — haversine distance + a rough drive-time estimate (straight-line distance / assumed 35 km/h city speed — **not** a routed ETA)
- `src/app/api/geocode/route.ts` — server route that geocodes a free-text address via OpenStreetMap Nominatim, biased to Brampton. No API key needed.
- `src/components/Header.tsx` — nav (Home / Locate / Founders / View on GitHub)
- `src/components/AddressSearch.tsx` — reusable address input + submit, used on both Home and Locate
- `src/app/locate/LocateClient.tsx` — geocodes the address, fetches clinics, computes/sorts by distance
- `src/components/ClinicCard.tsx` — one clinic's card: status badge, distance/drive time (if known), wait time, address, phone/website/booking links

## Data model

Each clinic row comes back with an embedded `clinic_latest_status` array (0 or 1 items — it's the latest scrape only) and now `lat`/`lng` (geocoded once via Nominatim and stored in Supabase — see root README). `accepting_walk_ins` is `true`, `false`, or `null` (unknown — the scraper couldn't find a clear signal on that clinic's site). See the root [README](../README.md) for the full schema and scraping approach.

## Known limitations

- Drive time is a rough estimate (straight-line distance at an assumed average speed), not a real routed ETA. A routing API (e.g. OSRM, Mapbox, Google Directions) would be needed for accurate drive times.
- Geocoding is limited to ~1 request/sec per Nominatim's usage policy — fine for interactive use, not for bulk lookups.
- Founders page has placeholder avatars, not real photos.

## Next steps

- Swap founder placeholder avatars for real photos.
- Add a map view now that clinics have `lat`/`lng`.
- Consider a real routing API if accurate drive times matter more than the current estimate.

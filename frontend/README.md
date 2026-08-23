# ClinicGo Frontend

Next.js + Tailwind app that shows Brampton walk-in clinics and whether they're currently accepting patients.

## Setup

```bash
cp .env.example .env.local   # already has working, safe (read-only) Supabase credentials
npm install
npm run dev
```

Open `http://localhost:3000`.

## Structure

- `src/lib/supabase.ts` — Supabase client using the public anon key (RLS restricts it to read-only)
- `src/lib/types.ts` — `Clinic` / `ClinicLatestStatus` types matching the backend schema
- `src/app/page.tsx` — server component, fetches `clinics` joined with `clinic_latest_status`, revalidates every 60s
- `src/components/ClinicList.tsx` — client component: search box + "accepting walk-ins" filter
- `src/components/ClinicCard.tsx` — one clinic's card: name, status badge, wait time, address, phone/website/booking links

## Data model

Each clinic row comes back with an embedded `clinic_latest_status` array (0 or 1 items — it's the latest scrape only). `accepting_walk_ins` is `true`, `false`, or `null` (unknown — the scraper couldn't find a clear signal on that clinic's site). See the root [README](../README.md) for the full schema and scraping approach.

## Next steps

- Add a map view once clinics have `lat`/`lng` populated.
- Add loading/empty states for slow connections.
- Consider polling or realtime (Supabase Realtime) instead of the 60s static revalidation if "live-ness" matters more.

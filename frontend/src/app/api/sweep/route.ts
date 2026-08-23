import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Firecrawl } from "firecrawl";
import { distanceKm } from "@/lib/geo";
import { walkInStatusSchema } from "@/lib/sweepSchema";
import type { Clinic } from "@/lib/types";

export const maxDuration = 60;

const NEAREST_N = 15;
const FRESHNESS_MINUTES = 10;
const SCRAPE_CONCURRENCY = 5;

// Constructed lazily (inside the handler, not at module load) so a missing env var
// only breaks requests to this route, not the whole build.
let supabaseAdmin: SupabaseClient | undefined;
function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
  }
  return supabaseAdmin;
}

let firecrawl: Firecrawl | undefined;
function getFirecrawl(): Firecrawl {
  if (!firecrawl) {
    firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY! });
  }
  return firecrawl;
}

interface RawClinic extends Clinic {
  clinic_latest_status: Array<Clinic["clinic_latest_status"][number]>;
}

async function scrapeOne(clinic: Clinic) {
  const supabase = getSupabaseAdmin();
  try {
    const result = await getFirecrawl().scrape(clinic.website_url, {
      formats: [{ type: "json", schema: walkInStatusSchema }],
      onlyMainContent: false,
      timeout: 45_000,
    });
    const extracted = (result as { json?: unknown }).json as
      | { accepting_walk_ins: boolean | null; estimated_wait_minutes: number | null; raw_status_text: string | null }
      | undefined;

    const row = {
      clinic_id: clinic.id,
      accepting_walk_ins: extracted?.accepting_walk_ins ?? null,
      estimated_wait_minutes: extracted?.estimated_wait_minutes ?? null,
      raw_status_text: extracted?.raw_status_text ?? null,
      scrape_success: true,
      scrape_error: null,
    };
    await supabase.from("clinic_status_checks").insert(row);
    return { ...row, checked_at: new Date().toISOString() };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const row = {
      clinic_id: clinic.id,
      accepting_walk_ins: null,
      estimated_wait_minutes: null,
      raw_status_text: null,
      scrape_success: false,
      scrape_error: message,
    };
    await supabase.from("clinic_status_checks").insert(row);
    return { ...row, checked_at: new Date().toISOString() };
  }
}

async function runBatched<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export async function POST(req: NextRequest) {
  const { lat, lon } = (await req.json()) as { lat?: number; lon?: number };
  if (typeof lat !== "number" || typeof lon !== "number") {
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("clinics")
    .select("*, clinic_latest_status(*)")
    .not("lat", "is", null)
    .not("lng", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const clinics = (data ?? []) as unknown as RawClinic[];

  const withDistance = clinics
    .map((clinic) => ({ clinic, distanceKm: distanceKm(lat, lon, clinic.lat!, clinic.lng!) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, NEAREST_N);

  const freshnessCutoff = Date.now() - FRESHNESS_MINUTES * 60_000;

  const toScrape = withDistance.filter(({ clinic }) => {
    const lastCheck = clinic.clinic_latest_status[0]?.checked_at;
    return !lastCheck || new Date(lastCheck).getTime() < freshnessCutoff;
  });

  await runBatched(
    toScrape.map((r) => r.clinic),
    SCRAPE_CONCURRENCY,
    scrapeOne
  );

  // Re-fetch so every clinic (freshly scraped or already-fresh) reflects its latest status.
  const ids = withDistance.map((r) => r.clinic.id);
  const { data: refreshed, error: refreshError } = await supabase
    .from("clinics")
    .select("*, clinic_latest_status(*)")
    .in("id", ids);

  if (refreshError) {
    return NextResponse.json({ error: refreshError.message }, { status: 500 });
  }

  const byId = new Map((refreshed as unknown as RawClinic[]).map((c) => [c.id, c]));
  const results = withDistance.map(({ clinic, distanceKm }) => ({
    clinic: byId.get(clinic.id) ?? clinic,
    distanceKm,
  }));

  return NextResponse.json({ results, sweptCount: toScrape.length });
}

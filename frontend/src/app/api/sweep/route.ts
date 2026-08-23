import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Firecrawl } from "firecrawl";
import { distanceKm } from "@/lib/geo";
import { walkInStatusSchema } from "@/lib/sweepSchema";
import type { Clinic, ClinicLatestStatus } from "@/lib/types";

export const maxDuration = 60;

const NEAREST_N = 10;
const FRESHNESS_MINUTES = 10;
const SCRAPE_CONCURRENCY = 3;
const RATE_LIMIT_RETRY_DELAY_MS = 5000;

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
  clinic_latest_status: ClinicLatestStatus[];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeWithRetry(url: string) {
  try {
    return await getFirecrawl().scrape(url, {
      formats: [{ type: "json", schema: walkInStatusSchema }],
      onlyMainContent: false,
      timeout: 45_000,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("Rate limit exceeded")) {
      await sleep(RATE_LIMIT_RETRY_DELAY_MS);
      return await getFirecrawl().scrape(url, {
        formats: [{ type: "json", schema: walkInStatusSchema }],
        onlyMainContent: false,
        timeout: 45_000,
      });
    }
    throw err;
  }
}

async function scrapeOne(clinic: Clinic) {
  const supabase = getSupabaseAdmin();
  try {
    const result = await scrapeWithRetry(clinic.website_url);
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
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await supabase.from("clinic_status_checks").insert({
      clinic_id: clinic.id,
      accepting_walk_ins: null,
      estimated_wait_minutes: null,
      raw_status_text: null,
      scrape_success: false,
      scrape_error: message,
    });
  }
}

async function runBatched<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

/** Prefer the latest check; if it failed, fall back to the most recent successful one so a
 *  transient scrape failure doesn't blank out previously-known-good status in the UI. */
function pickDisplayStatus(checks: ClinicLatestStatus[]): ClinicLatestStatus | undefined {
  if (checks.length === 0) return undefined;
  const [latest] = checks;
  if (latest.scrape_success) return latest;
  return checks.find((c) => c.scrape_success) ?? latest;
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

  // Pull recent history (not just the single latest row) so a fresh failure can fall back
  // to the last known-good status instead of displaying "unknown".
  const ids = withDistance.map((r) => r.clinic.id);
  const { data: history, error: historyError } = await supabase
    .from("clinic_status_checks")
    .select("*")
    .in("clinic_id", ids)
    .order("checked_at", { ascending: false })
    .limit(ids.length * 5);

  if (historyError) {
    return NextResponse.json({ error: historyError.message }, { status: 500 });
  }

  const historyByClinicId = new Map<string, ClinicLatestStatus[]>();
  for (const check of history as ClinicLatestStatus[]) {
    const list = historyByClinicId.get(check.clinic_id) ?? [];
    list.push(check);
    historyByClinicId.set(check.clinic_id, list);
  }

  const results = withDistance.map(({ clinic, distanceKm }) => {
    const display = pickDisplayStatus(historyByClinicId.get(clinic.id) ?? []);
    return {
      clinic: { ...clinic, clinic_latest_status: display ? [display] : [] },
      distanceKm,
    };
  });

  return NextResponse.json({ results, sweptCount: toScrape.length });
}

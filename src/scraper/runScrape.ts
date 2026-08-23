import { supabase } from "../db/supabase.js";
import { scrapeClinicStatus } from "./clinicScraper.js";
import type { Clinic } from "../types.js";

const CONCURRENCY = 3;

async function scrapeOne(clinic: Clinic): Promise<void> {
  try {
    const status = await scrapeClinicStatus(clinic);
    const { error } = await supabase.from("clinic_status_checks").insert({
      clinic_id: clinic.id,
      accepting_walk_ins: status.accepting_walk_ins,
      estimated_wait_minutes: status.estimated_wait_minutes,
      raw_status_text: status.raw_status_text,
      scrape_success: true,
    });
    if (error) throw error;
    console.log(`[ok] ${clinic.name}: accepting=${status.accepting_walk_ins} wait=${status.estimated_wait_minutes}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await supabase.from("clinic_status_checks").insert({
      clinic_id: clinic.id,
      scrape_success: false,
      scrape_error: message,
    });
    console.error(`[fail] ${clinic.name}: ${message}`);
  }
}

async function runBatched<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const item = items[cursor++];
      await fn(item);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

async function main() {
  const { data: clinics, error } = await supabase.from("clinics").select("*");
  if (error) throw error;
  if (!clinics || clinics.length === 0) {
    console.log("No clinics in the database yet. Seed some first.");
    return;
  }

  console.log(`Scraping ${clinics.length} clinics (concurrency=${CONCURRENCY})...`);
  await runBatched(clinics as Clinic[], CONCURRENCY, scrapeOne);
  console.log("Done.");
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { supabase } from "../db/supabase.js";
import type { ClinicSeed } from "../types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const raw = readFileSync(join(__dirname, "clinics.seed.json"), "utf-8");
  const seeds: ClinicSeed[] = JSON.parse(raw);

  const { error, count } = await supabase
    .from("clinics")
    .upsert(
      seeds.map((s) => ({
        name: s.name,
        address: s.address,
        website_url: s.website_url,
        source_url: s.source_url,
        phone: s.phone ?? null,
        booking_url: s.booking_url ?? null,
      })),
      { onConflict: "name,address", count: "exact" }
    );

  if (error) throw error;
  console.log(`Upserted ${count ?? seeds.length} clinics.`);
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);

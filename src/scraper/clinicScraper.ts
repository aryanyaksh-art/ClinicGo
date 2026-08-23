import { z } from "zod";
import { firecrawl } from "./firecrawl.js";
import type { Clinic, ClinicStatusExtraction } from "../types.js";

const walkInStatusSchema = z.object({
  accepting_walk_ins: z
    .boolean()
    .nullable()
    .describe(
      "Whether the clinic is currently accepting walk-in patients today, based on the page content. Null if not stated."
    ),
  estimated_wait_minutes: z
    .number()
    .nullable()
    .describe("Current estimated wait time in minutes, if the page states one. Null if not stated."),
  raw_status_text: z
    .string()
    .nullable()
    .describe("The short snippet of page text that indicates walk-in/wait status, quoted as-is."),
});

/**
 * Scrapes a single clinic's website and extracts current walk-in/wait status.
 * Firecrawl handles JS-rendered pages, so this works even if the status is
 * loaded client-side (e.g. a booking widget).
 */
export async function scrapeClinicStatus(clinic: Pick<Clinic, "website_url">): Promise<ClinicStatusExtraction> {
  const result = await firecrawl.scrape(clinic.website_url, {
    formats: [{ type: "json", schema: walkInStatusSchema }],
    onlyMainContent: false,
    timeout: 60_000,
  });

  const extracted = (result as { json?: unknown }).json as z.infer<typeof walkInStatusSchema> | undefined;

  return {
    accepting_walk_ins: extracted?.accepting_walk_ins ?? null,
    estimated_wait_minutes: extracted?.estimated_wait_minutes ?? null,
    raw_status_text: extracted?.raw_status_text ?? null,
  };
}

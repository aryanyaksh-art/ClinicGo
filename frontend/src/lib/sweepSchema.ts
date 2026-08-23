import { z } from "zod";

// Mirrors the backend's clinicScraper.ts schema (no shared package between the two apps yet).

export const walkInStatusSchema = z.object({
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

export type WalkInStatus = z.infer<typeof walkInStatusSchema>;

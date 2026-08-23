import { Firecrawl } from "firecrawl";
import { config } from "../config.js";

export const firecrawl = new Firecrawl({ apiKey: config.firecrawlApiKey });

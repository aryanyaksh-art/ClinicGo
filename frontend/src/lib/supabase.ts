import { createClient } from "@supabase/supabase-js";

// Fallback values are the project's public, read-only (RLS-restricted) credentials —
// safe to ship in client code, kept here so the app works even if env vars aren't set.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://tswmmqhtikfrmmimncpy.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_jwK1pgHZnf6zSig91jdofw_8WCdgi6w";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

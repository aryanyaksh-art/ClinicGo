import { supabase } from "@/lib/supabase";
import type { Clinic } from "@/lib/types";
import { ClinicList } from "@/components/ClinicList";

export const revalidate = 60;

export default async function Home() {
  const { data, error } = await supabase
    .from("clinics")
    .select("*, clinic_latest_status(*)")
    .order("name");

  const clinics = (data ?? []) as unknown as Clinic[];

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">ClinicGo</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Find a walk-in clinic in Brampton that&apos;s actually open right now.
          </p>
        </div>

        {error ? (
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
            Failed to load clinics: {error.message}
          </p>
        ) : (
          <ClinicList clinics={clinics} />
        )}
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { distanceKm } from "@/lib/geo";
import type { Clinic } from "@/lib/types";
import { AddressSearch } from "@/components/AddressSearch";
import { ClinicCard } from "@/components/ClinicCard";

interface ResultClinic {
  clinic: Clinic;
  distanceKm: number | null;
}

export function LocateClient() {
  const searchParams = useSearchParams();
  const initialAddress = searchParams.get("address") ?? "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [results, setResults] = useState<ResultClinic[] | null>(null);
  const [openOnly, setOpenOnly] = useState(false);

  async function handleSearch(address: string) {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const geoRes = await fetch(`/api/geocode?q=${encodeURIComponent(address)}`);
      const geoData = await geoRes.json();

      if (!geoRes.ok) {
        setError(geoData.error ?? "Could not find that address.");
        return;
      }

      const { lat, lon, display_name } = geoData as { lat: number; lon: number; display_name: string };
      setLocationLabel(display_name);

      const { data, error: dbError } = await supabase
        .from("clinics")
        .select("*, clinic_latest_status(*)")
        .order("name");

      if (dbError) {
        setError(dbError.message);
        return;
      }

      const clinics = (data ?? []) as unknown as Clinic[];
      const withDistance: ResultClinic[] = clinics.map((clinic) => ({
        clinic,
        distanceKm: clinic.lat != null && clinic.lng != null ? distanceKm(lat, lon, clinic.lat, clinic.lng) : null,
      }));

      withDistance.sort((a, b) => {
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });

      setResults(withDistance);
    } catch {
      setError("Something went wrong finding that address. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initialAddress) return;
    const timer = setTimeout(() => handleSearch(initialAddress), 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleResults = results?.filter((r) => !openOnly || r.clinic.clinic_latest_status[0]?.accepting_walk_ins === true);

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Locate a clinic</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Enter your address to see Brampton walk-in clinics sorted by how far they are from you.
          </p>
        </div>

        <AddressSearch initialValue={initialAddress} onSearch={handleSearch} />

        {loading && <p className="text-sm text-zinc-500">Finding clinics near you...</p>}

        {error && (
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </p>
        )}

        {locationLabel && !error && (
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            Showing distances from <span className="font-medium text-zinc-700 dark:text-zinc-300">{locationLabel}</span>
          </p>
        )}

        {results && (
          <>
            <label className="flex w-fit items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={openOnly}
                onChange={(e) => setOpenOnly(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
              />
              Accepting walk-ins only
            </label>

            {visibleResults && visibleResults.length === 0 ? (
              <p className="py-12 text-center text-zinc-500">No clinics match.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleResults?.map((r) => (
                  <ClinicCard key={r.clinic.id} clinic={r.clinic} distanceKm={r.distanceKm ?? undefined} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

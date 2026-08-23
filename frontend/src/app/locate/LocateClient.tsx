"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import type { Clinic } from "@/lib/types";
import { AddressSearch } from "@/components/AddressSearch";
import { ClinicCard } from "@/components/ClinicCard";
import { RadarSweep } from "@/components/RadarSweep";

interface ResultClinic {
  clinic: Clinic;
  distanceKm: number;
}

const gallery = [
  { src: "/images/doctor-patient.jpg", alt: "Doctor checking a young patient" },
  { src: "/images/front-desk-chat.jpg", alt: "Patient chatting with clinic staff at the front desk" },
  { src: "/images/clinic-reception.webp", alt: "Clinic reception and waiting area" },
  { src: "/images/exam-room.jpg", alt: "A clean, ready exam room" },
];

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

      const sweepRes = await fetch("/api/sweep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      });
      const sweepData = await sweepRes.json();

      if (!sweepRes.ok) {
        setError(sweepData.error ?? "Could not check clinics right now.");
        return;
      }

      setResults(sweepData.results as ResultClinic[]);
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
      <section className="relative isolate flex items-center overflow-hidden py-16">
        <Image src="/images/clinic-reception.webp" alt="A clinic reception area" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/90 via-emerald-900/80 to-emerald-800/70" />

        <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Locate a clinic</h1>
            <p className="text-emerald-50/90">
              Enter your address to sweep the nearest walk-in clinics across the GTA, checked live, right now.
            </p>
          </div>
          <AddressSearch initialValue={initialAddress} onSearch={handleSearch} />
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-3 px-6 py-8 sm:grid-cols-4">
        {gallery.map((image) => (
          <div key={image.src} className="relative aspect-square overflow-hidden rounded-xl shadow-sm">
            <Image src={image.src} alt={image.alt} fill className="object-cover" />
          </div>
        ))}
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 pb-16">
        {loading && (
          <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <RadarSweep size={72} />
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-50">Sweeping clinics near you</p>
              <p className="text-sm text-zinc-500">Checking each clinic&apos;s site live, this can take a moment...</p>
            </div>
          </div>
        )}

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
                className="h-4 w-4 rounded border-zinc-300 text-accent focus:ring-accent dark:border-zinc-700"
              />
              Accepting walk-ins only
            </label>

            {visibleResults && visibleResults.length === 0 ? (
              <p className="py-12 text-center text-zinc-500">No clinics match.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleResults?.map((r) => (
                  <ClinicCard key={r.clinic.id} clinic={r.clinic} distanceKm={r.distanceKm} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

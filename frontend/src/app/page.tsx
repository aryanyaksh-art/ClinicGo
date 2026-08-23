"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { AddressSearch } from "@/components/AddressSearch";
import { DecorativeBlobs } from "@/components/DecorativeBlobs";

export default function Home() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden">
      <Image
        src="/images/hero-waiting-room.jpg"
        alt="A calm clinic waiting room"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/85 via-emerald-900/75 to-emerald-800/60" />
      <DecorativeBlobs />

      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-6 py-24 text-center">
        <div className="flex flex-col gap-4">
          <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">ClinicGo</h1>
          <p className="mx-auto max-w-xl text-lg text-emerald-50/90">
            Type in your address and we&apos;ll find walk-in clinics near you across the GTA, with how far of a
            drive each one is.
          </p>
        </div>

        <div className="w-full max-w-xl">
          <AddressSearch
            size="lg"
            onSearch={(address) => router.push(`/locate?address=${encodeURIComponent(address)}`)}
          />
        </div>
      </div>
    </main>
  );
}

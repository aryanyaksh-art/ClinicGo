"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { AddressSearch } from "@/components/AddressSearch";
import { DecorativeBlobs } from "@/components/DecorativeBlobs";

const gallery = [
  { src: "/images/doctor-patient.jpg", alt: "Doctor checking a young patient" },
  { src: "/images/front-desk-chat.jpg", alt: "Patient chatting with clinic staff at the front desk" },
  { src: "/images/clinic-reception.webp", alt: "Clinic reception and waiting area" },
  { src: "/images/exam-room.jpg", alt: "A clean, ready exam room" },
];

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex flex-1 flex-col bg-white dark:bg-black">
      <section className="relative isolate flex min-h-[36rem] items-center overflow-hidden">
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
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Real clinics, checked live
          </h2>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            We check each clinic&apos;s own site so you know before you drive there.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {gallery.map((image) => (
            <div key={image.src} className="relative aspect-square overflow-hidden rounded-2xl shadow-sm">
              <Image src={image.src} alt={image.alt} fill className="object-cover" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

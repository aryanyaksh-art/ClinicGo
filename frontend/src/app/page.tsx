"use client";

import { useRouter } from "next/navigation";
import { AddressSearch } from "@/components/AddressSearch";

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex flex-1 items-center bg-white dark:bg-black">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-6 py-24 text-center">
        <div className="flex flex-col gap-4">
          <h1 className="text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
            ClinicGo
          </h1>
          <p className="mx-auto max-w-xl text-lg text-zinc-500 dark:text-zinc-400">
            Type in your address and we&apos;ll find walk-in clinics near you in Brampton — with how far of a
            drive each one is.
          </p>
        </div>

        <div className="w-full max-w-xl">
          <AddressSearch size="lg" onSearch={(address) => router.push(`/locate?address=${encodeURIComponent(address)}`)} />
        </div>
      </div>
    </main>
  );
}

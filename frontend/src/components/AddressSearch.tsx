"use client";

import { useState } from "react";

export function AddressSearch({
  onSearch,
  initialValue = "",
  size = "md",
}: {
  onSearch: (address: string) => void;
  initialValue?: string;
  size?: "md" | "lg";
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onSearch(value.trim());
      }}
      className="flex w-full flex-col gap-3 sm:flex-row"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter your address in the GTA..."
        className={`w-full rounded-full border border-zinc-300 bg-white px-5 text-zinc-900 shadow-sm outline-none transition focus:border-accent dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 ${
          size === "lg" ? "py-4 text-base" : "py-2.5 text-sm"
        }`}
      />
      <button
        type="submit"
        className={`shrink-0 rounded-full bg-accent font-medium text-white transition hover:bg-accent-hover ${
          size === "lg" ? "px-8 py-4 text-base" : "px-6 py-2.5 text-sm"
        }`}
      >
        Find clinics
      </button>
    </form>
  );
}

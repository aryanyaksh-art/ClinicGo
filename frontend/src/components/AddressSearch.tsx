"use client";

import { useEffect, useRef, useState } from "react";

interface Suggestion {
  id: number;
  lat: number;
  lon: number;
  display_name: string;
}

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
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim().length < 3) {
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/geocode/suggest?q=${encodeURIComponent(value)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data: { results: Suggestion[] }) => {
          setSuggestions(data.results ?? []);
          setOpen(true);
          setHighlighted(-1);
        })
        .catch(() => {});
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function selectSuggestion(s: Suggestion) {
    setValue(s.display_name);
    setSuggestions([]);
    setOpen(false);
    onSearch(s.display_name);
  }

  const inputClasses = `w-full rounded-full border border-zinc-300 bg-white px-5 text-zinc-900 shadow-sm outline-none transition focus:border-accent dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 ${
    size === "lg" ? "py-4 text-base" : "py-2.5 text-sm"
  }`;

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setOpen(false);
          if (value.trim()) onSearch(value.trim());
        }}
        className="flex w-full flex-col gap-3 sm:flex-row"
      >
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const next = e.target.value;
            setValue(next);
            if (next.trim().length < 3) {
              setSuggestions([]);
              setOpen(false);
            }
          }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onKeyDown={(e) => {
            if (!open || suggestions.length === 0) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlighted((h) => Math.max(h - 1, 0));
            } else if (e.key === "Enter" && highlighted >= 0) {
              e.preventDefault();
              selectSuggestion(suggestions[highlighted]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder="Enter your address in the GTA..."
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="address-suggestions"
          className={inputClasses}
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

      {open && suggestions.length > 0 && (
        <ul
          id="address-suggestions"
          role="listbox"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          {suggestions.map((s, i) => (
            <li key={s.id} role="option" aria-selected={highlighted === i}>
              <button
                type="button"
                onClick={() => selectSuggestion(s)}
                onMouseEnter={() => setHighlighted(i)}
                className={`block w-full px-5 py-3 text-left text-sm ${
                  highlighted === i ? "bg-accent-soft text-accent" : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {s.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

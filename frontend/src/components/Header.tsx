"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/locate", label: "Locate" },
  { href: "/founders", label: "Founders" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-end gap-10 px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          ClinicGo
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <a
          href="https://github.com/aryanyaksh-art/ClinicGo"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-50 dark:hover:text-zinc-50"
        >
          View on GitHub
        </a>
      </div>
    </header>
  );
}

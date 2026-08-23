/** Purely decorative background accents. Not interactive; hidden from assistive tech. */
export function DecorativeBlobs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/10" />
      <div className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-400/10" />
      <svg
        className="absolute bottom-0 left-1/2 h-64 w-[48rem] -translate-x-1/2 opacity-[0.07] dark:opacity-[0.08]"
        viewBox="0 0 400 100"
      >
        <defs>
          <pattern id="dot-grid" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" className="text-accent" />
          </pattern>
        </defs>
        <rect width="400" height="100" fill="url(#dot-grid)" />
      </svg>
    </div>
  );
}

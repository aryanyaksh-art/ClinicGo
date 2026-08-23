/** The literal "sweep" made visual: a radar ping used while /api/sweep is checking nearby clinics live. */
export function RadarSweep({ size = 112 }: { size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label="Sweeping nearby clinics">
      <div className="absolute inset-0 rounded-full bg-accent-soft" />
      <div className="absolute inset-[12%] rounded-full border border-accent/25" />
      <div className="absolute inset-[28%] rounded-full border border-accent/25" />
      <div className="absolute inset-[44%] rounded-full border border-accent/25" />
      <div
        className="radar-sweep-wedge absolute inset-0 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, transparent 0deg, color-mix(in srgb, var(--accent) 55%, transparent) 26deg, transparent 60deg)",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-2 w-2 rounded-full bg-accent" />
      </div>
    </div>
  );
}

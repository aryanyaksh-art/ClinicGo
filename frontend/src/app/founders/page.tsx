import { DecorativeBlobs } from "@/components/DecorativeBlobs";

const founders = [
  { name: "Aryan", role: "Co-Founder", initials: "A" },
  { name: "Gurneil", role: "Co-Founder", initials: "G" },
];

export default function FoundersPage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden bg-white dark:bg-black">
      <DecorativeBlobs />
      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-6 py-16">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Founders</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Built by two people from Brampton who got tired of not being able to find an open clinic.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
          {founders.map((founder) => (
            <div key={founder.name} className="flex flex-col items-center gap-4 text-center">
              {/* TODO: replace with a real photo, e.g. /founders/aryan.jpg in /public */}
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-accent-soft text-3xl font-semibold text-accent">
                {founder.initials}
              </div>
              <div>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{founder.name}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-500">{founder.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

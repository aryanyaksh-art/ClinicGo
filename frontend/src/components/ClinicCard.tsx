import type { Clinic } from "@/lib/types";
import { estimatedDriveMinutes } from "@/lib/geo";

function StatusBadge({ accepting }: { accepting: boolean | null }) {
  if (accepting === true) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
        Accepting walk-ins
      </span>
    );
  }
  if (accepting === false) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900/40 dark:text-red-300">
        Not accepting walk-ins
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
      Status unknown
    </span>
  );
}

export function ClinicCard({ clinic, distanceKm }: { clinic: Clinic; distanceKm?: number }) {
  const status = clinic.clinic_latest_status[0];

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{clinic.name}</h2>
        <StatusBadge accepting={status?.accepting_walk_ins ?? null} />
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">{clinic.address}</p>

      {distanceKm != null && (
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          {distanceKm.toFixed(1)} km away &middot; ~{estimatedDriveMinutes(distanceKm)} min drive (estimated)
        </p>
      )}

      {status?.estimated_wait_minutes != null && (
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          ~{status.estimated_wait_minutes} min estimated wait
        </p>
      )}

      {status?.raw_status_text && (
        <p className="text-sm italic text-zinc-500 dark:text-zinc-500">&ldquo;{status.raw_status_text}&rdquo;</p>
      )}

      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {clinic.phone && (
          <a href={`tel:${clinic.phone}`} className="text-blue-600 hover:underline dark:text-blue-400">
            {clinic.phone}
          </a>
        )}
        <a
          href={clinic.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          Website
        </a>
        {clinic.booking_url && (
          <a
            href={clinic.booking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Book
          </a>
        )}
      </div>

      {status?.checked_at && (
        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          Last checked {new Date(status.checked_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}

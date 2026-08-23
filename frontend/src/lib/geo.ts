const EARTH_RADIUS_KM = 6371;
const AVERAGE_CITY_DRIVING_SPEED_KMH = 35;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Straight-line distance in km between two coordinates (haversine formula). */
export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/** Rough estimated drive time in minutes, based on straight-line distance. Not a routed ETA. */
export function estimatedDriveMinutes(km: number): number {
  return Math.round((km / AVERAGE_CITY_DRIVING_SPEED_KMH) * 60);
}

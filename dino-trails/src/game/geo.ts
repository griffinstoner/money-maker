export interface LatLng {
  latitude: number;
  longitude: number;
}

/** Straight-line distance between two points on Earth, in meters. */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Approximate local solar hour (0–24) at a longitude. Uses the sun instead of the
 * phone's clock, so everyone at the same spot agrees on whether it's night.
 */
export function solarHour(longitude: number, now: Date): number {
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
  return (((utcHours + longitude / 15) % 24) + 24) % 24;
}

export function isNight(longitude: number, now: Date): boolean {
  const hour = solarHour(longitude, now);
  return hour < 6 || hour >= 20;
}

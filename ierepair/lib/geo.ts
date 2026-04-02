import { redis } from "./redis";

export interface Coords {
  lat: number;
  lng: number;
}

/**
 * Resolve an Irish Eircode to lat/lng coordinates.
 * Results are cached in Redis for 30 days.
 */
export async function eircodeToCoords(eircode: string): Promise<Coords> {
  const normalised = eircode.replace(/\s/g, "").toUpperCase();
  const cacheKey = `eircode:${normalised}`;

  const cached = await redis.get<Coords>(cacheKey);
  if (cached) return cached;

  const url =
    `https://maps.googleapis.com/maps/api/geocode/json` +
    `?address=${encodeURIComponent(normalised + ", Ireland")}` +
    `&components=country:IE` +
    `&key=${process.env.GOOGLE_MAPS_API_KEY}`;

  const res = await fetch(url, { next: { revalidate: 0 } });
  const data = await res.json();

  if (data.status !== "OK" || !data.results[0]) {
    throw new Error(`Cannot resolve Eircode: ${eircode} — ${data.status}`);
  }

  const location = data.results[0].geometry.location as Coords;
  // Cache for 30 days
  await redis.setex(cacheKey, 60 * 60 * 24 * 30, JSON.stringify(location));
  return location;
}

/**
 * Rough bounding-box validation for Irish Eircodes (just format check).
 */
export function isValidEircode(eircode: string): boolean {
  const clean = eircode.replace(/\s/g, "").toUpperCase();
  return /^[A-Z0-9]{3}[A-Z0-9]{4}$/.test(clean);
}

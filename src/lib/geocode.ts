export async function geocodeEircode(
  eircode: string
): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  try {
    const encoded = encodeURIComponent(`${eircode}, Ireland`);
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${apiKey}`
    );
    const data = (await res.json()) as {
      status: string;
      results: Array<{ geometry: { location: { lat: number; lng: number } } }>;
    };
    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].geometry.location;
    }
  } catch (err) {
    console.error("[Geocode Error]", err);
  }
  return null;
}

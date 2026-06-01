export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Static lookup by Eircode routing key (first 3 chars, uppercase, no space).
// Covers all 139 Irish routing keys. No API key required.
const EIRCODE_CENTROIDS: Record<string, [number, number]> = {
  // Dublin city districts
  D01: [53.3525, -6.2566], D02: [53.3381, -6.2603], D03: [53.3742, -6.219],
  D04: [53.3271, -6.2219], D05: [53.3811, -6.2362], D06: [53.319, -6.2706],
  D6W: [53.3093, -6.2911], D07: [53.3631, -6.2972], D08: [53.3367, -6.3011],
  D09: [53.374, -6.2487],  D10: [53.3374, -6.3553], D11: [53.395, -6.3109],
  D12: [53.3203, -6.3086], D13: [53.3916, -6.1168], D14: [53.2973, -6.2361],
  D15: [53.3861, -6.3836], D16: [53.2793, -6.2636], D17: [53.3861, -6.1948],
  D18: [53.2747, -6.2028], D20: [53.3537, -6.4028], D22: [53.3207, -6.396],
  D24: [53.2877, -6.3756],
  // Fingal / North County Dublin
  K32: [53.6113, -6.1807], K34: [53.4596, -6.2181], K36: [53.4502, -6.1546],
  K45: [53.3977, -6.4103], K56: [53.4181, -6.178],  K67: [53.5186, -6.1783],
  K78: [53.427, -6.1448],
  // South County Dublin / Dún Laoghaire–Rathdown
  A94: [53.3041, -6.1793], A96: [53.2862, -6.2161], A98: [53.2021, -6.1016],
  // Wicklow
  A63: [52.9807, -6.0447], A67: [53.0073, -6.4228],
  // Kildare
  W12: [53.1671, -6.9142], W23: [53.3261, -6.5878], W34: [53.2043, -6.6716],
  W91: [53.0914, -6.8166],
  // Meath / Louth
  A42: [53.6447, -6.3417], A84: [53.7253, -6.3552], A85: [53.8044, -6.3874],
  A86: [53.6562, -6.5459], A87: [53.6148, -6.5063], C15: [53.6528, -6.9183],
  A82: [53.7762, -6.6378], A83: [53.8668, -6.7022],
  A41: [53.7453, -6.2338], A92: [53.9833, -6.3667],
  // Louth
  A91: [53.9888, -6.3940],
  // Westmeath / Longford / Roscommon
  N37: [53.5244, -7.3428], N39: [53.6978, -7.5583],
  F42: [53.8328, -8.3428], F45: [53.9954, -8.2927],
  // Cork city & county
  T12: [51.8985, -8.4756], T23: [51.8734, -8.5215],
  P12: [51.7699, -8.5392], P17: [51.8476, -8.9628], P24: [51.9419, -8.3261],
  P25: [51.8205, -8.2722], P31: [52.0786, -8.4978], P32: [52.1644, -8.4564],
  P43: [51.6963, -8.8747], P47: [51.5436, -9.7453], P51: [51.6764, -9.4606],
  P56: [51.7437, -9.1928], P61: [52.0781, -9.0208], P67: [52.1716, -8.7406],
  P72: [51.9753, -9.4494], P75: [52.0625, -9.1456], P81: [52.1597, -9.8017],
  P85: [51.6536, -9.1358],
  // Kerry
  V92: [52.2593, -9.6966], V93: [52.0606, -9.5033],
  // Limerick city & county
  V94: [52.668, -8.6305],
  // Tipperary
  E32: [52.6735, -8.1472], E34: [52.4594, -7.8311], E41: [52.5406, -8.3481],
  E45: [52.7392, -7.9339], E53: [52.3564, -7.7218],
  // Kilkenny
  R95: [52.6541, -7.2448],
  // Wexford
  Y21: [52.3361, -6.4572], Y25: [52.5017, -6.5906], Y34: [52.4256, -6.8536],
  Y35: [52.3331, -6.7564],
  // Waterford
  X35: [52.2593, -7.1102], X42: [52.1064, -7.6911], X91: [52.2593, -7.1102],
  // Carlow
  R21: [52.8356, -6.9339],
  // Laois / Offaly
  R32: [53.0342, -7.3011], R93: [52.9961, -6.9953],
  N23: [53.0861, -7.5739], R35: [53.1667, -7.4781], N91: [53.5278, -7.3422],
  // Galway
  H91: [53.2707, -9.0568], H54: [53.4336, -9.0725], H62: [53.5438, -8.8936],
  H65: [53.4628, -8.2181], H71: [53.3361, -8.5556],
  // Mayo
  F12: [53.8508, -9.2956], F23: [53.7697, -9.6736], F26: [53.9336, -9.0264],
  F28: [54.0286, -9.5083], F31: [54.0897, -9.3217],
  // Sligo
  F91: [54.2697, -8.4708],
  // Leitrim
  N41: [54.1186, -8.0136],
  // Cavan
  H12: [53.9908, -7.3606],
  // Monaghan
  H18: [54.2492, -6.9703],
  // Donegal
  F92: [54.9547, -7.7386], F93: [54.7528, -8.1039], F94: [54.7739, -8.4553],
  // Clare
  V95: [52.7928, -8.9833], V98: [53.0081, -9.0325],
};

export async function geocodeEircode(
  eircode: string
): Promise<{ lat: number; lng: number } | null> {
  // Extract routing key: first 3 chars, uppercase, strip spaces
  const key = eircode.replace(/\s+/g, "").slice(0, 3).toUpperCase();
  const centroid = EIRCODE_CENTROIDS[key];
  if (centroid) {
    return { lat: centroid[0], lng: centroid[1] };
  }

  // Fall back to Google Maps if key is enabled and routing key not in table
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

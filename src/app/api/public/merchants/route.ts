import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { geocodeEircode, haversineKm } from "@/lib/geo";

export async function GET(req: NextRequest) {
  const eircode = req.nextUrl.searchParams.get("eircode")?.trim() ?? "";

  try {
    let userCoords: { lat: number; lng: number } | null = null;
    if (eircode) userCoords = await geocodeEircode(eircode);

    const merchants = await prisma.merchant.findMany({
      where: { isActive: true },
      include: { merchantHours: { orderBy: { dayOfWeek: "asc" } } },
      orderBy: { name: "asc" },
    });

    const data = merchants.map((m) => ({
      id: m.id,
      name: m.name,
      address: m.address,
      eircode: m.eircode,
      phone: m.phone,
      description: m.description,
      lat: m.lat,
      lng: m.lng,
      distanceKm:
        userCoords && m.lat != null && m.lng != null
          ? Math.round(haversineKm(userCoords.lat, userCoords.lng, m.lat, m.lng) * 10) / 10
          : null,
      hours: m.merchantHours,
    }));

    if (userCoords) {
      data.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    }

    return Response.json({ merchants: data });
  } catch (error) {
    console.error("[Public Merchants Error]", error);
    return Response.json({ error: "Failed to fetch merchants" }, { status: 500 });
  }
}

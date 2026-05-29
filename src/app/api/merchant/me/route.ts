import { prisma } from "@/lib/prisma";
import { requireMerchantSession } from "@/lib/merchant-auth";
import { geocodeEircode } from "@/lib/geocode";

export async function GET() {
  try {
    const session = await requireMerchantSession();
    const merchant = await prisma.merchant.findUnique({
      where: { id: session.merchantId },
      select: { id: true, name: true, email: true, phone: true, address: true, eircode: true, description: true, lat: true, lng: true, isActive: true, mustChangePassword: true },
    });
    if (!merchant) return Response.json({ error: "商家不存在" }, { status: 404 });
    return Response.json({ merchant });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireMerchantSession();
    const body = await req.json();
    const { name, phone, address, eircode, description } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name.trim();
    if (phone !== undefined) data.phone = phone?.trim() || null;
    if (address !== undefined) data.address = address?.trim() || null;
    if (description !== undefined) data.description = description?.trim() || null;

    if (eircode !== undefined) {
      const clean = eircode?.trim().toUpperCase() || null;
      data.eircode = clean;
      if (clean) {
        const coords = await geocodeEircode(clean);
        data.lat = coords?.lat ?? null;
        data.lng = coords?.lng ?? null;
      } else {
        data.lat = null;
        data.lng = null;
      }
    }

    const merchant = await prisma.merchant.update({
      where: { id: session.merchantId },
      data,
      select: { id: true, name: true, email: true, phone: true, address: true, eircode: true, description: true, lat: true, lng: true },
    });

    return Response.json({ merchant });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[Merchant PATCH /me]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

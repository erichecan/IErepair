import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { merchants } from "@/lib/db/schema/merchants";
import { eircodeToCoords } from "@/lib/geo";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "merchant") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const merchant = await db.query.merchants.findFirst({
    where: eq(merchants.id, session.user.merchantId!),
  });
  if (!merchant) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  const { passwordHash: _ph, ...safe } = merchant;
  return NextResponse.json({ success: true, data: safe });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "merchant") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    shopName, phone, description, address, city, eircode,
    businessHours, slotDurationMin, maxAdvanceDays,
  } = body;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (shopName)         updates.shopName = shopName;
  if (phone)            updates.phone = phone;
  if (description !== undefined) updates.description = description;
  if (address)          updates.address = address;
  if (city)             updates.city = city;
  if (businessHours)    updates.businessHours = businessHours;
  if (slotDurationMin)  updates.slotDurationMin = slotDurationMin;
  if (maxAdvanceDays)   updates.maxAdvanceDays = maxAdvanceDays;

  // If eircode changed, geocode it and update PostGIS location
  if (eircode) {
    updates.eircode = eircode.toUpperCase();
    try {
      const coords = await eircodeToCoords(eircode);
      // Use raw SQL to update the PostGIS geometry column
      await db.execute(
        sql`UPDATE merchants SET location = ST_MakePoint(${coords.lng}, ${coords.lat})::geography, eircode = ${eircode.toUpperCase()}, updated_at = NOW() WHERE id = ${session.user.merchantId}`
      );
      delete updates.eircode; // already updated via raw SQL
    } catch (e) {
      console.warn("[settings] Could not geocode eircode:", e);
    }
  }

  const [updated] = await db
    .update(merchants)
    .set(updates as Parameters<typeof db.update>[0])
    .where(eq(merchants.id, session.user.merchantId!))
    .returning();

  const { passwordHash: _ph, ...safe } = updated;
  return NextResponse.json({ success: true, data: safe });
}

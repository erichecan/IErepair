import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { merchants } from "@/lib/db/schema/merchants";
import { eircodeToCoords } from "@/lib/geo";
import { eq, ilike, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q      = searchParams.get("q") ?? "";
  const status = searchParams.get("status");

  const rows = await db
    .select({
      id: merchants.id, slug: merchants.slug, shopName: merchants.shopName,
      email: merchants.email, phone: merchants.phone, city: merchants.city,
      eircode: merchants.eircode, status: merchants.status, rating: merchants.rating,
      reviewCount: merchants.reviewCount, createdAt: merchants.createdAt,
    })
    .from(merchants)
    .where(
      q ? ilike(merchants.shopName, `%${q}%`) : undefined,
    )
    .orderBy(merchants.createdAt)
    .limit(100);

  return NextResponse.json({ success: true, data: rows });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { shopName, email, password, phone, address, city, eircode } = body as {
    shopName: string; email: string; password: string;
    phone?: string; address?: string; city?: string; eircode?: string;
  };

  if (!shopName || !email || !password) {
    return NextResponse.json({ success: false, error: "shopName, email, password required" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const slug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

  const [merchant] = await db.insert(merchants).values({
    slug, shopName, email, passwordHash,
    phone, address, city, eircode: eircode?.toUpperCase(),
    status: "pending",
  }).returning({ id: merchants.id, slug: merchants.slug, email: merchants.email, status: merchants.status });

  // Geocode eircode if provided
  if (eircode) {
    try {
      const coords = await eircodeToCoords(eircode);
      await db.execute(
        sql`UPDATE merchants SET location = ST_MakePoint(${coords.lng}, ${coords.lat})::geography WHERE id = ${merchant.id}`
      );
    } catch { /* non-fatal */ }
  }

  return NextResponse.json({ success: true, data: merchant }, { status: 201 });
}

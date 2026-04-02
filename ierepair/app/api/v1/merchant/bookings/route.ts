import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { repairBookings } from "@/lib/db/schema/bookings";
import { eq, and, desc, gte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "merchant") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const date   = searchParams.get("date"); // YYYY-MM-DD

  const conditions = [eq(repairBookings.merchantId, session.user.merchantId!)];
  if (status) conditions.push(eq(repairBookings.status, status as never));
  if (date) {
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end   = new Date(date); end.setHours(23, 59, 59, 999);
    conditions.push(gte(repairBookings.scheduledAt, start));
  }

  const bookings = await db.query.repairBookings.findMany({
    where: and(...conditions),
    orderBy: [desc(repairBookings.scheduledAt)],
    limit: 100,
  });

  return NextResponse.json({ success: true, data: bookings });
}

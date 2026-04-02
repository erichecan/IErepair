import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { merchants } from "@/lib/db/schema/merchants";
import { eq } from "drizzle-orm";

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

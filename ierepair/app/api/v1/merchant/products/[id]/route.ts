import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { merchantProducts } from "@/lib/db/schema/products";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || session.user.role !== "merchant") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { price, stock, isAvailable } = body as { price?: number; stock?: number; isAvailable?: boolean };

  const [updated] = await db
    .update(merchantProducts)
    .set({
      ...(price !== undefined && { price: price.toString() }),
      ...(stock !== undefined && { stock }),
      ...(isAvailable !== undefined && { isAvailable }),
      updatedAt: new Date(),
    })
    .where(and(eq(merchantProducts.id, id), eq(merchantProducts.merchantId, session.user.merchantId!)))
    .returning();

  if (!updated) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || session.user.role !== "merchant") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await db.delete(merchantProducts).where(
    and(eq(merchantProducts.id, id), eq(merchantProducts.merchantId, session.user.merchantId!)),
  );

  return NextResponse.json({ success: true });
}

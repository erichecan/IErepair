import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { merchants, merchantProducts, products, merchantServices, repairServices } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Support lookup by id or slug
    const merchant = await db.query.merchants.findFirst({
      where: (t, { or, eq }) => or(eq(t.id, id), eq(t.slug, id)),
    });
    if (!merchant || merchant.status !== "active") {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    // Products offered by this merchant
    const storeProducts = await db
      .select({
        merchantProductId: merchantProducts.id,
        price:    merchantProducts.price,
        stock:    merchantProducts.stock,
        productId:   products.id,
        productName: products.name,
        productSlug: products.slug,
        imageUrls:   products.imageUrls,
        type:        products.type,
      })
      .from(merchantProducts)
      .innerJoin(products, eq(merchantProducts.productId, products.id))
      .where(
        and(
          eq(merchantProducts.merchantId, merchant.id),
          eq(merchantProducts.isAvailable, true),
          eq(products.status, "active"),
        ),
      )
      .limit(50);

    // Repair services offered by this merchant
    const storeServices = await db
      .select({
        merchantServiceId: merchantServices.id,
        price:         merchantServices.price,
        depositAmount: merchantServices.depositAmount,
        serviceId:     repairServices.id,
        serviceName:   repairServices.name,
        deviceModel:   repairServices.deviceModel,
        deviceBrand:   repairServices.deviceBrand,
        estimatedMin:  repairServices.estimatedMin,
        imageUrl:      repairServices.imageUrl,
      })
      .from(merchantServices)
      .innerJoin(repairServices, eq(merchantServices.repairServiceId, repairServices.id))
      .where(
        and(
          eq(merchantServices.merchantId, merchant.id),
          eq(merchantServices.isAvailable, true),
          eq(repairServices.isActive, true),
        ),
      );

    // Remove password hash from response
    const { passwordHash: _ph, ...safeMerchant } = merchant;

    return NextResponse.json({
      success: true,
      data: { merchant: safeMerchant, products: storeProducts, services: storeServices },
    });
  } catch (err) {
    console.error("[stores/id]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

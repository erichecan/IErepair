import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) return Response.json({ error: "无效ID" }, { status: 400 });

    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
    if (typeof body.nameEn === "string") updates.nameEn = body.nameEn.trim() || null;
    if (typeof body.description === "string") updates.description = body.description.trim() || null;
    if (typeof body.brand === "string") updates.brand = body.brand.trim() || null;
    if (typeof body.isActive === "boolean") updates.isActive = body.isActive;
    if (typeof body.status === "string") updates.status = body.status;
    if (typeof body.notes === "string") updates.notes = body.notes.trim() || null;
    if (body.basePriceMin != null) updates.basePriceMin = body.basePriceMin;
    if (body.basePriceMin === null) updates.basePriceMin = null;
    if (body.basePriceMax != null) updates.basePriceMax = body.basePriceMax;
    if (body.basePriceMax === null) updates.basePriceMax = null;
    if (typeof body.categoryId === "number") updates.categoryId = body.categoryId;

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "无有效更新字段" }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: updates,
      include: { category: { select: { id: true, name: true } } },
    });

    return Response.json({
      product: {
        ...product,
        basePriceMin: product.basePriceMin ? Number(product.basePriceMin) : null,
        basePriceMax: product.basePriceMax ? Number(product.basePriceMax) : null,
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[Product PATCH]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) return Response.json({ error: "无效ID" }, { status: 400 });

    await prisma.product.delete({ where: { id: productId } });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

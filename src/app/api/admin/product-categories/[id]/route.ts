import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const catId = parseInt(id);
    if (isNaN(catId)) return Response.json({ error: "无效ID" }, { status: 400 });

    const body = await req.json();
    const updates: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
    if (typeof body.nameEn === "string" && body.nameEn.trim()) updates.nameEn = body.nameEn.trim();
    if (typeof body.sortOrder === "number") updates.sortOrder = body.sortOrder;

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "无有效更新字段" }, { status: 400 });
    }

    const category = await prisma.productCategory.update({
      where: { id: catId },
      data: updates,
      include: { _count: { select: { products: true } } },
    });
    return Response.json({ category });
  } catch (error) {
    if (error instanceof Response) return error;
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
    const catId = parseInt(id);
    if (isNaN(catId)) return Response.json({ error: "无效ID" }, { status: 400 });

    const count = await prisma.product.count({ where: { categoryId: catId } });
    if (count > 0) {
      return Response.json({ error: `该品类下还有 ${count} 个商品，请先移除商品再删除品类` }, { status: 409 });
    }

    await prisma.productCategory.delete({ where: { id: catId } });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

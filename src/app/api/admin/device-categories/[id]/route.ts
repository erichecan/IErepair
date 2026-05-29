import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const catId = parseInt(id);
    if (isNaN(catId)) return Response.json({ error: "无效ID" }, { status: 400 });

    const counts = await prisma.deviceCategory.findUnique({
      where: { id: catId },
      select: { _count: { select: { brands: true, repairTypes: true } } },
    });
    if (!counts) return Response.json({ error: "分类不存在" }, { status: 404 });

    const total = counts._count.brands + counts._count.repairTypes;
    if (total > 0) {
      return Response.json(
        { error: `无法删除：该分类下还有 ${counts._count.brands} 个品牌和 ${counts._count.repairTypes} 个维修类型` },
        { status: 409 }
      );
    }

    await prisma.deviceCategory.delete({ where: { id: catId } });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[DeviceCategory DELETE]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

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

    const category = await prisma.deviceCategory.update({
      where: { id: catId },
      data: updates,
      include: { _count: { select: { brands: true, repairTypes: true } } },
    });
    return Response.json({ category });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

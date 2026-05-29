import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const rtId = parseInt(id);
    if (isNaN(rtId)) return Response.json({ error: "无效ID" }, { status: 400 });

    const body = await req.json();
    const updates: { name?: string; nameEn?: string; sortOrder?: number } = {};
    if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
    if (typeof body.nameEn === "string" && body.nameEn.trim()) updates.nameEn = body.nameEn.trim();
    if (typeof body.sortOrder === "number") updates.sortOrder = body.sortOrder;

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "无有效更新字段" }, { status: 400 });
    }

    const repairType = await prisma.repairType.update({ where: { id: rtId }, data: updates });
    return Response.json({ repairType });
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
    const rtId = parseInt(id);
    if (isNaN(rtId)) return Response.json({ error: "无效ID" }, { status: 400 });

    const count = await prisma.repairService.count({ where: { repairTypeId: rtId } });
    if (count > 0) {
      return Response.json({ error: `无法删除：已有 ${count} 条维修服务使用此类型` }, { status: 409 });
    }

    await prisma.repairType.delete({ where: { id: rtId } });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

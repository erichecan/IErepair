import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const brandId = parseInt(id);
    if (isNaN(brandId)) return Response.json({ error: "无效ID" }, { status: 400 });

    const count = await prisma.deviceModel.count({ where: { brandId } });
    if (count > 0) {
      return Response.json({ error: `无法删除：该品牌下还有 ${count} 个型号` }, { status: 409 });
    }

    await prisma.deviceBrand.delete({ where: { id: brandId } });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[DeviceBrand DELETE]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

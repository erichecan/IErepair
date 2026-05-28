import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ categoryId: string; brandId: string; modelId: string }> }
) {
  try {
    await requireAdminSession();

    const { modelId } = await params;
    const id = parseInt(modelId);
    if (isNaN(id)) return Response.json({ error: "无效ID" }, { status: 400 });

    const services = await prisma.repairService.findMany({
      where: { deviceModelId: id },
      orderBy: { repairType: { sortOrder: "asc" } },
      include: { repairType: true },
    });

    return Response.json({ services });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[Services API Error]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
